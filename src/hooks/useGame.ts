import { useCallback, useEffect, useState } from 'react'
import { gameService } from '../services/gameService'
import { supabase } from '../lib/supabase'
import type { Game, Player, PublicQuestion } from '../types/game'

export function useGame(pin?: string) {
  const [game, setGame] = useState<Game | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [question, setQuestion] = useState<PublicQuestion | null>(null)
  const [loading, setLoading] = useState(Boolean(pin))
  const [error, setError] = useState<string | null>(null)
  const refresh = useCallback(async () => {
    if (!pin) return
    try {
      const current = await gameService.getGame(pin)
      setGame(current)
      const [nextPlayers, nextQuestion] = await Promise.all([gameService.getPlayers(current.id), gameService.getQuestion(current.id)])
      setPlayers(nextPlayers); setQuestion(nextQuestion); setError(null)
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load this game.') }
    finally { setLoading(false) }
  }, [pin])
  useEffect(() => { void refresh() }, [refresh])
  useEffect(() => {
    const realtime = supabase
    if (!game || !realtime) return
    const channel = realtime.channel(`game-${game.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'games', filter: `id=eq.${game.id}` }, () => void refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `game_id=eq.${game.id}` }, () => void refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'answers', filter: `game_id=eq.${game.id}` }, () => void refresh())
      .subscribe()
    return () => { void realtime.removeChannel(channel) }
  }, [game?.id, refresh])
  return { game, players, question, loading, error, refresh }
}
