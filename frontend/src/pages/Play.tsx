import { useParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { streamUrlForModel } from '../config'
import MjpegViewer from '../components/MjpegViewer'
import { submitScore } from '../api/scores'

export default function Play() {
    const params = useParams()
    const modelId = params.modelId as string | undefined
    const [isRunning, setIsRunning] = useState(false)
    const [showSubmit, setShowSubmit] = useState(false)
    const [nickname, setNickname] = useState('')
    const [lastScore, setLastScore] = useState<number | null>(null)

    const pyxappUrl = useMemo(() => '/game.pyxapp', [])
    const iframeSrc = useMemo(
        () => `/pyxel/console.html?app=${encodeURIComponent(pyxappUrl)}`,
        [pyxappUrl]
    )
    const streamUrl = useMemo(() => streamUrlForModel(modelId) ?? '', [modelId])

    return (
        <div>
            <h2>플레이</h2>
            <div>선택된 모델: {modelId ?? '(없음)'}</div>
            <div style={{ position: 'relative', width: 512, height: 384, marginTop: 12, background: '#111' }}>
                {!isRunning && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <button
                            onClick={() => setIsRunning(true)}
                            style={{ padding: '14px 18px', borderRadius: 8, border: 'none', background: '#5a62f1', color: '#fff', fontSize: 18 }}
                        >
                            ▶ Run game
                        </button>
                    </div>
                )}
                {isRunning && (
                    <div style={{ display: 'grid', gap: 8 }}>
                        <iframe
                            title="pyxel-game"
                            src={iframeSrc}
                            width={512}
                            height={384}
                            style={{ border: 'none' }}
                            allow="autoplay; fullscreen; gamepad"
                        />
                        {streamUrl && (
                            <div style={{ marginTop: 8 }}>
                                <MjpegViewer src={streamUrl} width={512} height={384} />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {showSubmit && (
                <div style={{ display: 'grid', gap: 8, maxWidth: 480, marginTop: 12 }}>
                    <div>게임이 종료되었습니다. 점수를 등록하세요.</div>
                    <input placeholder="닉네임" value={nickname} onChange={(e) => setNickname(e.target.value)} />
                    <button
                        onClick={async () => {
                            if (lastScore == null) return
                            const res = await submitScore({ nickname, score: lastScore, modelId })
                            if ('ok' in res && res.ok) {
                                setShowSubmit(false)
                                setNickname('')
                            }
                        }}
                    >
                        등록
                    </button>
                </div>
            )}
        </div>
    )
}


