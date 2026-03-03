import { supabase } from './supabase';
import { GameType, Intensity } from '../types';

export async function generateAIContent(
  gameType: GameType,
  intensity: Intensity,
  playerNames: string[],
  trendingTopic?: string
) {
  try {
    const { data, error } = await supabase.functions.invoke('generate-content', {
      body: {
        game_type: gameType,
        intensity,
        count: 15,
        player_names: playerNames,
        trending_topic: trendingTopic,
      },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('AI generation failed:', error);
    return null;
  }
}

export async function fetchDailyPack(gameType: GameType) {
  try {
    const { data, error } = await supabase
      .from('content_packs')
      .select('*, cards(*)')
      .eq('game_type', gameType)
      .eq('is_daily', true)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Daily pack fetch failed:', error);
    return null;
  }
}
