export type ModelId = 'beginner' | 'medium' | 'master'

const env = import.meta.env as Record<string, string | undefined>

// API 설정
export const API_BASE_URL = env.VITE_API_BASE ?? ''

// API 엔드포인트
export const API_ENDPOINTS = {
    // 게임 데이터 관련
    GAMEPLAY: `${API_BASE_URL}/api/gameplay`,
    GAMEPLAY_RANKINGS: `${API_BASE_URL}/api/gameplay/rankings`, // 페이지네이션 + 모델 필터링
    LEADERBOARD: `${API_BASE_URL}/api/leaderboard`, // (레거시) GAMEPLAY_RANKINGS 사용 권장
    SCORES: `${API_BASE_URL}/api/scores`, // (레거시) GAMEPLAY 사용 권장
    
    // 리플레이 관련
    REPLAYS: (replayId: string) => `${API_BASE_URL}/api/replays/${encodeURIComponent(replayId)}`,
    
    // 세션 관련 (향후 사용 가능)
    SESSION_START: `${API_BASE_URL}/api/session/start`,
    SESSION_END: `${API_BASE_URL}/api/session/end`,
    
    // 에이전트 관련 (향후 사용 가능)
    AGENTS: `${API_BASE_URL}/api/agents`,
    
    // 이벤트 관련 (향후 사용 가능)
    EVENTS_BATCH: `${API_BASE_URL}/api/events/batch`,
} as const

export function streamUrlForModel(modelId?: string): string | null {
    if (!modelId) return null
    switch (modelId) {
        case 'beginner':
            return env.VITE_STREAM_URL_BEGINNER ?? null
        case 'medium':
            return env.VITE_STREAM_URL_MEDIUM ?? null
        case 'master':
            return env.VITE_STREAM_URL_MASTER ?? null
        default:
            return null
    }
}

export function replayIdForModel(modelId?: string): string | null {
    if (!modelId) return null
    switch (modelId) {
        case 'beginner':
            return env.VITE_REPLAY_ID_BEGINNER ?? null
        case 'medium':
            return env.VITE_REPLAY_ID_MEDIUM ?? null
        case 'master':
            return env.VITE_REPLAY_ID_MASTER ?? null
        default:
            return null
    }
}


