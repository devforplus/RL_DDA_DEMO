import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
    const nav = useNavigate()
    useEffect(() => {
        nav('/play', { replace: true })
    }, [nav])
    return null
}


