export type Score = { id: string; nickname: string; score: number; modelId?: string; createdAt?: string }

const BASE = import.meta.env.VITE_API_BASE ?? ''

export async function fetchLeaderboard(): Promise<Score[]> {
    const res = await fetch(`${BASE}/api/leaderboard`)
    if (!res.ok) throw new Error('failed to load leaderboard')
    return res.json()
}

export async function submitScore(input: { nickname: string; score: number; modelId?: string }): Promise<{ ok: true } | { ok: false; error: string }> {
    const res = await fetch(`${BASE}/api/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    })
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` }
    return { ok: true }
}

