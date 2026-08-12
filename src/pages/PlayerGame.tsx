import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { Leaderboard } from '../components/Leaderboard'
import { Podium } from '../components/Podium'
import { Timer } from '../components/Timer'
import { useGame } from '../hooks/useGame'
import { getSession } from '../lib/session'
import { gameService } from '../services/gameService'
import { isExpired } from '../utils/game'

export function PlayerGame() {
  const { gamePin = '' } = useParams(); const { game, players, question, loading, error, refresh } = useGame(gamePin); const session = getSession(gamePin)
  const [submitted, setSubmitted] = useState(false); const [chosen, setChosen] = useState<number | null>(null); const [answerError, setAnswerError] = useState('')
  useEffect(() => { setSubmitted(false); setChosen(null); setAnswerError('') }, [game?.current_question_index, game?.status])
  async function answer(option: number) { if (!game || !question || !session?.playerId || !session.playerToken || submitted || isExpired(game.question_started_at, question.time_limit)) return
    setChosen(option); setSubmitted(true); try { await gameService.submitAnswer(game.id, session.playerId, session.playerToken, option); await refresh() } catch (err) { setSubmitted(false); setChosen(null); setAnswerError(err instanceof Error ? err.message : 'Could not submit your answer.') } }
  if (loading) return <AppShell minimal><p className="page-status">Joining the celebration…</p></AppShell>
  if (error || !game || !session?.playerId) return <AppShell minimal><section className="card"><h1>Session unavailable</h1><p className="error">{error || 'Please join the game again on this device.'}</p><Link className="button saffron" to={`/join?pin=${gamePin}`}>Join game</Link></section></AppShell>
  const me = players.find(p => p.id === session.playerId)
  if (game.status === 'FINISHED') return <AppShell minimal><section className="final player-final"><p className="eyebrow">🇮🇳 FINAL RESULTS 🇮🇳</p><h1>What a <em>finish!</em></h1><Podium players={players}/>{me && <p className="score-callout">You scored <b>{me.score.toLocaleString()} points</b></p>}<Leaderboard players={players} compact/></section></AppShell>
  if (game.status === 'LOBBY') return <AppShell minimal><section className="waiting"><div className="waiting-mark">🇮🇳</div><p className="eyebrow">YOU'RE IN</p><h1>Waiting for the <em>host…</em></h1><p>{players.length} player{players.length === 1 ? ' has' : 's have'} joined. Get ready to answer fast!</p><div className="pin-small">GAME PIN <b>{gamePin}</b></div></section></AppShell>
  if (game.status === 'QUESTION_RESULTS') return <AppShell minimal><section className="waiting"><p className="eyebrow">TIME'S UP</p><h1>Results are <em>coming in…</em></h1>{me && <p className="score-callout">Your score: <b>{me.score.toLocaleString()}</b></p>}<Leaderboard players={players} compact/></section></AppShell>
  return <AppShell minimal><section className="player-question"><div className="player-top"><span>QUESTION {question?.question_order ?? game.current_question_index + 1} / 20</span>{question && <Timer startedAt={game.question_started_at} seconds={question.time_limit}/>}</div><h1>{question?.question_text}</h1><div className="answer-grid">{question?.options.map((option, index) => <button key={option} className={`answer answer-${index} ${chosen === index ? 'selected' : ''}`} disabled={submitted || !question || isExpired(game.question_started_at, question.time_limit)} onClick={() => void answer(index)}><b>{'ABCD'[index]}</b><span>{option}</span></button>)}</div>{submitted ? <p className="submitted">✓ Answer submitted!</p> : answerError ? <p className="error">{answerError}</p> : <p className="muted center">Choose one answer before time runs out.</p>}<div className="score-footer"><span>Playing as <b>{session.name}</b></span><span>Score <b>{me?.score.toLocaleString() ?? 0}</b></span></div></section></AppShell>
}
