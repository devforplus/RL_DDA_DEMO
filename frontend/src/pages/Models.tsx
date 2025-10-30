import { useTheme } from '../contexts/ThemeContext'
import { darkTheme, lightTheme } from '../theme/colors'

export default function Models() {
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
            <h2 style={{ color: colors.text }}>현재 미구현 기능입니다.</h2>
        </div>
    )
}

