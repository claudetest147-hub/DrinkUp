import { supabase } from './supabase';
import { GameType, Intensity } from '../types';
import { getTrendingTopics, generateTrendyPrompt } from './trending';

export async function generateAIContent(
  gameType: GameType,
  intensity: Intensity,
  playerNames: string[],
  trendingTopic?: string
) {
  try {
    // Get real trending topics for context
    const trends = await getTrendingTopics();
    const topTrend = trends[0]?.text || trendingTopic;
    
    const { data, error } = await supabase.functions.invoke('generate-content', {
      body: {
        game_type: gameType,
        intensity,
        count: 15,
        player_names: playerNames,
        trending_topic: topTrend,
        context: {
          trends: trends.slice(0, 5).map(t => t.text),
          playerCount: playerNames.length,
          timestamp: Date.now(),
        },
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
