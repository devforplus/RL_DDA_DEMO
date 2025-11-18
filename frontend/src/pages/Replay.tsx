import { useState, useMemo, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { darkTheme, lightTheme } from '../theme/colors'

// 모델 정의
const MODELS = [
    { id: 'beginner', name: '초급 (Beginner)', skillLevel: 0.05 },
    { id: 'medium', name: '중급 (Medium)', skillLevel: 0.5 },
    { id: 'master', name: '고급 (Master)', skillLevel: 0.95 },
]

export default function Replay() {
    const { theme } = useTheme()
    const colors = theme === 'dark' ? darkTheme : lightTheme

    const [isPlaying, setIsPlaying] = useState(false)
    const [replayData, setReplayData] = useState<any>(null)
    const [selectedModel, setSelectedModel] = useState<string>('beginner')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const pyxappUrl = useMemo(() => '/game.pyxapp', [])
    const iframeSrc = useMemo(
        () => `/pyxel/console.html?app=${encodeURIComponent(pyxappUrl)}`,
        [pyxappUrl]
    )

    // 선택한 모델의 JSON 파일 로드
    const loadModelReplay = async (modelId: string) => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/models/${modelId}.json`)
            if (!response.ok) {
                throw new Error(`Failed to load model: ${response.statusText}`)
            }

            const data = await response.json()
            setReplayData(data)
            console.log('Model replay data loaded:', data)
            console.log(`  - Frames: ${data.frames?.length || 0}`)
            console.log(`  - Enemy events: ${data.enemy_events?.length || 0}`)
            return data
        } catch (e) {
            console.error('Failed to load model replay:', e)
            setError(`모델 데이터를 로드하는데 실패했습니다: ${e}`)
            return null
        } finally {
            setLoading(false)
        }
    }

    // 모델 선택 시 자동으로 데이터 로드
    useEffect(() => {
        loadModelReplay(selectedModel)
    }, [selectedModel])

    // 리플레이 시작
    const startReplay = async () => {
        let data = replayData

        // 데이터가 없으면 로드
        if (!data) {
            data = await loadModelReplay(selectedModel)
        }

        if (!data) return

        // localStorage에 리플레이 데이터 설정
        localStorage.setItem('pyxelReplayData', JSON.stringify(data))
        localStorage.setItem('pyxelReplayMode', 'true')

        console.log('Starting replay...')
        setIsPlaying(true)
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
            <h2 style={{ marginBottom: 32, color: colors.text }}>🎬 모델 리플레이</h2>

            {/* 모델 선택 */}
            <div style={{
                marginBottom: 24,
                padding: 24,
                background: colors.cardBg,
                borderRadius: 12,
                border: `1px solid ${colors.cardBorder}`,
                width: '100%',
                maxWidth: 768,
            }}>
                <h3 style={{ margin: '0 0 16px 0', color: colors.primary, fontSize: 18 }}>모델 선택</h3>
                <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    disabled={isPlaying}
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: 16,
                        borderRadius: 8,
                        border: `2px solid ${colors.inputBorder}`,
                        background: colors.inputBg,
                        color: colors.inputText,
                        cursor: isPlaying ? 'not-allowed' : 'pointer',
                    }}
                >
                    {MODELS.map(model => (
                        <option key={model.id} value={model.id}>
                            {model.name} (Skill: {model.skillLevel})
                        </option>
                    ))}
                </select>
            </div>

            {/* 에러 메시지 */}
            {error && (
                <div style={{
                    marginBottom: 24,
                    padding: 16,
                    background: colors.errorBg,
                    borderRadius: 8,
                    color: colors.text,
                    maxWidth: 768,
                    width: '100%',
                }}>
                    {error}
                </div>
            )}

            {/* 리플레이 정보 */}
            {replayData && !loading && (
                <div style={{
                    marginBottom: 24,
                    padding: 24,
                    background: colors.cardBg,
                    borderRadius: 12,
                    border: `1px solid ${colors.cardBorder}`,
                    color: colors.text,
                    width: '100%',
                    maxWidth: 768,
                }}>
                    <h3 style={{ margin: '0 0 16px 0', color: colors.primary }}>리플레이 정보</h3>
                    <div style={{ display: 'grid', gap: 8, fontSize: 15 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: colors.textSecondary }}>모델:</span>
                            <strong>{replayData.metadata?.model_name || selectedModel}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: colors.textSecondary }}>스킬 레벨:</span>
                            <strong>{replayData.metadata?.skill_level || 'N/A'}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: colors.textSecondary }}>최종 점수:</span>
                            <strong style={{ color: colors.primary }}>{replayData.score}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: colors.textSecondary }}>최종 스테이지:</span>
                            <strong>{replayData.final_stage}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: colors.textSecondary }}>총 프레임:</span>
                            <strong>{replayData.statistics?.total_frames || replayData.frames?.length}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: colors.textSecondary }}>플레이 시간:</span>
                            <strong>{replayData.statistics?.play_duration?.toFixed(1)}초</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: colors.textSecondary }}>적 이벤트:</span>
                            <strong style={{ color: colors.primary }}>{replayData.enemy_events?.length || 0}개</strong>
                        </div>
                    </div>
                </div>
            )}

            {/* 로딩 표시 */}
            {loading && (
                <div style={{
                    marginBottom: 24,
                    padding: 24,
                    background: colors.cardBg,
                    borderRadius: 12,
                    textAlign: 'center',
                    color: colors.textSecondary,
                    maxWidth: 768,
                    width: '100%',
                }}>
                    모델 데이터를 로드하는 중...
                </div>
            )}

            {/* 게임 화면 */}
            <div style={{ position: 'relative', width: 768, height: 576, background: colors.cardBg, borderRadius: 12, overflow: 'hidden', boxShadow: `0 8px 32px ${colors.shadowStrong}` }}>
                {!isPlaying && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                        <button
                            onClick={startReplay}
                            disabled={loading || !replayData}
                            style={{
                                padding: '14px 24px',
                                borderRadius: 8,
                                border: 'none',
                                background: (loading || !replayData) ? colors.textTertiary : colors.primary,
                                color: '#fff',
                                fontSize: 18,
                                fontWeight: 600,
                                cursor: (loading || !replayData) ? 'not-allowed' : 'pointer',
                                boxShadow: (loading || !replayData) ? 'none' : `0 2px 10px ${colors.shadow}`,
                            }}
                        >
                            {loading ? '로딩 중...' : '▶ 리플레이 시작'}
                        </button>
                        {!replayData && !loading && (
                            <div style={{ color: colors.textSecondary, fontSize: 14 }}>
                                모델을 선택하면 자동으로 데이터가 로드됩니다
                            </div>
                        )}
                    </div>
                )}
                {isPlaying && (
                    <iframe
                        title="pyxel-game-replay"
                        src={iframeSrc}
                        width={768}
                        height={576}
                        style={{ border: 'none' }}
                        allow="autoplay; fullscreen; gamepad"
                    />
                )}
            </div>

            {/* 사용 방법 */}
            <div style={{
                marginTop: 24,
                padding: 24,
                background: colors.sidebarBg,
                borderRadius: 12,
                border: `1px solid ${colors.sidebarBorder}`,
                color: colors.textSecondary,
                maxWidth: 768,
                width: '100%'
            }}>
                <h3 style={{ margin: '0 0 16px 0', color: colors.text, fontSize: 18 }}>📝 사용 방법</h3>
                <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8, fontSize: 15 }}>
                    <li>위에서 리플레이할 모델을 선택하세요 (초급/중급/고급)</li>
                    <li>선택하면 자동으로 해당 모델의 플레이 데이터가 로드됩니다</li>
                    <li>"리플레이 시작" 버튼을 클릭하세요</li>
                    <li>AI 에이전트의 플레이가 자동으로 재생됩니다</li>
                    <li>모든 모델은 동일한 적 패턴을 경험하지만, 각 모델의 스킬 레벨에 따라 다른 전략을 사용합니다</li>
                </ol>

                <div style={{
                    marginTop: 16,
                    padding: 12,
                    background: colors.sidebarSection,
                    borderRadius: 6,
                    border: `1px solid ${colors.primary}`,
                }}>
                    <div style={{ fontSize: 13, color: colors.textTertiary, marginBottom: 4 }}>💡 Tip</div>
                    <div style={{ fontSize: 13, color: colors.textTertiary, lineHeight: 1.6 }}>
                        각 모델의 적 이벤트 수가 동일하면 모든 모델이 같은 적 패턴을 경험했다는 뜻입니다.
                    </div>
                </div>
            </div>
        </div>
    )
}



