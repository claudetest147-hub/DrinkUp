/**
 * Premium Features - What Pro Users Get
 * These features justify the $5.99/month subscription
 */

import { GameCard, Player } from '../types';

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiresPro: boolean;
}

export const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    id: 'unlimited',
    name: 'Unlimited Cards',
    description: 'Play as long as you want - no 10 card limit',
    icon: '♾️',
    requiresPro: true,
  },
  {
    id: 'extreme',
    name: 'Extreme Mode',
    description: '18+ rated content, no holding back',
    icon: '🔥',
    requiresPro: true,
  },
  {
    id: 'ai_personalized',
    name: 'AI Personalization',
    description: 'Content adapts to your friend group dynamics',
    icon: '🤖',
    requiresPro: true,
  },
  {
    id: 'photo_challenges',
    name: 'Photo & Video Challenges',
    description: 'Take pics/videos of challenges, auto-save memories',
    icon: '📸',
    requiresPro: true,
  },
  {
    id: 'voice_acting',
    name: 'Voice Acting',
    description: 'AI voice reads prompts out loud (hands-free mode)',
    icon: '🎙️',
    requiresPro: true,
  },
  {
    id: 'custom_packs',
    name: 'Custom Packs',
    description: 'Bachelorette, College, Road Trip themed packs',
    icon: '🎨',
    requiresPro: true,
  },
  {
    id: 'leaderboards',
    name: 'Leaderboards',
    description: 'Track who drinks most, who\'s bravest, etc.',
    icon: '🏆',
    requiresPro: true,
  },
  {
    id: 'no_ads',
    name: 'Ad-Free Experience',
    description: 'No interruptions during games',
    icon: '🚫',
    requiresPro: true,
  },
];

/**
 * Photo Challenge System
 * Premium feature: Cards with photo/video requirements
 */
export interface PhotoChallenge extends GameCard {
  challengeType: 'photo' | 'video' | 'boomerang';
  duration?: number; // seconds for video
  filters?: string[]; // Instagram-style filters
}

export function generatePhotoChallenge(player: Player, otherPlayers: Player[]): PhotoChallenge {
  const challenges = [
    `${player.name}, take a selfie with the ugliest face you can make`,
    `Group photo: everyone do their best ${otherPlayers[0]?.name} impression`,
    `${player.name}, recreate a TikTok dance (video required)`,
    `Boomerang of ${player.name} doing a shot`,
    `${player.name}, take a photo pretending to kiss ${otherPlayers[0]?.name}`,
    `Group pic: everyone point at who's most likely to get arrested tonight`,
    `${player.name}, video yourself giving ${otherPlayers[1]?.name} a compliment`,
  ];
  
  return {
    id: `photo_${Date.now()}`,
    game_type: 'truth_or_dare',
    content: challenges[Math.floor(Math.random() * challenges.length)],
    intensity: 'spicy',
    drink_penalty: 2,
    is_premium: true,
    challengeType: Math.random() > 0.7 ? 'video' : 'photo',
    duration: 10,
    filters: ['blur', 'black_white', 'vintage'],
  };
}

/**
 * Streak System with Rewards
 */
export interface StreakReward {
  day: number;
  reward: string;
  unlocked: boolean;
}

export const STREAK_REWARDS: StreakReward[] = [
  { day: 3, reward: 'Unlock "Deep Questions" pack', unlocked: false },
  { day: 7, reward: 'Unlock voice acting feature', unlocked: false },
  { day: 14, reward: 'Unlock "Couples Edition" pack', unlocked: false },
  { day: 30, reward: '1 month free Pro subscription', unlocked: false },
  { day: 60, reward: 'Exclusive "Legend" badge', unlocked: false },
  { day: 90, reward: 'Early access to new games', unlocked: false },
];

/**
 * Leaderboard Tracking
 */
export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  stats: {
    gamesPlayed: number;
    totalDrinks: number;
    truthsCompleted: number;
    daresCompleted: number;
    braveryScore: number; // 0-100
  };
  rank: number;
}

export function calculateBraveryScore(
  daresCompleted: number,
  truthsCompleted: number,
  daresRefused: number
): number {
  const completionRate = daresCompleted / (daresCompleted + daresRefused + 0.01);
  const activityBonus = Math.min((daresCompleted + truthsCompleted) / 100, 1);
  return Math.round((completionRate * 70 + activityBonus * 30) * 100);
}

/**
 * Custom Pack Themes
 */
export interface CustomPack {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: 'relationship' | 'party' | 'travel' | 'friends' | 'adult';
  requiresPro: boolean;
  cardCount: number;
}

export const CUSTOM_PACKS: CustomPack[] = [
  {
    id: 'bachelorette',
    name: 'Bachelorette Party',
    description: 'Spicy questions for the bride-to-be',
    emoji: '👰',
    category: 'relationship',
    requiresPro: true,
    cardCount: 50,
  },
  {
    id: 'college',
    name: 'College Edition',
    description: 'Dorm room vibes, campus life questions',
    emoji: '🎓',
    category: 'friends',
    requiresPro: false,
    cardCount: 40,
  },
  {
    id: 'road_trip',
    name: 'Road Trip',
    description: 'Long drive entertainment',
    emoji: '🚗',
    category: 'travel',
    requiresPro: true,
    cardCount: 35,
  },
  {
    id: 'couples',
    name: 'Couples Deep Dive',
    description: 'Intimate questions for two',
    emoji: '💕',
    category: 'relationship',
    requiresPro: true,
    cardCount: 60,
  },
  {
    id: 'work',
    name: 'Office Party',
    description: 'PG-13 for coworkers (no HR violations)',
    emoji: '💼',
    category: 'party',
    requiresPro: false,
    cardCount: 30,
  },
  {
    id: 'nsfw',
    name: 'After Dark',
    description: '21+ only. Extremely spicy.',
    emoji: '🌶️',
    category: 'adult',
    requiresPro: true,
    cardCount: 80,
  },
];

/**
 * AI Voice Acting (Premium Feature)
 */
export interface VoiceSettings {
  enabled: boolean;
  voice: 'male' | 'female' | 'robot' | 'celebrity';
  speed: number; // 0.5 to 2.0
  pitch: number; // -10 to 10
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  enabled: false,
  voice: 'female',
  speed: 1.0,
  pitch: 0,
};

/**
 * Premium Analytics
 */
export interface GameAnalytics {
  sessionsPlayed: number;
  averageSessionLength: number; // minutes
  favoritegame: string;
  totalDrinks: number;
  busiestDay: string;
  busiestHour: number;
  friendStats: {
    name: string;
    gamesPlayed: number;
    drinksCount: number;
  }[];
}
