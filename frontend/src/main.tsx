import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Home from './pages/Home.tsx'
import Play from './pages/Play.tsx'
import Rank from './pages/Rank.tsx'
import Watch from './pages/Watch.tsx'
import Replay from './pages/Replay.tsx'
import { ThemeProvider } from './contexts/ThemeContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Home />} />
            <Route path="play" element={<Play />} />
            <Route path="play/:modelId" element={<Play />} />
            <Route path="watch/:modelId" element={<Watch />} />
            <Route path="replay" element={<Replay />} />
            <Route path="replay/:replayId" element={<Replay />} />
            <Route path="rank" element={<Rank />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
