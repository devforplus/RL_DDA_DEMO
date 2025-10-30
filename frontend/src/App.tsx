import { Link, Outlet } from 'react-router-dom'
import './App.css'
import { useTheme } from './contexts/ThemeContext'
import { darkTheme, lightTheme } from './theme/colors'

function App() {
  const { theme, toggleTheme } = useTheme()
  const colors = theme === 'dark' ? darkTheme : lightTheme

  return (
    <div style={{ minHeight: '100vh', background: colors.background, color: colors.text }}>
      <header style={{
        display: 'flex',
        gap: 24,
        alignItems: 'center',
        padding: 12,
        background: colors.headerBg,
        borderBottom: `1px solid ${colors.headerBorder}`
      }}>
        <h1 style={{ margin: 0, fontSize: 18, color: colors.text }}>RL_DDA_DEMO</h1>
        <nav style={{
          display: 'flex',
          gap: 8,
          background: colors.navBg,
          padding: '6px 8px',
          borderRadius: 6
        }}>
          <Link to="/play" style={{ padding: '6px 10px', color: colors.navText, textDecoration: 'none' }}>Play</Link>
          <Link to="/models" style={{ padding: '6px 10px', color: colors.navText, textDecoration: 'none' }}>Models</Link>
          <Link to="/rank" style={{ padding: '6px 10px', color: colors.navText, textDecoration: 'none' }}>Rank</Link>
        </nav>
        <button
          onClick={toggleTheme}
          style={{
            marginLeft: 'auto',
            padding: '8px 16px',
            borderRadius: 6,
            border: `1px solid ${colors.cardBorder}`,
            background: colors.navBg,
            color: colors.text,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
          title={`${theme === 'dark' ? '라이트' : '다크'} 모드로 전환`}
        >
          {theme === 'dark' ? '☀️' : '🌙'} {theme === 'dark' ? '라이트' : '다크'}
        </button>
      </header>
      <main style={{ padding: 0, minHeight: 'calc(100vh - 60px)' }}>
        <Outlet />
      </main>
    </div>
  )
}

export default App
