import { useEffect, useRef } from 'react'

type Props = {
    src: string
    width?: number
    height?: number
}

export default function MjpegViewer({ src, width, height }: Props) {
    const imgRef = useRef<HTMLImageElement | null>(null)

    useEffect(() => {
        const img = imgRef.current
        if (!img) return
        img.src = src
        return () => {
            img.src = ''
        }
    }, [src])

    return <img ref={imgRef} alt="stream" style={{ width, height, imageRendering: 'pixelated' as const }} />
}



