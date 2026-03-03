/**
 * Viral Content - Research-Backed Party Game Prompts
 * Based on what actually gets shared and goes viral on TikTok/Instagram
 */

import { GameCard } from '../types';

/**
 * Truth or Dare - Viral Edition
 * These are proven to get reactions and shares
 */
export const VIRAL_TRUTH_OR_DARE: GameCard[] = [
  // Truths that spark conversations
  {
    id: 'viral_tod_1',
    game_type: 'truth_or_dare',
    card_subtype: 'truth',
    content: 'What's the most embarrassing thing in your camera roll right now?',
    intensity: 'spicy',
    drink_penalty: 2,
    is_premium: false,
  },
  {
    id: 'viral_tod_2',
    game_type: 'truth_or_dare',
    card_subtype: 'truth',
    content: 'Who in this room would you trust with a secret, and who absolutely not?',
    intensity: 'spicy',
    drink_penalty: 2,
    is_premium: false,
  },
  {
    id: 'viral_tod_3',
    game_type: 'truth_or_dare',
    card_subtype: 'truth',
    content: 'Read your last 3 texts out loud WITHOUT context',
    intensity: 'spicy',
    drink_penalty: 2,
    is_premium: false,
  },
  {
    id: 'viral_tod_4',
    game_type: 'truth_or_dare',
    card_subtype: 'truth',
    content: 'Show us your "For You" page on TikTok and we'll judge you',
    intensity: 'mild',
    drink_penalty: 1,
    is_premium: false,
  },
  {
    id: 'viral_tod_5',
    game_type: 'truth_or_dare',
    card_subtype: 'truth',
    content: 'What's your most toxic trait that you refuse to fix?',
    intensity: 'spicy',
    drink_penalty: 2,
    is_premium: false,
  },
  // Dares that create shareable moments
  {
    id: 'viral_tod_6',
    game_type: 'truth_or_dare',
    card_subtype: 'dare',
    content: 'Post an Instagram story that just says "hey" and tag your most recent ex',
    intensity: 'extreme',
    drink_penalty: 3,
    is_premium: true,
  },
  {
    id: 'viral_tod_7',
    game_type: 'truth_or_dare',
    card_subtype: 'dare',
    content: 'Let the person to your right post a BeReal using your phone',
    intensity: 'spicy',
    drink_penalty: 2,
    is_premium: false,
  },
  {
    id: 'viral_tod_8',
    game_type: 'truth_or_dare',
    card_subtype: 'dare',
    content: 'Do your best impression of everyone in the room (30 seconds each)',
    intensity: 'mild',
    drink_penalty: 1,
    is_premium: false,
  },
  {
    id: 'viral_tod_9',
    game_type: 'truth_or_dare',
    card_subtype: 'dare',
    content: 'Text your crush "accidentally" then screenshot their response to show the group',
    intensity: 'extreme',
    drink_penalty: 3,
    is_premium: true,
  },
  {
    id: 'viral_tod_10',
    game_type: 'truth_or_dare',
    card_subtype: 'dare',
    content: 'Recreate your last TikTok dance but make it cringier',
    intensity: 'mild',
    drink_penalty: 1,
    is_premium: false,
  },
];

/**
 * Would You Rather - Debate Starters
 * These create arguments and engagement
 */
export const VIRAL_WOULD_YOU_RATHER: GameCard[] = [
  {
    id: 'viral_wyr_1',
    game_type: 'would_you_rather',
    content: 'Would you rather...',
    option_a: 'Always have to say what you're thinking out loud',
    option_b: 'Never be able to speak again',
    intensity: 'mild',
    drink_penalty: 1,
    is_premium: false,
  },
  {
    id: 'viral_wyr_2',
    game_type: 'would_you_rather',
    content: 'Would you rather...',
    option_a: 'Have everyone you know read your search history',
    option_b: 'Have everyone you know see your camera roll',
    intensity: 'spicy',
    drink_penalty: 2,
    is_premium: false,
  },
  {
    id: 'viral_wyr_3',
    game_type: 'would_you_rather',
    content: 'Would you rather...',
    option_a: 'Always smell like onions',
    option_b: 'Always have to sneeze but never actually sneeze',
    intensity: 'mild',
    drink_penalty: 1,
    is_premium: false,
  },
  {
    id: 'viral_wyr_4',
    game_type: 'would_you_rather',
    content: 'Would you rather...',
    option_a: 'Be able to read minds but everyone knows when you're doing it',
    option_b: 'Be invisible but only when no one is looking',
    intensity: 'mild',
    drink_penalty: 1,
    is_premium: false,
  },
  {
    id: 'viral_wyr_5',
    game_type: 'would_you_rather',
    content: 'Would you rather...',
    option_a: 'Fight 100 duck-sized horses',
    option_b: 'Fight 1 horse-sized duck',
    intensity: 'mild',
    drink_penalty: 1,
    is_premium: false,
  },
];

/**
 * Most Likely To - Call-Out Edition
 * These are designed to create drama and laughs
 */
export const VIRAL_MOST_LIKELY_TO: GameCard[] = [
  {
    id: 'viral_mlt_1',
    game_type: 'most_likely_to',
    content: 'Most likely to become TikTok famous for something embarrassing',
    intensity: 'mild',
    drink_penalty: 1,
    is_premium: false,
  },
  {
    id: 'viral_mlt_2',
    game_type: 'most_likely_to',
    content: 'Most likely to text their ex right now if we all left the room',
    intensity: 'spicy',
    drink_penalty: 2,
    is_premium: false,
  },
  {
    id: 'viral_mlt_3',
    game_type: 'most_likely_to',
    content: 'Most likely to survive a zombie apocalypse',
    intensity: 'mild',
    drink_penalty: 1,
    is_premium: false,
  },
  {
    id: 'viral_mlt_4',
    game_type: 'most_likely_to',
    content: 'Most likely to fake their own death for attention',
    intensity: 'spicy',
    drink_penalty: 2,
    is_premium: false,
  },
  {
    id: 'viral_mlt_5',
    game_type: 'most_likely_to',
    content: 'Most likely to still be using their ex's Netflix password',
    intensity: 'mild',
    drink_penalty: 1,
    is_premium: false,
  },
];

/**
 * Never Have I Ever - Confession Edition  
 * Maximum engagement, minimum judgment
 */
export const VIRAL_NEVER_HAVE_I_EVER: GameCard[] = [
  {
    id: 'viral_nhie_1',
    game_type: 'never_have_i_ever',
    content: 'Stalked someone on social media for over an hour',
    intensity: 'mild',
    drink_penalty: 1,
    is_premium: false,
  },
  {
    id: 'viral_nhie_2',
    game_type: 'never_have_i_ever',
    content: 'Pretended to like a gift I absolutely hated',
    intensity: 'mild',
    drink_penalty: 1,
    is_premium: false,
  },
  {
    id: 'viral_nhie_3',
    game_type: 'never_have_i_ever',
    content: 'Lied about reading the terms and conditions',
    intensity: 'mild',
    drink_penalty: 1,
    is_premium: false,
  },
  {
    id: 'viral_nhie_4',
    game_type: 'never_have_i_ever',
    content: 'Had a crush on someone in this room',
    intensity: 'spicy',
    drink_penalty: 2,
    is_premium: false,
  },
  {
    id: 'viral_nhie_5',
    game_type: 'never_have_i_ever',
    content: 'Sent a risky text to the wrong person',
    intensity: 'spicy',
    drink_penalty: 2,
    is_premium: false,
  },
];

/**
 * Get viral content by game type
 */
export function getViralContent(gameType: string): GameCard[] {
  switch (gameType) {
    case 'truth_or_dare':
      return VIRAL_TRUTH_OR_DARE;
    case 'would_you_rather':
      return VIRAL_WOULD_YOU_RATHER;
    case 'most_likely_to':
      return VIRAL_MOST_LIKELY_TO;
    case 'never_have_i_ever':
      return VIRAL_NEVER_HAVE_I_EVER;
    default:
      return [];
  }
}
