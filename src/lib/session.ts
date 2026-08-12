import type { Session } from '../types/game'

const keyFor = (pin: string) => `independence-trivia:${pin}`
export function saveSession(session: Session) { localStorage.setItem(keyFor(session.gamePin), JSON.stringify(session)) }
export function getSession(pin: string): Session | null { try { return JSON.parse(localStorage.getItem(keyFor(pin)) || 'null') } catch { return null } }
