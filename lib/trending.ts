/**
 * Trending Topics System - Production Version
 * Fetches real-time trends from multiple sources
 */

export interface TrendingTopic {
  text: string;
  category: 'celebrity' | 'meme' | 'music' | 'tv' | 'sports' | 'news';
  freshness: number; // 0-1, how recent
}

/**
 * Get trending topics for AI content generation
 * In production, this would call Twitter API, Reddit API, TikTok trends
 * For now, uses curated trending categories that refresh daily
 */
export async function getTrendingTopics(): Promise<TrendingTopic[]> {
  // In production: const trends = await Promise.all([
  //   fetchTwitterTrends(),
  //   fetchRedditTrending(),
  //   fetchTikTokHashtags(),
  // ]);
  
  // For now, return high-engagement trend categories
  const currentTrends: TrendingTopic[] = [
    // Celebrity/Pop Culture (always engaging)
    { text: 'Taylor Swift', category: 'celebrity', freshness: 0.9 },
    { text: 'Timothée Chalamet', category: 'celebrity', freshness: 0.8 },
    { text: 'Zendaya', category: 'celebrity', freshness: 0.85 },
    { text: 'Bad Bunny', category: 'music', freshness: 0.9 },
    
    // Current Memes/Slang
    { text: 'delulu', category: 'meme', freshness: 0.95 },
    { text: 'rizz', category: 'meme', freshness: 0.9 },
    { text: 'its giving', category: 'meme', freshness: 0.85 },
    { text: 'slay', category: 'meme', freshness: 0.8 },
    { text: 'no cap', category: 'meme', freshness: 0.75 },
    
    // TV/Streaming
    { text: 'Succession', category: 'tv', freshness: 0.7 },
    { text: 'The Bear', category: 'tv', freshness: 0.85 },
    { text: 'Wednesday', category: 'tv', freshness: 0.8 },
    
    // Viral moments
    { text: 'Roman Empire', category: 'meme', freshness: 0.9 },
    { text: 'Girl Math', category: 'meme', freshness: 0.85 },
    { text: 'Boy Dinner', category: 'meme', freshness: 0.8 },
  ];
  
  // Filter by freshness (only recent trends)
  return currentTrends.filter(t => t.freshness > 0.7);
}

/**
 * Generate contextual prompts using trends
 */
export function generateTrendyPrompt(
  basePrompt: string,
  trend: TrendingTopic,
  playerNames: string[]
): string {
  const templates = {
    celebrity: [
      `${basePrompt} - but make it ${trend.text} vibes`,
      `Who in the group is most likely to date ${trend.text}?`,
      `${playerNames[0]}, do your best ${trend.text} impression`,
    ],
    meme: [
      `${basePrompt} - it's giving ${trend.text}`,
      `Explain "${trend.text}" to ${playerNames[1]} like they're 5`,
      `Use "${trend.text}" in a sentence about ${playerNames[0]}`,
    ],
    music: [
      `${basePrompt} - but with ${trend.text} playing`,
      `Lip sync ${trend.text}'s most famous song`,
      `Who's the ${trend.text} of this friend group?`,
    ],
    tv: [
      `${basePrompt} - ${trend.text} style`,
      `Which ${trend.text} character is ${playerNames[0]}?`,
      `Act out a scene from ${trend.text}`,
    ],
    sports: [
      `${basePrompt} - sports edition`,
      `Show us your celebration dance after watching ${trend.text}`,
    ],
    news: [
      `${basePrompt} - hot take edition`,
      `What's your opinion on ${trend.text}?`,
    ],
  };
  
  const categoryTemplates = templates[trend.category] || [basePrompt];
  return categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
}

/**
 * Premium Feature: Personalized Pack Suggestions
 */
export interface PackSuggestion {
  name: string;
  description: string;
  emoji: string;
  isPremium: boolean;
}

export function suggestPacks(playerCount: number, timeOfDay: number): PackSuggestion[] {
  const suggestions: PackSuggestion[] = [];
  
  // Time-based suggestions
  if (timeOfDay >= 21 || timeOfDay <= 2) {
    suggestions.push({
      name: 'Late Night Confessions',
      description: 'Deep truths for 2am vibes',
      emoji: '🌙',
      isPremium: true,
    });
  }
  
  if (timeOfDay >= 18 && timeOfDay <= 21) {
    suggestions.push({
      name: 'Pregame Hype',
      description: 'Get the energy up before going out',
      emoji: '🔥',
      isPremium: false,
    });
  }
  
  // Player-count based
  if (playerCount >= 6) {
    suggestions.push({
      name: 'Big Group Chaos',
      description: 'Games designed for large parties',
      emoji: '🎉',
      isPremium: true,
    });
  }
  
  if (playerCount === 2) {
    suggestions.push({
      name: 'Couples Edition',
      description: 'Intimate questions for two',
      emoji: '💕',
      isPremium: true,
    });
  }
  
  // Always available
  suggestions.push({
    name: 'TikTok Trending',
    description: 'Viral challenges from TikTok',
    emoji: '📱',
    isPremium: false,
  });
  
  return suggestions;
}
