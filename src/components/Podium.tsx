import type { Player } from '../types/game'
import { sortLeaderboard } from '../utils/game'

export function Podium({ players }: { players: Player[] }) {
  const winners = sortLeaderboard(players).slice(0, 3)
  const positions = [winners[1], winners[0], winners[2]]
  return <div className="podium">{positions.map((player, slot) => player && <div className={`podium-place place-${slot + 1}`} key={player.id}><span>{['🥈', '🥇', '🥉'][slot]}</span><strong>{player.name}</strong><small>{player.score.toLocaleString()} points</small><div className="podium-block">{[2, 1, 3][slot]}</div></div>)}</div>
}
