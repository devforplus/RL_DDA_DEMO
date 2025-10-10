import { Link, Outlet } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <div>
      <header style={{ display: 'flex', gap: 24, alignItems: 'center', padding: 12 }}>
        <h1 style={{ margin: 0, fontSize: 18 }}>RL_DDA_DEMO</h1>
        <nav style={{ display: 'flex', gap: 8, background: '#ddd', padding: '6px 8px', borderRadius: 6 }}>
          <Link to="/play" style={{ padding: '6px 10px' }}>Play</Link>
          <Link to="/models" style={{ padding: '6px 10px' }}>Models</Link>
          <Link to="/rank" style={{ padding: '6px 10px' }}>Rank</Link>
        </nav>
      </header>
      <main style={{ padding: 12 }}>
        <Outlet />
      </main>
    </div>
  )
}

export default App
