import { useEffect, useState } from 'react'
import { fetchLeaderboard, type Score } from '../api/scores'

export default function Rank() {
    const [rows, setRows] = useState<Score[] | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchLeaderboard()
            .then(setRows)
            .catch((e) => setError(String(e)))
    }, [])

    return (
        <div style={{ display: 'grid', gap: 12 }}>
            <h2>Rank</h2>
            {error && <div style={{ color: 'crimson' }}>{error}</div>}
            {!rows ? (
                <div>불러오는 중...</div>
            ) : (
                <table style={{ borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: 8 }}>#</th>
                            <th style={{ textAlign: 'left', padding: 8 }}>닉네임</th>
                            <th style={{ textAlign: 'right', padding: 8 }}>점수</th>
                            <th style={{ textAlign: 'left', padding: 8 }}>모델</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r, i) => (
                            <tr key={r.id}>
                                <td style={{ padding: 8 }}>{i + 1}</td>
                                <td style={{ padding: 8 }}>{r.nickname}</td>
                                <td style={{ padding: 8, textAlign: 'right' }}>{r.score.toLocaleString()}</td>
                                <td style={{ padding: 8 }}>{r.modelId ?? '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}

