import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function AppShell({ children, minimal = false }: { children: ReactNode; minimal?: boolean }) {
  return <main className={minimal ? 'app minimal' : 'app'}><nav><Link to="/" className="brand"><span className="flag">🇮🇳</span><span>INDIA<br/><b>TRIVIA</b></span></Link><span className="nav-note">Independence Day Edition</span></nav>{children}</main>
}
