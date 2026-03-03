import { supabase } from './supabase';
import { GameCard, GameType, Intensity } from '../types';
import { 
  FALLBACK_TRUTH_OR_DARE, 
  FALLBACK_WOULD_YOU_RATHER, 
  FALLBACK_MOST_LIKELY_TO,
  FALLBACK_NEVER_HAVE_I_EVER
} from '../constants/fallbackContent';

export async function fetchCards(
  gameType: GameType,
  intensity: Intensity,
  count: number = 20
): Promise<GameCard[]> {
  try {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('game_type', gameType)
      .eq('intensity', intensity)
      .limit(count);

    if (error) throw error;
    
    if (data && data.length > 0) {
      return data as GameCard[];
    }
    
    // Fallback to hardcoded content
    return getFallbackContent(gameType);
  } catch (error) {
    console.error('Error fetching cards:', error);
    return getFallbackContent(gameType);
  }
}

function getFallbackContent(gameType: GameType): GameCard[] {
  switch (gameType) {
    case 'truth_or_dare':
      return FALLBACK_TRUTH_OR_DARE;
    case 'would_you_rather':
      return FALLBACK_WOULD_YOU_RATHER;
    case 'most_likely_to':
      return FALLBACK_MOST_LIKELY_TO;
    case 'never_have_i_ever':
      return FALLBACK_NEVER_HAVE_I_EVER;
    default:
      return [];
  }
}
