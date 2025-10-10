export type ReplayMeta = {
    id: string
    session_id: string
    frames_count?: number
    duration_ms?: number
    compression?: string | null
    schema_version?: string
    generated_by?: string
    checksum?: string
    created_at?: string
    url: string
    expires_in?: number
}

const BASE = (import.meta as any).env.VITE_API_BASE ?? ''

export async function fetchReplayMeta(replayId: string): Promise<ReplayMeta> {
    const res = await fetch(`${BASE}/api/replays/${encodeURIComponent(replayId)}`)
    if (!res.ok) throw new Error(`failed to load replay meta: HTTP ${res.status}`)
    return res.json()
}



