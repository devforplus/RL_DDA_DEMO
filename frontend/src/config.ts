export type ModelId = 'beginner' | 'medium' | 'master'

const env = import.meta.env as Record<string, string | undefined>

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


