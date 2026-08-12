import { FormEvent, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { gameService } from '../services/gameService'
import { saveSession } from '../lib/session'
import { normaliseName, validatePin } from '../utils/game'
import { isSupabaseConfigured } from '../lib/supabase'

export function JoinPage() {
  const [params] = useSearchParams(); const navigate = useNavigate()
  const [pin, setPin] = useState((params.get('pin') || '').replace(/\D/g, '').slice(0, 6))
  const [name, setName] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  async function submit(event: FormEvent) { event.preventDefault(); const cleanName = normaliseName(name)
    if (!validatePin(pin)) return setError('Enter the 6-digit Game PIN.')
    if (!cleanName) return setError('Please enter your name.')
    if (cleanName.length > 24) return setError('Please use a name of 24 characters or fewer.')
    setBusy(true); setError('')
    try { const result = await gameService.joinGame(pin, cleanName); saveSession({ gamePin: pin, gameId: result.game.id, playerId: result.player.id, playerToken: result.player_token, name: result.player.name }); navigate(`/player/${pin}`) }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to join game.') } finally { setBusy(false) }
  }
  return <AppShell minimal><section className="card join-card"><p className="eyebrow">WELCOME, PLAYER</p><h1>Join the <em>celebration</em></h1><p className="muted">Enter the PIN on the host screen and choose a display name.</p>{!isSupabaseConfigured && <div className="notice">Add your Supabase values to <code>.env</code> before joining a game.</div>}<form onSubmit={submit}><label>Game PIN<input value={pin} inputMode="numeric" maxLength={6} placeholder="847291" onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}/></label><label>Your name<input value={name} maxLength={24} placeholder="Your Name" onChange={e => setName(e.target.value)}/></label>{error && <p className="error" role="alert">{error}</p>}<button className="button saffron wide" disabled={busy || !isSupabaseConfigured}>{busy ? 'Joining game…' : 'Join game →'}</button></form></section></AppShell>
}
