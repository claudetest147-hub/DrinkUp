export type GameType = 'truth_or_dare' | 'would_you_rather' | 'most_likely_to';
export type Intensity = 'mild' | 'spicy' | 'extreme';

export interface Player {
  id: string;
  name: string;
  score: number;
  drinks: number;
}

export interface GameCard {
  id: string;
  game_type: GameType;
  content: string;
  card_subtype?: 'truth' | 'dare';
  option_a?: string;
  option_b?: string;
  intensity: Intensity;
  drink_penalty: number;
  is_premium: boolean;
}

export interface ContentPack {
  id: string;
  name: string;
  description: string;
  game_type: GameType;
  is_daily: boolean;
  is_premium: boolean;
  trending_topic?: string;
  play_count: number;
  cards?: GameCard[];
}

export interface GameSession {
  id: string;
  game_type: GameType;
  players: Player[];
  currentPlayerIndex: number;
  currentCardIndex: number;
  cards: GameCard[];
  intensity: Intensity;
  isActive: boolean;
}

export interface UserProfile {
  id: string;
  username?: string;
  display_name?: string;
  is_pro: boolean;
  daily_streak: number;
  total_games_played: number;
}
