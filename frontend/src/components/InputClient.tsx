import { useEffect } from 'react'

type Props = {
    url: string
}

export default function InputClient({ url }: Props) {
    useEffect(() => {
        const ws = new WebSocket(url)
        const keydown = (e: KeyboardEvent) => {
            ws.send(JSON.stringify({ type: 'keydown', code: e.code }))
        }
        const keyup = (e: KeyboardEvent) => {
            ws.send(JSON.stringify({ type: 'keyup', code: e.code }))
        }
        window.addEventListener('keydown', keydown)
        window.addEventListener('keyup', keyup)
        return () => {
            window.removeEventListener('keydown', keydown)
            window.removeEventListener('keyup', keyup)
            ws.close()
        }
    }, [url])
    return null
}



