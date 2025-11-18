import { useState, useMemo } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { darkTheme, lightTheme } from '../theme/colors'

export default function Replay() {
    const { theme } = useTheme()
    const colors = theme === 'dark' ? darkTheme : lightTheme

    const [isPlaying, setIsPlaying] = useState(false)
    const [replayData, setReplayData] = useState<any>(null)

    const pyxappUrl = useMemo(() => '/game.pyxapp', [])
    const iframeSrc = useMemo(
        () => `/pyxel/console.html?app=${encodeURIComponent(pyxappUrl)}`,
        [pyxappUrl]
    )

    // localStorage에서 저장된 게임 데이터 로드
    const loadReplayData = () => {
        const gameDataStr = localStorage.getItem('pyxelGameData')
        if (gameDataStr) {
            try {
                const data = JSON.parse(gameDataStr)
                setReplayData(data)
                console.log('Replay data loaded:', data)
                return data
            } catch (e) {
                console.error('Failed to parse replay data:', e)
                alert('리플레이 데이터를 로드하는데 실패했습니다.')
            }
        } else {
            alert('저장된 게임 데이터가 없습니다. 먼저 게임을 플레이해주세요.')
        }
        return null
    }

    // 리플레이 시작
    const startReplay = () => {
        const data = loadReplayData()
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
            <h2 style={{ marginBottom: 32, color: colors.text }}>🎬 리플레이</h2>

            {replayData && (
                <div style={{
                    marginBottom: 24,
                    padding: 24,
                    background: colors.cardBg,
                    borderRadius: 12,
                    border: `1px solid ${colors.cardBorder}`,
                    color: colors.text
                }}>
                    <h3 style={{ margin: '0 0 16px 0', color: colors.primary }}>리플레이 정보</h3>
                    <div style={{ display: 'grid', gap: 8 }}>
                        <div>점수: {replayData.score}</div>
                        <div>최종 스테이지: {replayData.final_stage}</div>
                        <div>총 프레임: {replayData.statistics?.total_frames}</div>
                        <div>플레이 시간: {replayData.statistics?.play_duration?.toFixed(1)}초</div>
                        <div>적 처치: {replayData.statistics?.enemies_destroyed}</div>
                        <div>적 이벤트: {replayData.enemy_events?.length || 0}개</div>
                    </div>
                </div>
            )}

            <div style={{ position: 'relative', width: 768, height: 576, background: colors.cardBg, borderRadius: 12, overflow: 'hidden', boxShadow: `0 8px 32px ${colors.shadowStrong}` }}>
                {!isPlaying && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                        <button
                            onClick={startReplay}
                            style={{ padding: '14px 18px', borderRadius: 8, border: 'none', background: colors.primary, color: '#fff', fontSize: 18, cursor: 'pointer' }}
                        >
                            ▶ 리플레이 시작
                        </button>
                        {!replayData && (
                            <button
                                onClick={loadReplayData}
                                style={{ padding: '10px 16px', borderRadius: 8, border: `1px solid ${colors.primary}`, background: 'transparent', color: colors.primary, fontSize: 14, cursor: 'pointer' }}
                            >
                                데이터 미리보기
                            </button>
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

            <div style={{
                marginTop: 24,
                padding: 16,
                background: colors.sidebarBg,
                borderRadius: 12,
                border: `1px solid ${colors.sidebarBorder}`,
                color: colors.textSecondary,
                maxWidth: 768,
                width: '100%'
            }}>
                <h3 style={{ margin: '0 0 12px 0', color: colors.text, fontSize: 16 }}>📝 사용 방법</h3>
                <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
                    <li>먼저 Play 페이지에서 게임을 플레이하고 게임 오버하세요</li>
                    <li>"리플레이 시작" 버튼을 클릭하세요</li>
                    <li>게임이 자동으로 재생됩니다</li>
                    <li>플레이어의 입력과 적의 패턴이 동일하게 재현됩니다</li>
                </ol>
            </div>
        </div>
    )
}



