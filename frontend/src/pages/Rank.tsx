import { useEffect, useState } from 'react'
import { fetchRankings, type Score } from '../api/scores'

export default function Rank() {
    const [rows, setRows] = useState<Score[] | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [modelFilter, setModelFilter] = useState<string>('')
    const [pageSize, setPageSize] = useState(100)

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
            background: '#0f0f1e',
            color: '#fff'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <h2 style={{ margin: 0 }}>🏆 리더보드</h2>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {/* 모델 필터 */}
                    <select
                        value={modelFilter}
                        onChange={(e) => setModelFilter(e.target.value)}
                        disabled={loading}
                        style={{
                            padding: '8px 12px',
                            borderRadius: 8,
                            border: '1px solid #444',
                            background: '#1a1a2e',
                            color: '#fff',
                            fontSize: 14,
                            cursor: loading ? 'not-allowed' : 'pointer',
                        }}
                    >
                        <option value="">전체 모델</option>
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
                            border: '1px solid #444',
                            background: '#1a1a2e',
                            color: '#fff',
                            fontSize: 14,
                            cursor: loading ? 'not-allowed' : 'pointer',
                        }}
                    >
                        <option value="10">10개</option>
                        <option value="25">25개</option>
                        <option value="50">50개</option>
                        <option value="100">100개</option>
                    </select>

                    {/* 새로고침 버튼 */}
                    <button
                        onClick={loadLeaderboard}
                        disabled={loading}
                        style={{
                            padding: '10px 20px',
                            borderRadius: 8,
                            border: 'none',
                            background: loading ? '#666' : '#5a62f1',
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
                    background: '#4d1a1a',
                    border: '2px solid crimson',
                    color: '#fff'
                }}>
                    <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: 'crimson' }}>
                        ❌ 오류 발생
                    </div>
                    <div style={{ fontSize: 14, marginBottom: 16, color: '#ffaaaa' }}>
                        {error}
                    </div>
                    <details style={{ fontSize: 12, color: '#ccc' }}>
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
                <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
                    불러오는 중...
                </div>
            ) : rows.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: 40,
                    color: '#888',
                    background: '#1a1a2e',
                    borderRadius: 12
                }}>
                    아직 등록된 점수가 없습니다.<br />
                    첫 번째 플레이어가 되어보세요! 🎮
                </div>
            ) : (
                <div style={{
                    background: '#1a1a2e',
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: '1px solid #333'
                }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse'
                    }}>
                        <thead>
                            <tr style={{ background: '#0f0f1e', borderBottom: '2px solid #5a62f1' }}>
                                <th style={{
                                    textAlign: 'center',
                                    padding: '16px 24px',
                                    fontWeight: 600,
                                    color: '#5a62f1',
                                    width: '10%'
                                }}>순위</th>
                                <th style={{
                                    textAlign: 'left',
                                    padding: '16px 32px',
                                    fontWeight: 600,
                                    color: '#5a62f1',
                                    width: '10%'
                                }}>닉네임</th>
                                <th style={{
                                    textAlign: 'center',
                                    padding: '16px 100px',
                                    fontWeight: 600,
                                    color: '#5a62f1',
                                    width: '30%'
                                }}>점수</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r, i) => {
                                const rank = i + 1
                                return (
                                    <tr
                                        key={r.id}
                                        style={{
                                            borderBottom: '1px solid #282840',
                                            background: rank <= 3 ? 'rgba(90, 98, 241, 0.05)' : 'transparent',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(90, 98, 241, 0.1)'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = rank <= 3 ? 'rgba(90, 98, 241, 0.05)' : 'transparent'
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
                                            fontSize: rank <= 3 ? 16 : 14
                                        }}>
                                            {r.nickname}
                                        </td>
                                        <td style={{
                                            padding: '16px 100px',
                                            textAlign: 'center',
                                            fontWeight: 600,
                                            fontSize: rank <= 3 ? 18 : 16,
                                            color: rank <= 3 ? '#5a62f1' : '#fff'
                                        }}>
                                            {r.score.toLocaleString()}
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
                color: '#666',
                padding: '20px 0'
            }}>
                총 {rows?.length ?? 0}명의 플레이어
            </div>
        </div>
    )
}

