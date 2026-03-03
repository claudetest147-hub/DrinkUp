# DrinkUp - Complete User Flow

## Research: Best Practices from Top Apps

### Duolingo's Onboarding:
- 3 screens, visual + benefit-focused
- "Skip" always visible (low pressure)
- CTA on last screen only
- Shows app value before asking for signup

### Calm's Monetization:
- 7-day free trial first
- Clear pricing comparison
- "Best Value" badge on annual
- Easy cancel policy visible

### Tinder's Auth:
- Social logins prominently placed
- Email as fallback
- "Continue as Guest" for lowest friction
- Phone verification for security

---

## DrinkUp User Journey

### 1. First Launch → Onboarding (10 seconds)

**Screen 1: Value Proposition**
```
🍻 Welcome to DrinkUp
Turn Any Party Into an Unforgettable Night

[Image: Group of friends laughing]

[Skip] ────────────────────────── [Next →]
```

**Screen 2: AI Feature**
```
🤖 Always Fresh, Never Boring
AI-powered content that learns what makes your group laugh

[Image: Phone showing game in action]

[Skip] ────────────────────────── [Next →]
```

**Screen 3: Pricing Preview**
```
👑 Start Free, Upgrade Anytime
• 10 free cards per session
• Unlock unlimited with Pro

[Skip] ────────────────────────── [Get Started]
```

---

### 2. Sign In / Sign Up

**Priority Order:**
1. **Continue as Guest** ← Lowest friction
2. **Sign in with Apple** ← iOS requirement
3. **Sign in with Google**
4. **Email + Password**

**Screen Layout:**
```
🍻 DrinkUp

Ready to Party?

[Continue as Guest]
  ↓ tap immediately starts game with 1-session limit

────── or sign up to save your progress ──────

[ 🍎 Sign in with Apple ]
[ G  Sign in with Google ]
[ ✉️  Continue with Email ]

Already have an account? [Sign In]
```

**Guest Limitations:**
- Can play 1 full game
- No stats saved
- No streaks
- After game ends: "Sign up to save your progress"

---

### 3. Home Screen (Logged In)

```
🍻 DrinkUp
[Profile Icon]

🔥 Streak: 3 days
🎮 Games Played: 12

[Today's Trending Pack →]

Choose Your Game:
┌─────────────────────────┐
│ 🎭 Truth or Dare       │
│ Spill or thrill        │
└─────────────────────────┘
[... other games]

[🎮 Games] [🔥 Daily] [👤 Profile]
```

---

### 4. Game Setup → Play → Paywall

**Setup:**
- Add 2-8 players
- Select intensity
- [Start Game]

**Playing:**
- Cards 1-10: Free
- **Card 11**: Paywall appears

**Paywall Experience:**

```
┌─────────────────────────────────┐
│          👑 Go Pro              │
│                                 │
│  You've used your 10 free cards │
│                                 │
│  Upgrade to keep the party      │
│  going with unlimited cards     │
│                                 │
│  ✓ Unlimited cards              │
│  ✓ Extreme intensity mode       │
│  ✓ AI-personalized content      │
│  ✓ Exclusive daily packs        │
│  ✓ No ads ever                  │
│                                 │
│  ┌───────────────────────────┐ │
│  │  $39.99/year              │ │
│  │  Save 44% — Best Value   │ │
│  └───────────────────────────┘ │
│                                 │
│  [ $5.99/month ]                │
│                                 │
│  [ Maybe Later ]                │
│                                 │
│  Cancel anytime • Auto-renews   │
└─────────────────────────────────┘
```

**"Maybe Later" behavior:**
- Returns to home
- Shows banner: "Upgrade anytime in Profile"
- Can start new game (gets another 10 cards)

---

### 5. Purchase Flow (RevenueCat + Stripe)

**User taps annual plan:**
1. RevenueCat SDK shows native Apple Pay sheet
2. Face ID / Touch ID authentication
3. Payment processed
4. Receipt validated
5. Database updated: `is_pro = true`
6. User redirected back to game
7. Toast: "🎉 Welcome to Pro! Unlimited cards unlocked"

**Technical Stack:**
- **RevenueCat SDK**: Handles App Store / Google Play / Stripe
- **Supabase Webhook**: Updates user `is_pro` status
- **Client-side**: Checks `isPro` from store

---

### 6. Profile & Subscription Management

**Profile Screen (Pro User):**
```
Profile
👑 PRO

┌─────────────┬─────────────┐
│ 45          │ 🔥 12       │
│ Games       │ Day Streak  │
└─────────────┴─────────────┘

Settings:
📊 Subscription
   • Active: $39.99/year
   • Renews: March 3, 2027
   • [Manage Subscription]
   
🔔 Notifications
🎨 Theme Settings
ℹ️ About
📧 Support
```

**"Manage Subscription":**
- Opens App Store subscription page
- User can cancel there
- RevenueCat webhook fires → updates database

---

## Key Metrics to Track

### Conversion Funnel:
1. App Opens → Onboarding completion: 80% target
2. Onboarding → Guest play: 60% target
3. Guest → Sign up: 30% target
4. Sign up → First game: 90% target
5. Hit paywall → Upgrade: 2% target (industry standard)

### Monetization:
- Free users: Avg 2.5 games/week
- Pro users: Avg 8 games/week
- Upgrade timing: 65% upgrade on first paywall hit, 35% later

---

## Implementation Checklist

### Phase 1: Core User Flow (Next 3 Hours)
- [ ] Onboarding screens (3 swipeable)
- [ ] Auth: Apple Sign In
- [ ] Auth: Google Sign In
- [ ] Auth: Email/Password
- [ ] Guest mode (1 game limit)
- [ ] Proper navigation after signup

### Phase 2: Monetization (Next 2 Hours)
- [ ] RevenueCat SDK integration
- [ ] Purchase flow for annual/monthly
- [ ] Receipt validation
- [ ] Webhook to update Supabase
- [ ] Subscription management screen
- [ ] Restore purchases button

### Phase 3: Polish (Next 1 Hour)
- [ ] Loading states
- [ ] Error handling
- [ ] Offline mode graceful fallback
- [ ] Analytics events (mixpanel/posthog)

### Phase 4: Testing (Next 1 Hour)
- [ ] Complete user journey: Install → Onboard → Guest play → Signup → Upgrade → Play unlimited
- [ ] Test guest limitations
- [ ] Test paywall triggers
- [ ] Test purchase flow (sandbox)
- [ ] Test restore purchases
- [ ] Test subscription cancellation

---

## Revenue Projections (Revised with Real Funnel)

**Month 1:**
- 500 downloads
- 400 complete onboarding (80%)
- 240 play as guest (60%)
- 72 sign up (30% of guests)
- 65 hit paywall (90% play to card 11)
- **2 upgrade** (2% conversion)
- Revenue: $80 MRR
- Cost: $86/month
- Net: -$6 (break-even!)

**Month 3:**
- 2,000 downloads
- 1,600 complete onboarding
- 960 play as guest
- 288 sign up
- 260 hit paywall
- **5 upgrade first paywall + 3 later**
- Revenue: $128 MRR ($48 monthly, $80 annual/12)
- Cost: $86/month
- Net: +$42 **PROFITABLE**

**Month 6:**
- 10,000 downloads
- 50 total Pro subscribers
- Revenue: $300 MRR
- Cost: $86/month
- Net: +$214/month

---

**Next: Start building Phase 1 (Onboarding + Auth)**
