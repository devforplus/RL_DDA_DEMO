import { useParams } from 'react-router-dom'
import { useMemo, useState, useEffect } from 'react'
import { streamUrlForModel } from '../config'
import MjpegViewer from '../components/MjpegViewer'
import {
    submitGamePlayData,
    type GameStatistics,
    type GamePlayFrame
} from '../api/scores'
import { useTheme } from '../contexts/ThemeContext'
import { darkTheme, lightTheme } from '../theme/colors'

// 게임 데이터 타입 정의 (Pyxel에서 받는 데이터)
interface GameData {
    score: number
    final_stage: number
    statistics: GameStatistics
    frames: GamePlayFrame[]
}

// window 객체 타입 확장
declare global {
    interface Window {
        pyxelGameCompleted?: boolean
        pyxelGameData?: string
    }
}

export default function Play() {
    const { theme } = useTheme()
    const colors = theme === 'dark' ? darkTheme : lightTheme
    
    const params = useParams()
    const modelId = params.modelId as string | undefined
    const [isRunning, setIsRunning] = useState(false)
    const [showSubmit, setShowSubmit] = useState(false)
    const [nickname, setNickname] = useState('')
    const [gameData, setGameData] = useState<GameData | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [submitMessage, setSubmitMessage] = useState('')

    const pyxappUrl = useMemo(() => '/game.pyxapp', [])
    const iframeSrc = useMemo(
        () => `/pyxel/console.html?app=${encodeURIComponent(pyxappUrl)}`,
        [pyxappUrl]
    )
    const streamUrl = useMemo(() => streamUrlForModel(modelId) ?? '', [modelId])

    // 게임 완료 감지 - localStorage 폴링
    useEffect(() => {
        if (!isRunning) return

        let lastTimestamp = localStorage.getItem('pyxelGameTimestamp') || '0'

        const checkGameCompletion = () => {
            try {
                const completed = localStorage.getItem('pyxelGameCompleted')
                const gameDataStr = localStorage.getItem('pyxelGameData')
                const timestamp = localStorage.getItem('pyxelGameTimestamp') || '0'

                console.log('Checking game completion:', { completed, hasData: !!gameDataStr, timestamp })

                // 새로운 게임 완료 데이터 확인 (타임스탬프로 중복 체크)
                if (completed === 'true' && gameDataStr && timestamp !== lastTimestamp) {
                    console.log('Game completed detected!')

                    const data: GameData = JSON.parse(gameDataStr)
                    console.log('Game data:', data)

                    setGameData(data)
                    setShowSubmit(true)

                    // 타임스탬프 업데이트 (중복 처리 방지)
                    lastTimestamp = timestamp

                    // localStorage 클리어
                    localStorage.removeItem('pyxelGameCompleted')
                    localStorage.removeItem('pyxelGameData')
                }
            } catch (error) {
                console.error('Failed to check game completion:', error)
            }
        }

        // 초기 체크
        checkGameCompletion()

        // 500ms마다 체크
        const interval = setInterval(checkGameCompletion, 500)

        return () => {
            clearInterval(interval)
        }
    }, [isRunning])

    // 닉네임 제출 핸들러
    const handleSubmit = async () => {
        if (!gameData || !nickname.trim()) {
            setSubmitMessage('닉네임을 입력해주세요.')
            return
        }

        setSubmitting(true)
        setSubmitMessage('')

        try {
            // 게임 플레이 데이터 제출 (점수 포함)
            const result = await submitGamePlayData({
                nickname: nickname.trim(),
                score: gameData.score,
                final_stage: gameData.final_stage,
                model_id: modelId,
                statistics: gameData.statistics,
                frames: gameData.frames,
            })

            if ('ok' in result && result.ok) {
                setSubmitMessage('✅ 게임 데이터가 등록되었습니다!')

                // 3초 후 UI 초기화
                setTimeout(() => {
                    setShowSubmit(false)
                    setNickname('')
                    setGameData(null)
                    setSubmitMessage('')
                }, 3000)
            } else {
                const errorMsg = 'error' in result ? result.error : '알 수 없는 오류'
                setSubmitMessage(`❌ 등록 실패: ${errorMsg}`)
            }
        } catch (error) {
            console.error('Submit error:', error)
            setSubmitMessage('❌ 네트워크 오류가 발생했습니다.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '40px 20px',
            minHeight: 'calc(100vh - 60px)',
            background: colors.background
        }}>
            <h2 style={{ marginBottom: 32, color: colors.text }}>🎮 플레이</h2>
 
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', width: '100%', maxWidth: 1200, justifyContent: 'center' }}>
                {/* 메인 게임 영역 */}
                <div style={{ position: 'relative', width: 768, height: 576, background: colors.cardBg, borderRadius: 12, overflow: 'hidden', boxShadow: `0 8px 32px ${colors.shadowStrong}` }}>
                    {!isRunning && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <button
                                onClick={() => setIsRunning(true)}
                                style={{ padding: '14px 18px', borderRadius: 8, border: 'none', background: colors.primary, color: '#fff', fontSize: 18, cursor: 'pointer' }}
                            >
                                ▶ Run game
                            </button>
                        </div>
                    )}
                    {isRunning && (
                        <div style={{ display: 'grid', gap: 8 }}>
                            <iframe
                                title="pyxel-game"
                                src={iframeSrc}
                                width={768}
                                height={576}
                                style={{ border: 'none' }}
                                allow="autoplay; fullscreen; gamepad"
                            />
                            {streamUrl && (
                                <div style={{ marginTop: 8 }}>
                                    <MjpegViewer src={streamUrl} width={768} height={576} />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 조작법 사이드바 */}
                <div style={{
                    width: 280,
                    padding: 24,
                    background: colors.sidebarBg,
                    borderRadius: 12,
                    border: `1px solid ${colors.sidebarBorder}`,
                    boxShadow: `0 4px 16px ${colors.shadow}`
                }}>
                    <h3 style={{
                        margin: '0 0 20px 0',
                        color: colors.primary,
                        fontSize: 20,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}>
                        🎯 조작법
                    </h3>

                    <div style={{ display: 'grid', gap: 16 }}>
                        {/* 이동 조작 */}
                        <div>
                            <div style={{
                                fontSize: 13,
                                color: colors.textTertiary,
                                marginBottom: 8,
                                fontWeight: 500,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                이동
                            </div>
                            <div style={{ display: 'grid', gap: 6 }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '8px 12px',
                                    background: colors.sidebarSection,
                                    borderRadius: 6,
                                    border: `1px solid ${colors.sidebarSectionBorder}`
                                }}>
                                    <kbd style={{
                                        display: 'inline-block',
                                        padding: '4px 8px',
                                        background: colors.kbdBg,
                                        border: `1px solid ${colors.kbdBorder}`,
                                        borderRadius: 4,
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: colors.kbdText,
                                        minWidth: 24,
                                        textAlign: 'center'
                                    }}>W</kbd>
                                    <span style={{ color: colors.textSecondary, fontSize: 14 }}>위로</span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '8px 12px',
                                    background: colors.sidebarSection,
                                    borderRadius: 6,
                                    border: `1px solid ${colors.sidebarSectionBorder}`
                                }}>
                                    <kbd style={{
                                        display: 'inline-block',
                                        padding: '4px 8px',
                                        background: colors.kbdBg,
                                        border: `1px solid ${colors.kbdBorder}`,
                                        borderRadius: 4,
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: colors.kbdText,
                                        minWidth: 24,
                                        textAlign: 'center'
                                    }}>A</kbd>
                                    <span style={{ color: colors.textSecondary, fontSize: 14 }}>왼쪽</span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '8px 12px',
                                    background: colors.sidebarSection,
                                    borderRadius: 6,
                                    border: `1px solid ${colors.sidebarSectionBorder}`
                                }}>
                                    <kbd style={{
                                        display: 'inline-block',
                                        padding: '4px 8px',
                                        background: colors.kbdBg,
                                        border: `1px solid ${colors.kbdBorder}`,
                                        borderRadius: 4,
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: colors.kbdText,
                                        minWidth: 24,
                                        textAlign: 'center'
                                    }}>S</kbd>
                                    <span style={{ color: colors.textSecondary, fontSize: 14 }}>아래로</span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '8px 12px',
                                    background: colors.sidebarSection,
                                    borderRadius: 6,
                                    border: `1px solid ${colors.sidebarSectionBorder}`
                                }}>
                                    <kbd style={{
                                        display: 'inline-block',
                                        padding: '4px 8px',
                                        background: colors.kbdBg,
                                        border: `1px solid ${colors.kbdBorder}`,
                                        borderRadius: 4,
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: colors.kbdText,
                                        minWidth: 24,
                                        textAlign: 'center'
                                    }}>D</kbd>
                                    <span style={{ color: colors.textSecondary, fontSize: 14 }}>오른쪽</span>
                                </div>
                            </div>
                        </div>

                        {/* 액션 조작 */}
                        <div>
                            <div style={{
                                fontSize: 13,
                                color: colors.textTertiary,
                                marginBottom: 8,
                                fontWeight: 500,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                액션
                            </div>
                            <div style={{ display: 'grid', gap: 6 }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '8px 12px',
                                    background: colors.sidebarSection,
                                    borderRadius: 6,
                                    border: `1px solid ${colors.sidebarSectionBorder}`
                                }}>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <kbd style={{
                                            display: 'inline-block',
                                            padding: '4px 8px',
                                            background: colors.kbdBg,
                                            border: `1px solid ${colors.kbdBorder}`,
                                            borderRadius: 4,
                                            fontSize: 14,
                                            fontWeight: 600,
                                            color: colors.kbdText,
                                            minWidth: 24,
                                            textAlign: 'center'
                                        }}>Z</kbd>
                                        <span style={{ color: colors.textTertiary, fontSize: 12, alignSelf: 'center' }}>/</span>
                                        <kbd style={{
                                            display: 'inline-block',
                                            padding: '4px 8px',
                                            background: colors.kbdBg,
                                            border: `1px solid ${colors.kbdBorder}`,
                                            borderRadius: 4,
                                            fontSize: 14,
                                            fontWeight: 600,
                                            color: colors.kbdText,
                                            minWidth: 24,
                                            textAlign: 'center'
                                        }}>U</kbd>
                                    </div>
                                    <span style={{ color: colors.textSecondary, fontSize: 14 }}>탄환 발사</span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '8px 12px',
                                    background: colors.sidebarSection,
                                    borderRadius: 6,
                                    border: `1px solid ${colors.sidebarSectionBorder}`
                                }}>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <kbd style={{
                                            display: 'inline-block',
                                            padding: '4px 8px',
                                            background: colors.kbdBg,
                                            border: `1px solid ${colors.kbdBorder}`,
                                            borderRadius: 4,
                                            fontSize: 14,
                                            fontWeight: 600,
                                            color: colors.kbdText,
                                            minWidth: 24,
                                            textAlign: 'center'
                                        }}>X</kbd>
                                        <span style={{ color: colors.textTertiary, fontSize: 12, alignSelf: 'center' }}>/</span>
                                        <kbd style={{
                                            display: 'inline-block',
                                            padding: '4px 8px',
                                            background: colors.kbdBg,
                                            border: `1px solid ${colors.kbdBorder}`,
                                            borderRadius: 4,
                                            fontSize: 14,
                                            fontWeight: 600,
                                            color: colors.kbdText,
                                            minWidth: 24,
                                            textAlign: 'center'
                                        }}>I</kbd>
                                    </div>
                                    <span style={{ color: colors.textSecondary, fontSize: 14 }}>일시정지</span>
                                </div>
                            </div>
                        </div>

                        {/* 팁 */}
                        <div style={{
                            marginTop: 8,
                            padding: 12,
                            background: colors.sidebarSection,
                            borderRadius: 6,
                            border: `1px solid ${colors.primary}`
                        }}>
                            <div style={{ fontSize: 13, color: colors.textTertiary, marginBottom: 4 }}>💡 Tip</div>
                            <div style={{ fontSize: 12, color: colors.textTertiary, lineHeight: 1.6 }}>
                                게임 화면을 클릭하여 포커스를 맞춘 후 키보드 조작이 가능합니다.
                            </div>
                        </div>

                        {/* 출처 */}
                        <div style={{
                            marginTop: 8,
                            padding: 12,
                            background: colors.sidebarSection,
                            borderRadius: 6,
                            border: `1px solid ${colors.sidebarSectionBorder}`
                        }}>
                            <div style={{ fontSize: 13, color: colors.textTertiary, marginBottom: 6 }}>📦 출처</div>
                            <a 
                                href="https://github.com/helpcomputer/vortexion"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ 
                                    fontSize: 11, 
                                    color: colors.primary, 
                                    lineHeight: 1.5,
                                    textDecoration: 'none',
                                    wordBreak: 'break-all',
                                    display: 'block'
                                }}
                            >
                                github.com/helpcomputer/vortexion
                            </a>
                            <div style={{ 
                                fontSize: 11, 
                                color: colors.textTertiary, 
                                marginTop: 6,
                                fontStyle: 'italic'
                            }}>
                                Original game by badcomputer
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showSubmit && gameData && (
                <div style={{
                    display: 'grid',
                    gap: 16,
                    width: '100%',
                    maxWidth: 768,
                    marginTop: 32,
                    padding: 32,
                    background: colors.backgroundSecondary,
                    borderRadius: 16,
                    border: `2px solid ${colors.primary}`,
                    boxShadow: `0 8px 32px ${colors.shadow}`
                }}>
                    <h3 style={{ margin: 0, color: colors.primary, fontSize: 24, textAlign: 'center' }}>🎮 게임 종료!</h3>

                    <div style={{ display: 'grid', gap: 10, fontSize: 15 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.textSecondary }}>
                            <span>최종 점수:</span>
                            <strong style={{ color: colors.primary, fontSize: 18 }}>{gameData.score}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.textSecondary }}>
                            <span>도달 스테이지:</span>
                            <strong style={{ color: colors.text }}>{gameData.final_stage}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.textSecondary }}>
                            <span>플레이 시간:</span>
                            <strong style={{ color: colors.text }}>{gameData.statistics.play_duration.toFixed(1)}초</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.textSecondary }}>
                            <span>적 처치:</span>
                            <strong style={{ color: colors.text }}>{gameData.statistics.enemies_destroyed}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.textSecondary }}>
                            <span>명중률:</span>
                            <strong style={{ color: colors.text }}>
                                {gameData.statistics.shots_fired > 0
                                    ? ((gameData.statistics.hits / gameData.statistics.shots_fired) * 100).toFixed(1)
                                    : '0'}%
                            </strong>
                        </div>
                    </div>

                    <div style={{ borderTop: `1px solid ${colors.cardBorder}`, paddingTop: 16 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: colors.textSecondary, fontSize: 15 }}>
                            닉네임을 입력하여 점수를 등록하세요:
                        </label>
                        <input
                            placeholder="닉네임 입력"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                            disabled={submitting}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                fontSize: 16,
                                borderRadius: 8,
                                border: `2px solid ${colors.inputBorder}`,
                                background: colors.inputBg,
                                color: colors.inputText,
                                boxSizing: 'border-box'
                            }}
                            autoFocus
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !nickname.trim()}
                        style={{
                            padding: '14px 24px',
                            borderRadius: 8,
                            border: 'none',
                            background: submitting || !nickname.trim() ? colors.textTertiary : colors.primary,
                            color: '#ffffff',
                            fontSize: 16,
                            fontWeight: 600,
                            cursor: submitting || !nickname.trim() ? 'not-allowed' : 'pointer',
                            transition: 'background 0.2s',
                            boxShadow: submitting || !nickname.trim() ? 'none' : `0 2px 10px ${colors.shadow}`
                        }}
                    >
                        {submitting ? '등록 중...' : '점수 등록'}
                    </button>

                    {submitMessage && (
                        <div style={{
                            padding: 12,
                            borderRadius: 8,
                            background: submitMessage.includes('✅') ? colors.successBg : colors.errorBg,
                            textAlign: 'center',
                            fontWeight: 500,
                            color: colors.text
                        }}>
                            {submitMessage}
                        </div>
                    )}

                    <div style={{ fontSize: 13, color: colors.textTertiary, marginTop: 8 }}>
                        💡 등록하면 게임 플레이 데이터가 데이터베이스에 저장되고 리더보드에 표시됩니다.
                    </div>
                </div>
            )}
        </div>
    )
}


