import { useParams } from 'react-router-dom'
import { useMemo, useState, useEffect } from 'react'
import { streamUrlForModel } from '../config'
import MjpegViewer from '../components/MjpegViewer'
import { submitScore } from '../api/scores'

// 게임 데이터 타입 정의
interface GameData {
    score: number
    final_stage: number
    statistics: {
        total_frames: number
        play_duration: number
        enemies_destroyed: number
        shots_fired: number
        hits: number
        deaths: number
    }
    frames: Array<{
        frame_number: number
        player_x: number
        player_y: number
        player_lives: number
        player_score: number
        current_weapon: number
        input_left: number
        input_right: number
        input_up: number
        input_down: number
        input_button1: number
        input_button2: number
        stage_num: number
        timestamp: number
    }>
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
            // 점수와 통계 정보를 백엔드로 전송
            const res = await submitScore({
                nickname: nickname.trim(),
                score: gameData.score,
                modelId,
            })

            if ('ok' in res && res.ok) {
                setSubmitMessage('✅ 점수가 등록되었습니다!')

                // 게임 플레이 데이터를 JSON 파일로 다운로드
                const dataStr = JSON.stringify(gameData, null, 2)
                const dataBlob = new Blob([dataStr], { type: 'application/json' })
                const url = URL.createObjectURL(dataBlob)
                const link = document.createElement('a')
                link.href = url
                link.download = `gameplay_${nickname}_${gameData.score}_${new Date().getTime()}.json`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)

                // 3초 후 UI 초기화
                setTimeout(() => {
                    setShowSubmit(false)
                    setNickname('')
                    setGameData(null)
                    setSubmitMessage('')
                }, 3000)
            } else {
                setSubmitMessage('❌ 점수 등록에 실패했습니다. 다시 시도해주세요.')
            }
        } catch (error) {
            console.error('Submit error:', error)
            setSubmitMessage('❌ 네트워크 오류가 발생했습니다.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div>
            <h2>플레이</h2>
            <div>선택된 모델: {modelId ?? '(없음)'}</div>
            <div style={{ position: 'relative', width: 512, height: 384, marginTop: 12, background: '#111' }}>
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
                            width={512}
                            height={384}
                            style={{ border: 'none' }}
                            allow="autoplay; fullscreen; gamepad"
                        />
                        {streamUrl && (
                            <div style={{ marginTop: 8 }}>
                                <MjpegViewer src={streamUrl} width={512} height={384} />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {showSubmit && gameData && (
                <div style={{
                    display: 'grid',
                    gap: 16,
                    maxWidth: 600,
                    marginTop: 24,
                    padding: 24,
                    background: '#1a1a2e',
                    borderRadius: 12,
                    border: '2px solid #5a62f1'
                }}>
                    <h3 style={{ margin: 0, color: '#5a62f1' }}>🎮 게임 종료!</h3>

                    <div style={{ display: 'grid', gap: 8, fontSize: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>최종 점수:</span>
                            <strong style={{ color: '#5a62f1', fontSize: 16 }}>{gameData.score}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>도달 스테이지:</span>
                            <strong>{gameData.final_stage}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>플레이 시간:</span>
                            <strong>{gameData.statistics.play_duration.toFixed(1)}초</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>적 처치:</span>
                            <strong>{gameData.statistics.enemies_destroyed}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>명중률:</span>
                            <strong>
                                {gameData.statistics.shots_fired > 0
                                    ? ((gameData.statistics.hits / gameData.statistics.shots_fired) * 100).toFixed(1)
                                    : '0'}%
                            </strong>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid #333', paddingTop: 16 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
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
                                border: '2px solid #333',
                                background: '#0f0f1e',
                                color: '#fff',
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
                            background: submitting || !nickname.trim() ? '#666' : '#5a62f1',
                            color: '#fff',
                            fontSize: 16,
                            fontWeight: 600,
                            cursor: submitting || !nickname.trim() ? 'not-allowed' : 'pointer',
                            transition: 'background 0.2s'
                        }}
                    >
                        {submitting ? '등록 중...' : '점수 등록 및 플레이 데이터 다운로드'}
                    </button>

                    {submitMessage && (
                        <div style={{
                            padding: 12,
                            borderRadius: 8,
                            background: submitMessage.includes('✅') ? '#1a4d1a' : '#4d1a1a',
                            textAlign: 'center',
                            fontWeight: 500
                        }}>
                            {submitMessage}
                        </div>
                    )}

                    <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
                        💡 등록하면 게임 플레이 데이터가 JSON 파일로 자동 다운로드됩니다.
                    </div>
                </div>
            )}
        </div>
    )
}


