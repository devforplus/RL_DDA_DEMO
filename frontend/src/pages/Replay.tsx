import { useTheme } from '../contexts/ThemeContext'
import { darkTheme, lightTheme } from '../theme/colors'

export default function Replay() {
    const { theme } = useTheme()
    const colors = theme === 'dark' ? darkTheme : lightTheme
    
    return (
        <div style={{ 
            display: 'grid', 
            gap: 12,
            padding: '40px 20px',
            minHeight: 'calc(100vh - 60px)',
            background: colors.background
        }}>
            <h1 style={{ color: colors.text }}>현재 미구현 기능입니다.</h1>
        </div>
    )
}



