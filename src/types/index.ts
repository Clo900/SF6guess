export interface User {
  id: string;
  username: string;
  nickname?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Tournament {
  id: string;
  name: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  start_date?: string;
  end_date?: string;
  created_at: string;
}

export interface Stage {
  id: string;
  tournament_id: string;
  name: string;
  order: number;
  deadline?: string;
  created_at?: string;
}

export interface Group {
  id: string;
  stage_id: string;
  name: string;
  type: string;
}

export interface Team {
  id: string;
  name: string;
  logo_url?: string;
  seed?: number;
}

export interface Match {
  id: string;
  group_id: string;
  team1_id?: string;
  team2_id?: string;
  winner_id?: string;
  score?: string;
  scheduled_at?: string;
  team1?: Team;
  team2?: Team;
  winner?: Team;
}

export interface Prediction {
  id: string;
  user_id: string;
  match_id: string;
  predicted_winner_id?: string;
  predicted_score?: string;
  is_correct?: boolean;
  created_at: string;
}

export interface KnockoutMatch {
  id: string;
  tournament_id: string;
  round: string;
  team1_source: string;
  team2_source: string;
  winner_id?: string;
  score?: string;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  nickname?: string;
  score: number;
  correct_predictions: number;
  total_predictions: number;
  correct_items: number;
  total_items: number;
  possible_items: number;
  accuracy: number;
}
