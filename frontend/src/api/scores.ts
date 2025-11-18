import { API_ENDPOINTS } from '../config'

// ============================================
// 타입 정의
// ============================================

/**
 * 리더보드 점수 항목
 */
export type Score = {
    id: string
    nickname: string
    score: number
    modelId?: string
    createdAt?: string
}

/**
 * 점수 제출 요청
 */
export type ScoreSubmitRequest = {
    nickname: string
    score: number
    modelId?: string
}

/**
 * 게임 플레이 프레임 데이터
 */
export type GamePlayFrame = {
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
}

/**
 * 게임 통계
 */
export type GameStatistics = {
    total_frames: number
    play_duration: number
    enemies_destroyed: number
    shots_fired: number
    hits: number
    deaths: number
}

/**
 * 적 이벤트 (생성 또는 공격)
 */
export type EnemyEvent = {
    event_type: 'enemy_spawn' | 'enemy_shoot'
    frame: number
    enemy_id: number
    enemy_type?: string  // spawn 시에만
    x: number
    y: number
    scroll_x?: number    // spawn 시에만
    vx?: number          // shoot 시에만
    vy?: number          // shoot 시에만
    delay?: number       // shoot 시에만
}

/**
 * 게임 플레이 데이터 제출 요청
 * 백엔드 API 스펙: POST /api/gameplay
 */
export type GamePlaySubmitRequest = {
    nickname: string
    score: number
    final_stage: number
    model_id?: string
    statistics: GameStatistics
    frames: GamePlayFrame[]
    enemy_events: EnemyEvent[]
}

/**
 * 게임 플레이 데이터 제출 응답
 */
export type GamePlaySubmitResponse = {
    id: string
    message: string
}

/**
 * API 에러 응답
 */
export type ApiError = {
    ok: false
    error: string
}

/**
 * API 성공 응답
 */
export type ApiSuccess = {
    ok: true
}

// ============================================
// API 함수들
// ============================================

/**
 * 랭킹 조회 옵션
 */
export type RankingsOptions = {
    page?: number          // 페이지 번호 (기본값: 1)
    page_size?: number     // 페이지당 항목 수 (기본값: 10, 최대: 100)
    model_id?: string      // 모델별 필터링 (선택 사항)
}

/**
 * 게임 플레이 랭킹 조회 (페이지네이션 지원)
 * 
 * @param options 조회 옵션 (페이지, 페이지 크기, 모델 필터)
 * @returns 점수 목록 (점수 내림차순)
 * @throws Error 네트워크 오류 또는 서버 오류 시
 * 
 * @example
 * // 첫 페이지 조회
 * const rankings = await fetchRankings({ page: 1, page_size: 10 })
 * 
 * // 특정 모델 필터링
 * const beginnerRankings = await fetchRankings({ model_id: 'beginner' })
 */
export async function fetchRankings(options: RankingsOptions = {}): Promise<Score[]> {
    const params = new URLSearchParams()

    if (options.page !== undefined) {
        params.append('page', options.page.toString())
    }
    if (options.page_size !== undefined) {
        params.append('page_size', options.page_size.toString())
    }
    if (options.model_id) {
        params.append('model_id', options.model_id)
    }

    const url = `${API_ENDPOINTS.GAMEPLAY_RANKINGS}?${params.toString()}`
    console.log('🔄 API 요청:', url)

    const res = await fetch(url)
    console.log('📡 응답 상태:', res.status, res.statusText)

    if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error')
        console.error('❌ API 에러:', res.status, errorText)
        throw new Error(`랭킹 조회 실패: HTTP ${res.status} - ${errorText}`)
    }

    const data = await res.json()
    console.log('✅ 파싱된 원본 데이터:', data)
    console.log('📊 데이터 타입:', typeof data)
    console.log('📊 데이터 키들:', Object.keys(data))

    // 응답이 객체로 감싸져 있는 경우 처리
    let rankings: Score[]

    if (Array.isArray(data)) {
        // 배열로 직접 반환하는 경우
        rankings = data
        console.log('✅ 배열 형식 응답')
    } else if (typeof data === 'object' && data !== null) {
        // 객체로 감싸져 있는 경우 - 일반적인 페이지네이션 응답
        console.log('📦 객체 형식 응답, 키 확인 중...')

        if (Array.isArray(data.data)) {
            rankings = data.data
            console.log('✅ data.data 배열 사용')
        } else if (Array.isArray(data.items)) {
            rankings = data.items
            console.log('✅ data.items 배열 사용')
        } else if (Array.isArray(data.rankings)) {
            rankings = data.rankings
            console.log('✅ data.rankings 배열 사용')
        } else if (Array.isArray(data.results)) {
            rankings = data.results
            console.log('✅ data.results 배열 사용')
        } else {
            console.error('❌ 배열을 찾을 수 없습니다. 응답 구조:', data)
            throw new Error(`잘못된 응답 형식: 배열 필드를 찾을 수 없음. 키: ${Object.keys(data).join(', ')}`)
        }
    } else {
        console.error('❌ 응답이 배열도 객체도 아닙니다:', typeof data, data)
        throw new Error(`잘못된 응답 형식: ${typeof data}`)
    }

    // 빈 배열은 정상
    if (rankings.length === 0) {
        console.log('ℹ️ 빈 배열 반환 (데이터 없음)')
        return []
    }

    // 첫 번째 항목의 구조 확인
    const firstItem = rankings[0]
    console.log('🔍 첫 번째 항목 구조:', firstItem)

    if (!firstItem.id || !firstItem.nickname || firstItem.score === undefined) {
        console.error('❌ 데이터 구조가 올바르지 않습니다:', firstItem)
        console.log('필요한 필드: id, nickname, score')
        console.log('실제 필드:', Object.keys(firstItem))
        throw new Error('잘못된 데이터 구조')
    }

    console.log(`✅ ${rankings.length}개의 랭킹 데이터 반환`)
    return rankings
}

/**
 * 리더보드 조회 (레거시)
 * @deprecated fetchRankings() 사용을 권장합니다. 페이지네이션과 필터링을 지원합니다.
 * @returns 점수 목록 (점수 내림차순)
 * @throws Error 네트워크 오류 또는 서버 오류 시
 */
export async function fetchLeaderboard(): Promise<Score[]> {
    // 하위 호환성을 위해 새 API로 리다이렉트
    return fetchRankings({ page: 1, page_size: 100 })
}

/**
 * 점수 제출 (레거시)
 * @deprecated submitGamePlayData() 사용을 권장합니다. 게임 플레이 데이터에 점수가 포함되어 있습니다.
 * @param input 점수 정보 (닉네임, 점수, 모델ID)
 * @returns 성공 시 { ok: true }, 실패 시 { ok: false, error: string }
 */
export async function submitScore(
    input: ScoreSubmitRequest
): Promise<ApiSuccess | ApiError> {
    try {
        const res = await fetch(API_ENDPOINTS.SCORES, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
        })

        if (!res.ok) {
            const errorText = await res.text().catch(() => 'Unknown error')
            return { ok: false, error: `HTTP ${res.status}: ${errorText}` }
        }

        return { ok: true }
    } catch (error) {
        return {
            ok: false,
            error: error instanceof Error ? error.message : '네트워크 오류'
        }
    }
}

/**
 * 게임 플레이 데이터 제출
 * 
 * 이 함수는 게임 플레이 데이터를 백엔드에 제출합니다.
 * 점수도 포함되어 있어 별도의 submitScore() 호출이 불필요합니다.
 * 
 * **백엔드 요구사항:**
 * - POST /api/gameplay 엔드포인트 필요
 * - GET /api/leaderboard는 gameplay 테이블에서 점수를 가져와야 함
 * 
 * @param data 게임 플레이 전체 데이터 (통계, 프레임 데이터 등)
 * @returns 성공 시 { ok: true }, 실패 시 { ok: false, error: string }
 */
export async function submitGamePlayData(
    data: GamePlaySubmitRequest
): Promise<ApiSuccess | ApiError> {
    try {
        const res = await fetch(API_ENDPOINTS.GAMEPLAY, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })

        if (!res.ok) {
            const errorText = await res.text().catch(() => 'Unknown error')
            return { ok: false, error: `HTTP ${res.status}: ${errorText}` }
        }

        return { ok: true }
    } catch (error) {
        return {
            ok: false,
            error: error instanceof Error ? error.message : '네트워크 오류'
        }
    }
}

