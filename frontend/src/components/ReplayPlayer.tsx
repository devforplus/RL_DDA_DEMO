import { useEffect, useMemo, useRef, useState } from 'react'

type ReplayEvent = { t: number; action: string; payload?: unknown }
type ReplayData = { version?: string; modelId?: string; events?: ReplayEvent[];[k: string]: unknown }

export function useLoadReplayFromUrl(url?: string | null) {
  const [replay, setReplay] = useState<ReplayData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let aborted = false
    async function run() {
      if (!url) return
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const text = await res.text()
        if (aborted) return
        const json = JSON.parse(text)
        setReplay(json)
      } catch (e) {
        if (!aborted) setError('리플레이 로드 실패')
      } finally {
        if (!aborted) setLoading(false)
      }
    }
    run()
    return () => {
      aborted = true
    }
  }, [url])

  return { replay, error, loading }
}

export default function ReplayPlayer({ modelId, url }: { modelId?: string; url?: string | null }) {
  const [replay, setReplay] = useState<ReplayData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { replay: remoteReplay, error: remoteError, loading } = useLoadReplayFromUrl(url)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const numEvents = useMemo(() => (replay && Array.isArray(replay.events) ? replay.events.length : 0), [replay])

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = String(reader.result || '')
        const json = JSON.parse(text)
        setReplay(json)
        setError(null)
      } catch (err) {
        setError('JSON 파싱에 실패했습니다.')
        setReplay(null)
      }
    }
    reader.readAsText(file)
  }

  useEffect(() => {
    if (remoteReplay) {
      setReplay(remoteReplay)
      setError(null)
    } else if (remoteError) {
      setError(remoteError)
    }
  }, [remoteReplay, remoteError])

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <strong>모델</strong>
        <span>{modelId ?? '(선택 없음)'}</span>
      </div>
      <div>
        <input ref={inputRef} type="file" accept="application/json" onChange={onFileChange} />
      </div>
      {loading && <div style={{ color: '#666' }}>리플레이를 불러오는 중…</div>}
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
      {replay ? (
        <div style={{ display: 'grid', gap: 8 }}>
          <div>리플레이 버전: {replay.version ?? '알 수 없음'}</div>
          <div>이벤트 수: {numEvents}</div>
          <div style={{ padding: 12, border: '1px dashed #bbb', borderRadius: 8 }}>
            캔버스/렌더러는 이후 연결 예정입니다.
          </div>
        </div>
      ) : (
        <div style={{ color: '#666' }}>JSON 리플레이 파일을 업로드해주세요.</div>
      )}
    </div>
  )
}



