export const APP_THEME = {
  colors: {
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    accent: '#FFE66D',
    background: '#0A0A1A',
    surface: '#16213E',
    card: '#0F3460',
    text: '#FFFFFF',
    textSecondary: '#B8B8D4',
    gradient: {
      truth: ['#667eea', '#764ba2'],
      dare: ['#f093fb', '#f5576c'],
      wyr: ['#4facfe', '#00f2fe'],
      mlt: ['#43e97b', '#38f9d7'],
    },
    intensity: {
      mild: '#4ECDC4',
      spicy: '#FF6B6B',
      extreme: '#FF1744',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    full: 999,
  },
};

export const GAME_THEMES = {
  truth_or_dare: {
    icon: '🎭',
    title: 'Truth or Dare',
    subtitle: 'Spill or thrill',
    gradient: ['#667eea', '#764ba2'],
    accentColor: '#764ba2',
  },
  would_you_rather: {
    icon: '⚡',
    title: 'Would You Rather',
    subtitle: 'Choose your chaos',
    gradient: ['#4facfe', '#00f2fe'],
    accentColor: '#4facfe',
  },
  most_likely_to: {
    icon: '👆',
    title: 'Most Likely To',
    subtitle: 'Point fingers',
    gradient: ['#43e97b', '#38f9d7'],
    accentColor: '#43e97b',
  },
  never_have_i_ever: {
    icon: '🙈',
    title: 'Never Have I Ever',
    subtitle: 'Confess or drink',
    gradient: ['#FF6B9D', '#C06C84'],
    accentColor: '#FF6B9D',
  },
};
