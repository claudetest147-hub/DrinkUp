# 🍻 DrinkUp - AI-Powered Party Games

React Native party games app with AI-generated content that refreshes daily. Built with Expo, Supabase, and Claude API.

## 🎮 Games

- **🎭 Truth or Dare** - Classic with AI-powered personalized content
- **⚡ Would You Rather** - Impossible choices, minority drinks
- **👆 Most Likely To** - Vote and point at friends

## 🛠️ Tech Stack

- **Frontend:** React Native + Expo Router + TypeScript
- **Backend:** Supabase (Postgres, Auth, Edge Functions)
- **State:** Zustand
- **AI:** Claude Sonnet API (via Edge Functions)
- **Styling:** React Native StyleSheet with dark neon theme

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Expo CLI
- Supabase account
- iOS Simulator or Android Emulator (or use Expo Go on physical device)

### Installation

```bash
# Clone the repo
git clone https://github.com/claudetest147-hub/DrinkUp.git
cd DrinkUp

# Install dependencies
npm install

# Start development server
npx expo start
```

### Supabase Setup

1. **Create Supabase Project** at https://supabase.com

2. **Run Database Migration:**
   - Go to Supabase Dashboard → SQL Editor
   - Copy contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and run

3. **Configure Environment:**
   - `.env` file already has credentials for the existing Supabase project
   - For your own project, update:
     - `EXPO_PUBLIC_SUPABASE_URL`
     - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY` (for Edge Functions)

### Running the App

```bash
# iOS Simulator
npx expo start --ios

# Android Emulator
npx expo start --android

# Expo Go (scan QR code)
npx expo start
```

## 📱 Features

### ✅ Implemented

- 3 complete game modes with full gameplay
- Player name entry and setup
- Intensity levels: Chill, Spicy, Extreme
- Card animations with haptic feedback
- Dark neon aesthetic with gradient cards
- Anonymous auth (zero-friction onboarding)
- Fallback content (works offline)
- Triple content fallback: Supabase → Hardcoded → Error state

### 🚧 Coming Soon

- RevenueCat subscription integration
- Claude API Edge Function for daily AI content generation
- Daily trending packs
- Paywall enforcement (10 cards free tier)
- Push notifications for new daily packs
- Playwright tests

## 🏗️ Architecture

```
DrinkUp/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation (home, daily, profile)
│   └── game/              # Game screens (3 games)
├── components/            # Reusable UI components
├── constants/             # Theme, config, fallback content
├── lib/                   # Supabase client, content fetcher
├── stores/                # Zustand state management
├── types/                 # TypeScript definitions
└── supabase/              # Database migrations
```

## 🎨 Design System

- **Primary Color:** `#FF6B6B` (coral red)
- **Background:** `#0A0A1A` (deep black-blue)
- **Surface:** `#16213E` (dark blue)
- **Accent:** `#FFE66D` (bright yellow)
- **Game Gradients:**
  - Truth or Dare: Purple (`#667eea` → `#764ba2`)
  - Would You Rather: Cyan (`#4facfe` → `#00f2fe`)
  - Most Likely To: Green (`#43e97b` → `#38f9d7`)

## 📊 Database Schema

**Key Tables:**
- `profiles` - User profiles with subscription status
- `cards` - Game content with intensity levels
- `content_packs` - Daily/trending content bundles
- `game_sessions` - Analytics tracking

See `supabase/migrations/001_initial_schema.sql` for complete schema.

## 🧪 Testing

```bash
# Playwright tests (coming soon)
npm run test:e2e
```

## 🚢 Deployment

```bash
# Build for iOS (requires EAS)
eas build --platform ios

# Build for Android
eas build --platform android

# Preview build
eas build --profile preview --platform all
```

## 📝 Environment Variables

Required in `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🤝 Contributing

This is a demo project built for PM Code Sprint LLC. Feel free to fork and adapt!

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- **GitHub:** https://github.com/claudetest147-hub/DrinkUp
- **Supabase:** https://drxyioikyrcfkhhbfnne.supabase.co

---

Built with ❤️ by PM Code Sprint LLC
