import type { Player } from '../types/game'
import { sortLeaderboard } from '../utils/game'

export function Leaderboard({ players, compact = false }: { players: Player[]; compact?: boolean }) {
  const rows = sortLeaderboard(players)
  return <section className="leaderboard"><div className="section-eyebrow">🏆 Live standings</div><h2>Leaderboard</h2><div className="rank-list">{rows.slice(0, compact ? 5 : 10).map((player, index) => <div className="rank-row" key={player.id}><span className="rank">{['🥇', '🥈', '🥉'][index] || `${index + 1}.`}</span><strong>{player.name}</strong><span>{player.score.toLocaleString()} <small>pts</small></span></div>)}{!rows.length && <p className="muted">Waiting for players to join…</p>}</div></section>
}
