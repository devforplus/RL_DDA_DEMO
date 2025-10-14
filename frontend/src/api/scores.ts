export type Score = { id: string; nickname: string; score: number; modelId?: string; createdAt?: string }

export type GamePlayData = {
    nickname: string
    score: number
    final_stage: number
    model_id?: string
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

export async function submitGamePlayData(data: GamePlayData): Promise<{ ok: true } | { ok: false; error: string }> {
    const res = await fetch(`${BASE}/api/gameplay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` }
    return { ok: true }
}

