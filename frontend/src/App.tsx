import { Link, Outlet } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      <header style={{
        display: 'flex',
        gap: 24,
        alignItems: 'center',
        padding: 12,
        background: '#1a1a2e',
        borderBottom: '1px solid #333'
      }}>
        <h1 style={{ margin: 0, fontSize: 18 }}>RL_DDA_DEMO</h1>
        <nav style={{
          display: 'flex',
          gap: 8,
          background: '#2a2a3e',
          padding: '6px 8px',
          borderRadius: 6
        }}>
          <Link to="/play" style={{ padding: '6px 10px', color: '#fff', textDecoration: 'none' }}>Play</Link>
          <Link to="/models" style={{ padding: '6px 10px', color: '#fff', textDecoration: 'none' }}>Models</Link>
          <Link to="/rank" style={{ padding: '6px 10px', color: '#fff', textDecoration: 'none' }}>Rank</Link>
        </nav>
      </header>
      <main style={{ padding: 0, minHeight: 'calc(100vh - 60px)' }}>
        <Outlet />
      </main>
    </div>
  )
}

export default App
