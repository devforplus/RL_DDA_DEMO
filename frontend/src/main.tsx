import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Home from './pages/Home.tsx'
import Play from './pages/Play.tsx'
import Models from './pages/Models.tsx'
import Rank from './pages/Rank.tsx'
import Watch from './pages/Watch.tsx'
import Replay from './pages/Replay.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="play" element={<Play />} />
          <Route path="play/:modelId" element={<Play />} />
          <Route path="watch/:modelId" element={<Watch />} />
          <Route path="replay/:replayId" element={<Replay />} />
          <Route path="models" element={<Models />} />
          <Route path="rank" element={<Rank />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
