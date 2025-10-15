import { API_ENDPOINTS } from '../config'

// ============================================
// 타입 정의
// ============================================

/**
 * 리플레이 메타데이터
 * 백엔드 API 스펙: GET /api/replays/{replay_id}
 */
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

// ============================================
// API 함수들
// ============================================

/**
 * 리플레이 메타데이터 조회
 * @param replayId 리플레이 ID
 * @returns 리플레이 메타데이터 (S3 presigned URL 포함)
 * @throws Error 네트워크 오류 또는 서버 오류 시
 */
export async function fetchReplayMeta(replayId: string): Promise<ReplayMeta> {
    const res = await fetch(API_ENDPOINTS.REPLAYS(replayId))
    if (!res.ok) {
        throw new Error(`리플레이 메타데이터 로드 실패: HTTP ${res.status}`)
    }
    return res.json()
}



