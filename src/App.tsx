import { Navigate, Route, Routes } from 'react-router-dom'
import { HostDashboard } from './pages/HostDashboard'
import { HostPage } from './pages/HostPage'
import { JoinPage } from './pages/JoinPage'
import { LandingPage } from './pages/LandingPage'
import { PlayerGame } from './pages/PlayerGame'

export default function App() { return <Routes><Route path="/" element={<LandingPage/>}/><Route path="/join" element={<JoinPage/>}/><Route path="/player/:gamePin" element={<PlayerGame/>}/><Route path="/host" element={<HostPage/>}/><Route path="/host/:gamePin" element={<HostDashboard/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes> }
