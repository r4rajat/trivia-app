import { supabase } from '../lib/supabase'
import type { AnswerStats, Game, Player, PublicQuestion } from '../types/game'

function client() { if (!supabase) throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.') ; return supabase }
async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T> { const { data, error } = await client().rpc(name, args); if (error) throw error; return data as T }

export const gameService = {
  createGame: () => rpc<{ game: Game; host_token: string }>('create_game', {}),
  joinGame: (pin: string, name: string) => rpc<{ game: Game; player: Player; player_token: string }>('join_game', { p_game_pin: pin, p_name: name }),
  getGame: async (pin: string) => { const { data, error } = await client().from('games').select('*').eq('game_pin', pin).single(); if (error) throw error; return data as Game },
  getPlayers: async (gameId: string) => { const { data, error } = await client().from('players').select('*').eq('game_id', gameId); if (error) throw error; return data as Player[] },
  getQuestion: (gameId: string) => rpc<PublicQuestion | null>('get_current_question', { p_game_id: gameId }),
  getStats: (gameId: string) => rpc<AnswerStats[]>('get_answer_stats', { p_game_id: gameId }),
  controlGame: (gameId: string, token: string, action: 'start' | 'next' | 'end') => rpc<Game>('control_game', { p_game_id: gameId, p_host_token: token, p_action: action }),
  submitAnswer: (gameId: string, playerId: string, token: string, option: number) => rpc<{ points_awarded: number }>('submit_answer', { p_game_id: gameId, p_player_id: playerId, p_player_token: token, p_selected_option: option }),
}
