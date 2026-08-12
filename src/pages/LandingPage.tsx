import { Link } from 'react-router-dom'
import { AppShell } from '../components/AppShell'

export function LandingPage() { return <AppShell><section className="hero"><div className="chakra" aria-hidden="true">☸</div><p className="eyebrow">15 AUGUST · CELEBRATE FREEDOM</p><h1>Independence<br/><em>Day Trivia</em></h1><p className="hero-copy">Test your knowledge of India. Join the celebration, answer fast, and rise to the top of the leaderboard.</p><div className="hero-actions"><Link className="button saffron" to="/join">Join a game <span>→</span></Link><Link className="button outline" to="/host">Host a game</Link></div><div className="tricolor"/><div className="hero-facts"><span>⚡ Fast-paced</span><span>🏆 Live leaderboard</span><span>📱 Phone friendly</span></div></section></AppShell> }
