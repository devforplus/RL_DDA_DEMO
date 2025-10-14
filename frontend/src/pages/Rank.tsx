import { useEffect, useState } from 'react'
import { fetchLeaderboard, type Score } from '../api/scores'

export default function Rank() {
    const [rows, setRows] = useState<Score[] | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const loadLeaderboard = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await fetchLeaderboard()
            setRows(data)
        } catch (e) {
            setError(String(e))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadLeaderboard()
    }, [])

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
        <div style={{ display: 'grid', gap: 20, maxWidth: 900, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>🏆 리더보드</h2>
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

            {error && (
                <div style={{
                    padding: 16,
                    borderRadius: 8,
                    background: '#4d1a1a',
                    border: '1px solid crimson',
                    color: 'crimson'
                }}>
                    ❌ {error}
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
                                    padding: '16px 12px',
                                    fontWeight: 600,
                                    color: '#5a62f1',
                                    width: '80px'
                                }}>순위</th>
                                <th style={{
                                    textAlign: 'left',
                                    padding: '16px 12px',
                                    fontWeight: 600,
                                    color: '#5a62f1'
                                }}>닉네임</th>
                                <th style={{
                                    textAlign: 'right',
                                    padding: '16px 12px',
                                    fontWeight: 600,
                                    color: '#5a62f1',
                                    width: '150px'
                                }}>점수</th>
                                <th style={{
                                    textAlign: 'center',
                                    padding: '16px 12px',
                                    fontWeight: 600,
                                    color: '#5a62f1',
                                    width: '120px'
                                }}>모델</th>
                                <th style={{
                                    textAlign: 'center',
                                    padding: '16px 12px',
                                    fontWeight: 600,
                                    color: '#5a62f1',
                                    width: '140px'
                                }}>날짜</th>
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
                                            padding: '16px 12px',
                                            textAlign: 'center',
                                            fontWeight: 600,
                                            fontSize: rank <= 3 ? 18 : 16,
                                            color: getRankColor(rank)
                                        }}>
                                            {getRankEmoji(rank)} {rank}
                                        </td>
                                        <td style={{
                                            padding: '16px 12px',
                                            fontWeight: rank <= 3 ? 600 : 400,
                                            fontSize: rank <= 3 ? 16 : 14
                                        }}>
                                            {r.nickname}
                                        </td>
                                        <td style={{
                                            padding: '16px 12px',
                                            textAlign: 'right',
                                            fontWeight: 600,
                                            fontSize: rank <= 3 ? 18 : 16,
                                            color: rank <= 3 ? '#5a62f1' : '#fff'
                                        }}>
                                            {r.score.toLocaleString()}
                                        </td>
                                        <td style={{
                                            padding: '16px 12px',
                                            textAlign: 'center',
                                            color: '#888',
                                            fontSize: 14
                                        }}>
                                            {r.modelId ?? '-'}
                                        </td>
                                        <td style={{
                                            padding: '16px 12px',
                                            textAlign: 'center',
                                            color: '#888',
                                            fontSize: 12
                                        }}>
                                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString('ko-KR', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : '-'}
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

