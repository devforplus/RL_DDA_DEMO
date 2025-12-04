import { useState, useMemo, useRef, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { darkTheme, lightTheme } from '../theme/colors'

// 모델 정의
const MODELS = [
    { 
        id: 'beginner', 
        name: '초급 (Beginner)', 
        skillLevel: 0.1,
        steps: 441,
        score: 400,
        videoSrc: '/models/replay_ep2_steps_400_20251203_031340.mp4'
    },
    { 
        id: 'medium', 
        name: '중급 (Medium)', 
        skillLevel: 0.5,
        steps: 1018,
        score: 1200,
        videoSrc: '/models/replay_ep174_steps_1000_20251203_041458.mp4'
    },
    { 
        id: 'master', 
        name: '고급 (Master)', 
        skillLevel: 1.0,
        steps: 1353,
        score: 1400,
        videoSrc: '/models/replay_ep1087_steps_1400_20251203_085256.mp4'
    },
]

export default function Replay() {
    const { theme } = useTheme()
    const colors = theme === 'dark' ? darkTheme : lightTheme

    const [selectedModel, setSelectedModel] = useState<string>('beginner')
    const [isPlaying, setIsPlaying] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    // 현재 선택된 모델 정보 가져오기
    const currentModel = useMemo(() => 
        MODELS.find(m => m.id === selectedModel) || MODELS[0],
    [selectedModel])

    // 비디오 소스 변경 시 비디오 리로드
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load()
            setIsPlaying(false)
        }
    }, [currentModel])

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
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: 16,
                        borderRadius: 8,
                        border: `2px solid ${colors.inputBorder}`,
                        background: colors.inputBg,
                        color: colors.inputText,
                        cursor: 'pointer',
                    }}
                >
                    {MODELS.map(model => (
                        <option key={model.id} value={model.id}>
                            {model.name}
                        </option>
                    ))}
                </select>

                <div style={{ 
                    marginTop: 20, 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: 12 
                }}>
                    <div style={{ 
                        padding: 12, 
                        background: colors.background, 
                        borderRadius: 8, 
                        border: `1px solid ${colors.inputBorder}`,
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>Score</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: colors.primary }}>{currentModel.score}</div>
                    </div>
                    <div style={{ 
                        padding: 12, 
                        background: colors.background, 
                        borderRadius: 8, 
                        border: `1px solid ${colors.inputBorder}`,
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>Steps</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: colors.text }}>{currentModel.steps}</div>
                    </div>
                    <div style={{ 
                        padding: 12, 
                        background: colors.background, 
                        borderRadius: 8, 
                        border: `1px solid ${colors.inputBorder}`,
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 4 }}>Skill</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: colors.text }}>{currentModel.skillLevel}</div>
                    </div>
                </div>
            </div>

            {/* 비디오 플레이어 */}
            <div style={{ 
                position: 'relative', 
                width: '100%', 
                maxWidth: 768, 
                aspectRatio: '4/3', 
                background: colors.cardBg, 
                borderRadius: 12, 
                overflow: 'hidden', 
                boxShadow: `0 8px 32px ${colors.shadowStrong}` 
            }}>
                <video
                    ref={videoRef}
                    src={currentModel.videoSrc}
                    width="100%"
                    height="100%"
                    controls
                    muted
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
                
                {!isPlaying && (
                    <div style={{ 
                        position: 'absolute', 
                        inset: 0, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: 16,
                        background: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 10,
                        pointerEvents: 'none' // 클릭 이벤트를 video controls로 통과시키기 위해
                    }}>
                        <div style={{
                            padding: '14px 24px',
                            borderRadius: 8,
                            background: colors.primary,
                            color: '#fff',
                            fontSize: 18,
                            fontWeight: 600,
                            boxShadow: `0 2px 10px ${colors.shadow}`,
                            pointerEvents: 'auto', // 버튼은 클릭 가능하게
                            cursor: 'pointer'
                        }}
                        onClick={() => {
                            if (videoRef.current) {
                                videoRef.current.play()
                            }
                        }}
                        >
                            ▶ 리플레이 재생
                        </div>
                    </div>
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
                    <li>비디오 플레이어의 재생 버튼을 클릭하여 AI 에이전트의 플레이 영상을 시청하세요</li>
                    <li>하단의 컨트롤 바를 사용하여 탐색할 수 있습니다</li>
                </ol>
            </div>
        </div>
    )
}
