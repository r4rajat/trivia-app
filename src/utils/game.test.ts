import { describe, expect, it } from 'vitest'
import { calculateScore, isExpired, normaliseName, sortLeaderboard, validatePin } from './game'

describe('game rules', () => {
  it('generates valid pin shapes', () => { expect(validatePin('847291')).toBe(true); expect(validatePin('8472')).toBe(false); expect(validatePin('abcd12')).toBe(false) })
  it('awards no points for incorrect or late answers', () => { expect(calculateScore(false, 1, 20, 1000)).toBe(0); expect(calculateScore(true, 21, 20, 1000)).toBe(0) })
  it('uses a speed score with a reasonable floor', () => { expect(calculateScore(true, 10, 20, 1000)).toBe(500); expect(calculateScore(true, 19.9, 20, 1000)).toBe(200) })
  it('detects timer expiration', () => { expect(isExpired('2026-01-01T00:00:00.000Z', 20, Date.parse('2026-01-01T00:00:20.000Z'))).toBe(true) })
  it('sorts leaderboard by score, correctness, then response time', () => { const rows = sortLeaderboard([{ score: 100, correct_answers: 1, total_response_time: 8 }, { score: 100, correct_answers: 2, total_response_time: 20 }, { score: 100, correct_answers: 2, total_response_time: 5 }]); expect(rows.map(row => row.total_response_time)).toEqual([5, 20, 8]) })
  it('normalises duplicate-name candidates', () => { expect(normaliseName('  Rajat   Gupta ')).toBe('Rajat Gupta') })
})
