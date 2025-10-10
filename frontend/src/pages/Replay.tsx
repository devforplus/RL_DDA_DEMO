import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchReplayMeta, type ReplayMeta } from '../api/replays'
import ReplayPlayer from '../components/ReplayPlayer'

export default function Replay() {
    const params = useParams()
    const replayId = params.replayId as string
    const [meta, setMeta] = useState<ReplayMeta | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        let aborted = false
        async function run() {
            setLoading(true)
            setError(null)
            try {
                const m = await fetchReplayMeta(replayId)
                if (!aborted) setMeta(m)
            } catch (e) {
                if (!aborted) setError('리플레이 메타데이터 로드 실패')
            } finally {
                if (!aborted) setLoading(false)
            }
        }
        run()
        return () => {
            aborted = true
        }
    }, [replayId])

    const dataUrl = useMemo(() => meta?.url ?? null, [meta])

    return (
        <div style={{ display: 'grid', gap: 12 }}>
            <h2>리플레이</h2>
            {loading && <div style={{ color: '#666' }}>로딩 중…</div>}
            {error && <div style={{ color: 'crimson' }}>{error}</div>}
            {meta && (
                <div style={{ color: '#666' }}>
                    <div>ID: {meta.id}</div>
                    {meta.duration_ms != null && <div>길이: {Math.round(meta.duration_ms / 1000)}초</div>}
                    {meta.frames_count != null && <div>프레임: {meta.frames_count}</div>}
                </div>
            )}
            <ReplayPlayer url={dataUrl} />
        </div>
    )
}



