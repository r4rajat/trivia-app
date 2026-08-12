import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { AppShell } from '../components/AppShell'
import { Leaderboard } from '../components/Leaderboard'
import { Podium } from '../components/Podium'
import { Timer } from '../components/Timer'
import { useGame } from '../hooks/useGame'
import { getSession } from '../lib/session'
import { gameService } from '../services/gameService'
import type { AnswerStats } from '../types/game'

export function HostDashboard() {
  const { gamePin = '' } = useParams(); const { game, players, question, loading, error, refresh } = useGame(gamePin)
  const session = getSession(gamePin); const [actionBusy, setActionBusy] = useState(false); const [stats, setStats] = useState<AnswerStats[]>([]); const [actionError, setActionError] = useState('')
  // GitHub Pages does not rewrite /join to index.html. The root URL is always
  // served, and App routes this query string to the join screen.
  const joinUrl = useMemo(() => `${window.location.origin}${import.meta.env.BASE_URL}?join=1&pin=${gamePin}`, [gamePin])
  useEffect(() => { if (game?.status === 'QUESTION_RESULTS' || game?.status === 'QUESTION_ACTIVE') gameService.getStats(game.id).then(setStats).catch(() => setStats([])) }, [game?.id, game?.status, players])
  async function control(action: 'start' | 'next' | 'end') { if (!game || !session?.hostToken) return setActionError('This browser does not have the host key. Create the game here or restore the host session.')
    setActionBusy(true); setActionError(''); try { await gameService.controlGame(game.id, session.hostToken, action); await refresh() } catch (err) { setActionError(err instanceof Error ? err.message : 'Game action failed.') } finally { setActionBusy(false) } }
  if (loading) return <AppShell><p className="page-status">Loading host dashboard…</p></AppShell>
  if (error || !game) return <AppShell><section className="card"><h1>Game unavailable</h1><p className="error">{error || 'This game does not exist.'}</p><Link className="button saffron" to="/host">Create a game</Link></section></AppShell>
  if (game.status === 'FINISHED') return <AppShell><section className="final"><p className="eyebrow">🇮🇳 FINAL RESULTS 🇮🇳</p><h1>Freedom <em>champions</em></h1><Podium players={players}/><p>Congratulations to everyone who played!</p><Link className="button green" to="/host">Host another game</Link></section></AppShell>
  const active = game.status === 'QUESTION_ACTIVE'
  const statsFor = (index: number) => stats.find(row => row.selected_option === index)?.answer_count || 0
  return <AppShell><div className="host-grid"><section className="host-main"><div className="pin-banner"><span>GAME PIN</span><strong>{game.game_pin}</strong><span>{players.length} player{players.length === 1 ? '' : 's'} joined</span></div>{game.status === 'LOBBY' && <div className="lobby-host"><div className="qr"><QRCodeSVG value={joinUrl} size={170} bgColor="#fffdf8" fgColor="#123b30"/><small>Scan to join</small></div><div><p className="eyebrow">LOBBY OPEN</p><h1>Gather your <em>players</em></h1><p className="muted">Ask everyone to scan the QR code or visit the join page, then enter <b>{game.game_pin}</b>.</p><div className="player-pills">{players.length ? players.map(p => <span key={p.id}>✦ {p.name}</span>) : <span>Waiting for the first player…</span>}</div><button className="button saffron" disabled={actionBusy || !players.length} onClick={() => void control('start')}>{actionBusy ? 'Starting…' : 'Start game →'}</button></div></div>}{active && question && <div className="question-host"><div className="question-top"><p>QUESTION {question.question_order} OF 20</p><Timer startedAt={game.question_started_at} seconds={question.time_limit} onExpire={() => void control('next')}/></div><h1>{question.question_text}</h1><div className="host-options">{question.options.map((option, index) => <div key={option}><b>{'ABCD'[index]}</b><span>{option}</span><em>{statsFor(index)}</em></div>)}</div><button className="button outline" disabled={actionBusy} onClick={() => void control('next')}>End question & show results</button></div>}{game.status === 'QUESTION_RESULTS' && <div className="results-host"><p className="eyebrow">QUESTION COMPLETE</p><h1>See how everyone <em>did</em></h1>{question && <div className="host-options">{question.options.map((option, index) => <div key={option}><b>{'ABCD'[index]}</b><span>{option}</span><em>{statsFor(index)}</em></div>)}</div>}<button className="button green" disabled={actionBusy} onClick={() => void control('next')}>{actionBusy ? 'Loading…' : game.current_question_index >= 19 ? 'Show final podium →' : 'Next question →'}</button></div>}{actionError && <p className="error">{actionError}</p>}</section><aside><Leaderboard players={players}/><button className="text-button" disabled={actionBusy} onClick={() => void control('end')}>End game early</button></aside></div></AppShell>
}
