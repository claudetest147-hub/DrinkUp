import { GameType, Intensity } from '../types';

export const FREE_CARDS_PER_SESSION = 10;
export const PRO_PRICE_MONTHLY = '$5.99';
export const PRO_PRICE_ANNUAL = '$39.99';

export const INTENSITY_CONFIG: Record<Intensity, {
  label: string;
  emoji: string;
  description: string;
  isPremium: boolean;
}> = {
  mild: {
    label: 'Chill',
    emoji: '😊',
    description: 'Fun for everyone',
    isPremium: false,
  },
  spicy: {
    label: 'Spicy',
    emoji: '🌶️',
    description: 'Pushes boundaries',
    isPremium: false,
  },
  extreme: {
    label: 'Extreme',
    emoji: '🔥',
    description: 'No holding back',
    isPremium: true,
  },
};

export const GAME_RULES: Record<GameType, {
  description: string;
  howToPlay: string[];
}> = {
  truth_or_dare: {
    description: 'Classic party game with AI-generated content!',
    howToPlay: [
      'Each player takes turns',
      'Choose Truth or Dare',
      'Complete the challenge or drink!',
      'Refuse = drink penalty shown on card',
    ],
  },
  would_you_rather: {
    description: 'Impossible choices that reveal who your friends really are.',
    howToPlay: [
      'A Would You Rather is shown',
      'Everyone votes their choice',
      'Minority drinkers take sips!',
      'Ties = everyone drinks',
    ],
  },
  most_likely_to: {
    description: 'Point at who fits the description best. Majority rules!',
    howToPlay: [
      'A "Most Likely To" prompt appears',
      'Everyone points at someone on 3',
      'Person with most votes drinks!',
      'Ties = tied players drink',
    ],
  },
};
