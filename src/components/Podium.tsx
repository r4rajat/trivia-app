import type { Player } from '../types/game'
import { sortLeaderboard } from '../utils/game'

export function Podium({ players }: { players: Player[] }) {
  const winners = sortLeaderboard(players).slice(0, 3)
  // Display order creates the familiar 2–1–3 podium, while `rank` controls
  // the actual medal and pedestal height (not its horizontal screen position).
  const positions = [
    { player: winners[1], rank: 2 },
    { player: winners[0], rank: 1 },
    { player: winners[2], rank: 3 },
  ]
  const medals = ['🥇', '🥈', '🥉']
  return <div className="podium">{positions.map(({ player, rank }) => player && <div className={`podium-place place-${rank}`} key={player.id}><span>{medals[rank - 1]}</span><strong>{player.name}</strong><small>{player.score.toLocaleString()} points</small><div className="podium-block">{rank}</div></div>)}</div>
}
