import { useParams } from 'react-router-dom'
import { useMemo, useState, useEffect } from 'react'
import { streamUrlForModel } from '../config'
import MjpegViewer from '../components/MjpegViewer'
import {
    submitGamePlayData,
    type GameStatistics,
    type GamePlayFrame
} from '../api/scores'

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
            background: '#0a0a0a'
        }}>
            <h2 style={{ marginBottom: 32, color: '#fff' }}>🎮 플레이</h2>
            <div style={{ position: 'relative', width: 768, height: 576, background: '#111', borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                {!isRunning && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <button
                            onClick={() => setIsRunning(true)}
                            style={{ padding: '14px 18px', borderRadius: 8, border: 'none', background: '#5a62f1', color: '#fff', fontSize: 18 }}
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

            {showSubmit && gameData && (
                <div style={{
                    display: 'grid',
                    gap: 16,
                    width: '100%',
                    maxWidth: 768,
                    marginTop: 32,
                    padding: 32,
                    background: '#1a1a2e',
                    borderRadius: 16,
                    border: '2px solid #5a62f1',
                    boxShadow: '0 8px 32px rgba(90, 98, 241, 0.4)'
                }}>
                    <h3 style={{ margin: 0, color: '#5a62f1', fontSize: 24, textAlign: 'center' }}>🎮 게임 종료!</h3>

                    <div style={{ display: 'grid', gap: 10, fontSize: 15 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e0e0e0' }}>
                            <span>최종 점수:</span>
                            <strong style={{ color: '#6b73ff', fontSize: 18 }}>{gameData.score}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e0e0e0' }}>
                            <span>도달 스테이지:</span>
                            <strong style={{ color: '#ffffff' }}>{gameData.final_stage}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e0e0e0' }}>
                            <span>플레이 시간:</span>
                            <strong style={{ color: '#ffffff' }}>{gameData.statistics.play_duration.toFixed(1)}초</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e0e0e0' }}>
                            <span>적 처치:</span>
                            <strong style={{ color: '#ffffff' }}>{gameData.statistics.enemies_destroyed}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e0e0e0' }}>
                            <span>명중률:</span>
                            <strong style={{ color: '#ffffff' }}>
                                {gameData.statistics.shots_fired > 0
                                    ? ((gameData.statistics.hits / gameData.statistics.shots_fired) * 100).toFixed(1)
                                    : '0'}%
                            </strong>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid #4a4d65', paddingTop: 16 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, color: '#e0e0e0', fontSize: 15 }}>
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
                                border: '2px solid #4a4d65',
                                background: '#1a1d35',
                                color: '#ffffff',
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
                            background: submitting || !nickname.trim() ? '#5a5a6a' : '#6b73ff',
                            color: '#ffffff',
                            fontSize: 16,
                            fontWeight: 600,
                            cursor: submitting || !nickname.trim() ? 'not-allowed' : 'pointer',
                            transition: 'background 0.2s',
                            boxShadow: submitting || !nickname.trim() ? 'none' : '0 2px 10px rgba(107, 115, 255, 0.4)'
                        }}
                    >
                        {submitting ? '등록 중...' : '점수 등록'}
                    </button>

                    {submitMessage && (
                        <div style={{
                            padding: 12,
                            borderRadius: 8,
                            background: submitMessage.includes('✅') ? '#2d5a2d' : '#5a2d2d',
                            textAlign: 'center',
                            fontWeight: 500,
                            color: '#ffffff'
                        }}>
                            {submitMessage}
                        </div>
                    )}

                    <div style={{ fontSize: 13, color: '#b0b0c0', marginTop: 8 }}>
                        💡 등록하면 게임 플레이 데이터가 데이터베이스에 저장되고 리더보드에 표시됩니다.
                    </div>
                </div>
            )}
        </div>
    )
}


