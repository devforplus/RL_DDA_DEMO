import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import ReplayPlayer from '../components/ReplayPlayer'
import MjpegViewer from '../components/MjpegViewer'
import { streamUrlForModel } from '../config'
import { useTheme } from '../contexts/ThemeContext'
import { darkTheme, lightTheme } from '../theme/colors'

export default function Watch() {
  const { theme } = useTheme()
  const colors = theme === 'dark' ? darkTheme : lightTheme
  
  const params = useParams()
  const modelId = params.modelId as string | undefined
  const streamUrl = useMemo(() => streamUrlForModel(modelId) ?? '', [modelId])

  return (
    <div style={{
      padding: '40px 20px',
      minHeight: 'calc(100vh - 60px)',
      background: colors.background
    }}>
      <h2 style={{ color: colors.text }}>에이전트 플레이 보기</h2>
      {streamUrl ? (
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ color: colors.textSecondary }}>모델: {modelId}</div>
          <MjpegViewer src={streamUrl} width={512} height={384} />
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ color: colors.error }}>스트림 URL이 설정되지 않았습니다.</div>
          <ReplayPlayer modelId={modelId} />
        </div>
      )}
    </div>
  )
}


