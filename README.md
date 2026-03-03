# 🍻 DrinkUp - AI-Powered Party Games

**Live Demo:** http://localhost:8081 (Expo web)  
**Repo:** https://github.com/claudetest147-hub/DrinkUp

## What It Is

DrinkUp is a React Native party games app with 3 games at launch, dark neon UI, and AI-generated daily content packs. Built with Expo Router + Supabase + Claude API.

### Core Games (MVP Complete ✅)

1. **🎭 Truth or Dare** - Choose truth or dare, complete challenge or drink
2. **⚡ Would You Rather** - Two impossible choices, minority drinks
3. **👆 Most Likely To** - Point at someone, most votes drinks

## Tech Stack

- **Frontend:** React Native + Expo Router + TypeScript
- **Backend:** Supabase (Postgres, Auth, Edge Functions, RLS)
- **AI:** Claude Sonnet API via Edge Functions (ready, not wired yet)
- **State:** Zustand
- **Animations:** React Native Reanimated + Expo Haptics
- **Monetization:** RevenueCat (scaffolded, not integrated)

## Current Status

✅ **Working:**
- All 3 games fully playable
- Player setup with 2-8 players
- Intensity selector (Mild/Spicy/Extreme)
- Card rotation with animations
- Drink penalty system
- Database with 35+ seed cards
- Fallback content system
- Dark neon UI (#0A0A1A background)
- Tab navigation (Games/Daily/Profile)
- Close button + counter
- Home screen with gradient game tiles

⏳ **Not Yet Implemented:**
- AI content generation (Edge Function exists but not wired)
- Daily trending packs
- Free tier limit (10 cards/session) + paywall
- RevenueCat subscription flow
- Anonymous auth auto-login
- Profile stats tracking
- Never Have I Ever game
- 5 Second Rule game
- Spin wheel for player turns
- Share to Instagram Stories
- Pregame shuffle mode

## Quick Start

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Supabase account

### Setup

\`\`\`bash
# Clone
git clone https://github.com/claudetest147-hub/DrinkUp.git
cd DrinkUp

# Install deps
npm install

# Set up env
cp .env.example .env
# Add your Supabase keys

# Run database migration
# Go to Supabase Dashboard → SQL Editor
# Paste supabase/migrations/002_schema_final.sql
# Click Run

# Enable Anonymous Auth
# Go to Supabase Dashboard → Authentication → Providers
# Toggle on "Anonymous Sign-In"

# Start dev server
npx expo start
\`\`\`

Press `w` to open in browser, or scan QR with Expo Go app.

## Project Structure

\`\`\`
DrinkUp/
├── app/                    # Expo Router file-based routing
│   ├── _layout.tsx        # Root layout with auth
│   ├── index.tsx          # Redirects to home
│   ├── (tabs)/            # Tab navigator
│   │   ├── home.tsx       # Game selection
│   │   ├── daily.tsx      # Daily packs (placeholder)
│   │   └── profile.tsx    # Settings (placeholder)
│   └── game/              # Game screens
│       ├── truth-or-dare.tsx
│       ├── would-you-rather.tsx
│       └── most-likely-to.tsx
├── components/            # Reusable UI components
│   ├── ui/               # Buttons, cards, modals
│   └── game/             # Game-specific components
├── constants/             # Themes, game config, fallback content
├── lib/                   # Supabase client, content fetcher
├── stores/                # Zustand stores (auth, game, subscription)
├── types/                 # TypeScript interfaces
└── supabase/              # Database schema & migrations
\`\`\`

## Database Schema

- **profiles** - User profiles extending auth.users
- **cards** - Game prompts with intensity, type, penalties
- **content_packs** - Groupings of cards (daily/premium)
- **game_sessions** - Analytics on completed games

RLS enabled on all tables. Anonymous users can read cards.

## Competitive Features Roadmap

Based on analysis of top 15 competitors (Party Roulette, Drinkin, Headbands, etc.):

### High Priority
1. **Spin Wheel** - Animated roulette for player selection (Party Roulette has 81K ratings doing this)
2. **Never Have I Ever** - Simple format, high engagement
3. **5 Second Rule** - Name 3 things in 5 seconds with countdown
4. **Player Name Personalization** - "Josh, do an impression of Sarah" (AI-ready)
5. **Share to Instagram Stories** - Branded card images with watermark (organic growth)

### Medium Priority
6. **Pregame Mode** - Quick 5-min shuffle of all games
7. **Glassmorphism Cards** - Premium dark aesthetic (no competitor does this well)
8. **Confetti Animations** - On game over
9. **Paywall at Card 10** - Free tier enforcement
10. **Daily Streak Counter** - Gamification

### Low Priority (Post-Launch)
- Voice output for cards (accessibility)
- Multiplayer sync via Supabase Realtime
- Custom card packs
- Leaderboards

## ASO Strategy

**App Store Listing:**
- **Name:** DrinkUp - AI Party Games
- **Subtitle:** Fresh AI Party Games Daily
- **Keywords:** party games friends, drinking game app, pregame, truth or dare adults, group party game

**Screenshot Strategy:**
1. "New Games Every Day — Powered by AI"
2. Show personalized card: "Sarah, do your best impression of Mike"
3. All 5 game modes grid (after adding Never Have I Ever + 5 Second Rule)

## Testing

\`\`\`bash
# Manual testing completed:
# ✅ Truth or Dare: Player setup → choice cards → card display → player rotation
# ✅ Would You Rather: Player setup → A/B cards → vote selection
# ✅ Home navigation → all games accessible

# TODO: Add Playwright tests
npx playwright test
\`\`\`

## Deployment

\`\`\`bash
# Build for iOS TestFlight
eas build --profile preview --platform ios

# Build for production
eas build --profile production --platform all

# Submit to App Store
eas submit --platform ios
\`\`\`

## Environment Variables

\`\`\`
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
\`\`\`

## Contributing

This is a personal project. Issues and PRs welcome but no guarantees.

## License

MIT
