import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import ReplayPlayer from '../components/ReplayPlayer'
import MjpegViewer from '../components/MjpegViewer'
import { streamUrlForModel } from '../config'

export default function Watch() {
  const params = useParams()
  const modelId = params.modelId as string | undefined
  const streamUrl = useMemo(() => streamUrlForModel(modelId) ?? '', [modelId])

  return (
    <div>
      <h2>에이전트 플레이 보기</h2>
      {streamUrl ? (
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ color: '#666' }}>모델: {modelId}</div>
          <MjpegViewer src={streamUrl} width={512} height={384} />
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ color: '#a00' }}>스트림 URL이 설정되지 않았습니다.</div>
          <ReplayPlayer modelId={modelId} />
        </div>
      )}
    </div>
  )
}


