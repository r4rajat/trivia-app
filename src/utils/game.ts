import type { Player } from '../types/game'

export const PIN_LENGTH = 6
export function validatePin(pin: string) { return new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin) }
export function normaliseName(name: string) { return name.trim().replace(/\s+/g, ' ') }
/** Correct answers are worth 20%–100% of base points depending on response time. */
export function calculateScore(correct: boolean, responseTime: number, timeLimit: number, basePoints: number) {
  if (!correct || responseTime > timeLimit || responseTime < 0) return 0
  return Math.round(basePoints * Math.max(0.2, (timeLimit - responseTime) / timeLimit))
}
export function isExpired(startedAt: string | null, timeLimit: number, now = Date.now()) {
  return !startedAt || now >= new Date(startedAt).getTime() + timeLimit * 1000
}
export function sortLeaderboard<T extends Pick<Player, 'score' | 'correct_answers' | 'total_response_time'>>(players: T[]) {
  return [...players].sort((a, b) => b.score - a.score || b.correct_answers - a.correct_answers || a.total_response_time - b.total_response_time)
}
