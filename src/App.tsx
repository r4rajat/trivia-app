import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { HostDashboard } from './pages/HostDashboard'
import { HostPage } from './pages/HostPage'
import { JoinPage } from './pages/JoinPage'
import { LandingPage } from './pages/LandingPage'
import { PlayerGame } from './pages/PlayerGame'

export default function App() {
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  if (location.pathname === '/' && query.get('join') === '1') return <Navigate to={`/join?pin=${encodeURIComponent(query.get('pin') || '')}`} replace />
  return <Routes><Route path="/" element={<LandingPage/>}/><Route path="/join" element={<JoinPage/>}/><Route path="/player/:gamePin" element={<PlayerGame/>}/><Route path="/host" element={<HostPage/>}/><Route path="/host/:gamePin" element={<HostDashboard/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes>
}
