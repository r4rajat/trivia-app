export type GameStatus = 'LOBBY' | 'QUESTION_ACTIVE' | 'QUESTION_RESULTS' | 'FINISHED'

export interface Game {
  id: string
  game_pin: string
  title: string
  status: GameStatus
  current_question_index: number
  question_started_at: string | null
  created_at: string
}

export interface Player {
  id: string
  game_id: string
  name: string
  score: number
  correct_answers: number
  total_response_time: number
  joined_at: string
}

export interface PublicQuestion {
  id: string
  question_order: number
  question_text: string
  options: string[]
  time_limit: number
  points: number
}

export interface AnswerStats { selected_option: number; answer_count: number; correct_option?: number }
export interface Session { gamePin: string; gameId: string; playerId?: string; playerToken?: string; hostToken?: string; name?: string }
