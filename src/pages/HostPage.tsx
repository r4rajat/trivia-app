import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { gameService } from '../services/gameService'
import { saveSession } from '../lib/session'
import { isSupabaseConfigured } from '../lib/supabase'

export function HostPage() { const navigate = useNavigate(); const [busy, setBusy] = useState(false); const [error, setError] = useState('')
  async function create() { setBusy(true); setError(''); try { const result = await gameService.createGame(); saveSession({ gamePin: result.game.game_pin, gameId: result.game.id, hostToken: result.host_token }); navigate(`/host/${result.game.game_pin}`) } catch (err) { setError(err instanceof Error ? err.message : 'Unable to create a game.') } finally { setBusy(false) } }
  return <AppShell><section className="card host-start"><div className="host-icon">🎙️</div><p className="eyebrow">HOST CONSOLE</p><h1>Ready to lead the <em>quiz?</em></h1><p className="muted">Create a room for the 20-question Independence Day challenge. Your game PIN and QR code are ready in seconds.</p>{!isSupabaseConfigured && <div className="notice">Configure Supabase in <code>.env</code> first.</div>}{error && <p className="error">{error}</p>}<button className="button green wide" onClick={() => void create()} disabled={busy || !isSupabaseConfigured}>{busy ? 'Creating game…' : 'Create game →'}</button></section></AppShell> }
