import { useEffect, useState } from 'react'
import { fetchRankings, type Score } from '../api/scores'
import { useTheme } from '../contexts/ThemeContext'
import { darkTheme, lightTheme } from '../theme/colors'

export default function Rank() {
    const { theme } = useTheme()
    const colors = theme === 'dark' ? darkTheme : lightTheme
    
    const [rows, setRows] = useState<Score[] | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [modelFilter, setModelFilter] = useState<string>('beginner')
    const [pageSize, setPageSize] = useState(10)

    const loadLeaderboard = async () => {
        setLoading(true)
        setError(null)
        try {
            console.log('랭킹 데이터 요청 중...', { pageSize, modelFilter })
            const data = await fetchRankings({
                page: 1,
                page_size: pageSize,
                model_id: modelFilter || undefined,
            })
            console.log('받은 데이터:', data)
            console.log('데이터 타입:', typeof data, Array.isArray(data))

            // 안전하게 배열로 설정
            if (Array.isArray(data)) {
                setRows(data)
            } else {
                console.error('데이터가 배열이 아닙니다:', data)
                setRows([])
                setError('서버에서 잘못된 형식의 데이터를 받았습니다.')
            }
        } catch (e) {
            console.error('랭킹 로딩 에러:', e)
            setRows([]) // 에러 시 빈 배열로 설정
            setError(e instanceof Error ? e.message : String(e))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadLeaderboard()
    }, [modelFilter, pageSize])

    const getRankColor = (rank: number) => {
        if (rank === 1) return '#FFD700' // 금
        if (rank === 2) return '#C0C0C0' // 은
        if (rank === 3) return '#CD7F32' // 동
        return '#888'
    }

    const getRankEmoji = (rank: number) => {
        if (rank === 1) return '🥇'
        if (rank === 2) return '🥈'
        if (rank === 3) return '🥉'
        return ''
    }

    return (
        <div style={{
            display: 'grid',
            gap: 20,
            padding: '20px 40px',
            minHeight: 'calc(100vh - 80px)',
            background: colors.background,
            color: colors.text
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <h2 style={{ margin: 0, color: colors.text }}>🏆 리더보드</h2>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {/* 모델 필터 */}
                    <select
                        value={modelFilter}
                        onChange={(e) => setModelFilter(e.target.value)}
                        disabled={loading}
                        style={{
                            padding: '8px 12px',
                            borderRadius: 8,
                            border: `1px solid ${colors.cardBorder}`,
                            background: colors.inputBg,
                            color: colors.text,
                            fontSize: 14,
                            cursor: loading ? 'not-allowed' : 'pointer',
                        }}
                    >
                        <option value="beginner">Beginner</option>
                        <option value="medium">Medium</option>
                        <option value="master">Master</option>
                    </select>

                    {/* 페이지 크기 */}
                    <select
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        disabled={loading}
                        style={{
                            padding: '8px 12px',
                            borderRadius: 8,
                            border: `1px solid ${colors.cardBorder}`,
                            background: colors.inputBg,
                            color: colors.text,
                            fontSize: 14,
                            cursor: loading ? 'not-allowed' : 'pointer',
                        }}
                    >
                        <option value="10">10개</option>
                        <option value="20">20개</option>
                    </select>

                    {/* 새로고침 버튼 */}
                    <button
                        onClick={loadLeaderboard}
                        disabled={loading}
                        style={{
                            padding: '10px 20px',
                            borderRadius: 8,
                            border: 'none',
                            background: loading ? colors.textTertiary : colors.primary,
                            color: '#fff',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'background 0.2s'
                        }}
                    >
                        {loading ? '새로고침 중...' : '🔄 새로고침'}
                    </button>
                </div>
            </div>

            {error && (
                <div style={{
                    padding: 20,
                    borderRadius: 12,
                    background: colors.errorBg,
                    border: `2px solid ${colors.error}`,
                    color: colors.text
                }}>
                    <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: colors.error }}>
                        ❌ 오류 발생
                    </div>
                    <div style={{ fontSize: 14, marginBottom: 16, color: colors.textSecondary }}>
                        {error}
                    </div>
                    <details style={{ fontSize: 12, color: colors.textTertiary }}>
                        <summary style={{ cursor: 'pointer', marginBottom: 8 }}>해결 방법</summary>
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                            <li>백엔드 서버가 실행 중인지 확인하세요 (localhost:8000)</li>
                            <li>브라우저 개발자 도구(F12) → Network 탭에서 API 요청 상태를 확인하세요</li>
                            <li>Console 탭에서 자세한 에러 로그를 확인하세요</li>
                        </ul>
                    </details>
                </div>
            )}

            {!rows ? (
                <div style={{ textAlign: 'center', padding: 40, color: colors.textTertiary }}>
                    불러오는 중...
                </div>
            ) : rows.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: 40,
                    color: colors.textTertiary,
                    background: colors.cardBg,
                    borderRadius: 12
                }}>
                    아직 등록된 점수가 없습니다.<br />
                    첫 번째 플레이어가 되어보세요! 🎮
                </div>
            ) : (
                <div style={{
                    background: colors.cardBg,
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: `1px solid ${colors.cardBorder}`
                }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse'
                    }}>
                        <thead>
                            <tr style={{ background: colors.backgroundTertiary, borderBottom: `2px solid ${colors.primary}` }}>
                                <th style={{
                                    textAlign: 'center',
                                    padding: '16px 24px',
                                    fontWeight: 600,
                                    color: colors.primary,
                                    width: '10%'
                                }}>순위</th>
                                <th style={{
                                    textAlign: 'left',
                                    padding: '16px 32px',
                                    fontWeight: 600,
                                    color: colors.primary,
                                    width: '20%'
                                }}>닉네임</th>
                                <th style={{
                                    textAlign: 'center',
                                    padding: '16px 40px',
                                    fontWeight: 600,
                                    color: colors.primary,
                                    width: '20%'
                                }}>점수</th>
                                <th style={{
                                    textAlign: 'center',
                                    padding: '16px 40px',
                                    fontWeight: 600,
                                    color: colors.primary,
                                    width: '20%'
                                }}>생존 프레임</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r, i) => {
                                const rank = i + 1
                                const topRankBg = theme === 'dark' ? 'rgba(90, 98, 241, 0.05)' : 'rgba(90, 98, 241, 0.08)'
                                const hoverBg = theme === 'dark' ? 'rgba(90, 98, 241, 0.1)' : 'rgba(90, 98, 241, 0.15)'
                                
                                return (
                                    <tr
                                        key={r.id}
                                        style={{
                                            borderBottom: `1px solid ${colors.cardBorder}`,
                                            background: rank <= 3 ? topRankBg : 'transparent',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = hoverBg
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = rank <= 3 ? topRankBg : 'transparent'
                                        }}
                                    >
                                        <td style={{
                                            padding: '16px 24px',
                                            textAlign: 'center',
                                            fontWeight: 600,
                                            fontSize: rank <= 3 ? 18 : 16,
                                            color: getRankColor(rank)
                                        }}>
                                            {getRankEmoji(rank)} {rank}
                                        </td>
                                        <td style={{
                                            padding: '16px 32px',
                                            fontWeight: rank <= 3 ? 600 : 400,
                                            fontSize: rank <= 3 ? 16 : 14,
                                            color: colors.text
                                        }}>
                                            {r.nickname}
                                        </td>
                                        <td style={{
                                            padding: '16px 40px',
                                            textAlign: 'center',
                                            fontWeight: 600,
                                            fontSize: rank <= 3 ? 18 : 16,
                                            color: rank <= 3 ? colors.primary : colors.text
                                        }}>
                                            {r.score.toLocaleString()}
                                        </td>
                                        <td style={{
                                            padding: '16px 40px',
                                            textAlign: 'center',
                                            fontWeight: 400,
                                            fontSize: 16,
                                            color: colors.text
                                        }}>
                                            {r.statistics?.total_frames ? `${r.statistics.total_frames.toLocaleString()}` : '-'}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <div style={{
                textAlign: 'center',
                fontSize: 12,
                color: colors.textTertiary,
                padding: '20px 0'
            }}>
                총 {rows?.length ?? 0}명의 플레이어
            </div>
        </div>
    )
}

