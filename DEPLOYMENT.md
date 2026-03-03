# DrinkUp Deployment Guide

## Pre-Launch Checklist

### 1. App Store Connect Setup

**Create App:**
1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - Platform: iOS
   - Name: DrinkUp
   - Primary Language: English (U.S.)
   - Bundle ID: com.drinkup.app (must match app.json)
   - SKU: drinkup-001

**App Information:**
- Category: Entertainment
- Age Rating: 17+ (for alcohol references)
- Subtitle: "AI Party Games - Fresh Daily"
- Keywords: party games, drinking games, truth or dare, would you rather, group games, pregame
- Description: (see ASO copy below)

### 2. RevenueCat Setup (Subscriptions)

**Create Products:**
1. Go to App Store Connect → In-App Purchases
2. Create two auto-renewable subscriptions:
   - `drinkup_pro_monthly`: $5.99/month
   - `drinkup_pro_annual`: $39.99/year (save 44%)
3. Add to subscription group: "DrinkUp Pro"

**RevenueCat Configuration:**
1. Create project at https://revenuecat.com
2. Add iOS app with Bundle ID
3. Copy API keys to `.env`:
   ```
   EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=<your-key>
   ```
4. Wire up in `lib/purchases.ts` (already scaffolded)

### 3. Supabase Edge Function Deployment

**Deploy Claude API Function:**
```bash
# Add Claude API key to Supabase secrets
supabase secrets set CLAUDE_API_KEY=<your-claude-key>

# Deploy Edge Function
supabase functions deploy generate-content
supabase functions deploy daily-pack
```

**Set up CRON job:**
1. Go to Supabase Dashboard → Database → Extensions
2. Enable `pg_cron`
3. Run SQL:
```sql
SELECT cron.schedule(
  'daily-content-generation',
  '0 6 * * *', -- 6 AM daily
  $$
  SELECT net.http_post(
    url:='<your-supabase-url>/functions/v1/daily-pack',
    headers:='{"Authorization": "Bearer <service-role-key>"}'::jsonb
  );
  $$
);
```

### 4. Production Environment Variables

Update `.env` with production values:
```bash
EXPO_PUBLIC_SUPABASE_URL=https://yicbsjkdioiknonuuhvf.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<production-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<production-service-role-key>
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=<production-revenuecat-key>
CLAUDE_API_KEY=<claude-key> # For Edge Functions
```

### 5. Build & Submit

**Install EAS CLI:**
```bash
npm install -g eas-cli
eas login
```

**Configure EAS:**
```bash
eas build:configure
```

**Build for TestFlight:**
```bash
# Development build (for testing)
eas build --profile preview --platform ios

# Production build (for App Store)
eas build --profile production --platform ios --auto-submit
```

**Manual Submit:**
```bash
eas submit --platform ios --latest
```

### 6. App Store Screenshots

**Required Sizes (iPhone 15 Pro Max):**
- 6.7" display: 1290 x 2796 px

**Screenshot Sequence:**
1. Home screen showing all 4 games
2. Truth or Dare gameplay with gradient card
3. Player name personalization: "Sarah, do an impression of Mike"
4. Would You Rather with A vs B options
5. Most Likely To voting screen
6. Never Have I Ever card
7. Go Pro paywall screen

**Tools:**
- Use iPhone Simulator
- Cmd+S to capture screenshots
- Or use https://www.screenshot.rocks for mockups

### 7. App Store Copy

**Subtitle (30 chars):**
"AI Party Games - Fresh Daily"

**Promotional Text (170 chars):**
"🎉 New games every day! AI generates fresh content based on trending topics and your friend group. No more boring repeats. Download now and party smarter."

**Description (4000 chars max):**
```
🍻 DRINKUP - THE PARTY GAME APP THAT NEVER GETS OLD

Tired of the same old party game questions? DrinkUp uses AI to generate fresh, trending content EVERY DAY. Games that adapt to your friend group and stay current with pop culture.

🎮 4 LEGENDARY GAMES

🎭 TRUTH OR DARE
Classic with a twist. AI generates personalized dares based on your players' names. Sarah, do your best impression of Mike!

⚡ WOULD YOU RATHER
Impossible choices that reveal who your friends really are. Minority drinks. Majority laughs.

👆 MOST LIKELY TO
Point at who fits the description best. Person with most votes drinks. Prepare for roasts.

🙈 NEVER HAVE I EVER
If you've done it, drink. Simple, brutal, hilarious.

✨ WHAT MAKES DRINKUP DIFFERENT

• 🤖 AI-POWERED CONTENT
  Fresh questions daily. No boring repeats. Trending topics. Personalized to your group.

• 🎨 DARK NEON UI
  Beautiful gradient cards. Smooth animations. Premium feel.

• 📊 SMART ROTATION
  Spin wheel picks next player. Everyone gets their turn.

• 💎 PRO FEATURES
  - Unlimited cards per session
  - Extreme intensity mode
  - AI-personalized content
  - Exclusive daily packs
  - Ad-free experience

• 🔄 ALWAYS FRESH
  Database of 50+ cards. AI generates 15+ new ones daily. Never play the same game twice.

🔞 FOR ADULTS ONLY (21+)

This is a drinking game app. Drink responsibly. Know your limits. Never drink and drive.

💰 FREE TO PLAY

- 10 cards per session free
- All 4 games included
- Mild & Spicy intensity

Go Pro for unlimited everything at $5.99/month or $39.99/year (save 44%).

📱 PERFECT FOR

• Pre-game warmups
• House parties
• College hangouts
• Friend reunions
• Road trip downtime
• Any group gathering

🎉 START PARTYING

Download now. Add your friends. Pick a game. Let the chaos begin.

---

No ads in free tier (just a 10-card limit).
Cancel Pro anytime. Subscriptions via App Store.
Privacy policy: [your-url]
Terms: [your-url]

Questions? support@drinkupapp.com
```

**Keywords (100 chars max):**
```
party games, drinking games, truth or dare, would you rather, group games, college, friends, pregame
```

### 8. Privacy & Compliance

**Privacy Policy Must Cover:**
- Supabase data storage
- Anonymous authentication
- No personal data sold
- RevenueCat subscription handling
- Optional account creation
- GDPR/CCPA compliance

**Age Gate:**
- Implement 21+ verification on first launch
- Date of birth check
- Store verification status locally

### 9. Analytics Setup (Optional)

**Add Analytics:**
```bash
npm install @react-native-firebase/analytics
# OR
npm install expo-analytics
```

**Track Events:**
- Game started (type, intensity, player count)
- Cards played (game type, card number)
- Paywall shown
- Subscription purchased
- Daily active users

### 10. Post-Launch Monitoring

**Watch:**
- Crash rate (target: <1%)
- Session length (target: >5min)
- Cards per session (track paywall conversion)
- Subscription conversion rate (target: >2%)
- Daily active users
- Retention (Day 1, Day 7, Day 30)

**Supabase Metrics:**
- Database query performance
- Edge Function invocation count
- Claude API usage & cost

**RevenueCat Dashboard:**
- MRR (Monthly Recurring Revenue)
- Churn rate
- Trial conversion
- ARPU (Average Revenue Per User)

---

## Quick Launch Commands

```bash
# 1. Update version in app.json
# 2. Build and submit
eas build --profile production --platform ios --auto-submit

# 3. Wait for Apple review (~24-48 hours)

# 4. Monitor Supabase logs
supabase functions logs generate-content

# 5. Check RevenueCat dashboard for subscriptions
```

---

## Common Issues

**Build Fails:**
- Check expo-cli version: `npm install -g expo-cli@latest`
- Clear cache: `expo start -c`
- Update dependencies: `npm install`

**TestFlight Not Showing:**
- Wait 10-15 minutes after submit
- Check email for processing status
- Verify provisioning profile in App Store Connect

**Subscriptions Not Working:**
- Verify Bundle ID matches everywhere
- Check RevenueCat API key in .env
- Test in sandbox mode first
- Approve IAP in App Store Connect

**Edge Functions Failing:**
- Check Supabase logs
- Verify CLAUDE_API_KEY secret is set
- Test locally: `supabase functions serve`
- Check function timeout (default 60s)

---

## Success Metrics

**Week 1 Targets:**
- 100 downloads
- 50 DAU (Daily Active Users)
- 10 Pro subscriptions
- 4.5+ App Store rating

**Month 1 Targets:**
- 1,000 downloads
- 500 DAU
- 50 Pro subscribers ($300 MRR)
- Featured in "New Apps We Love"

**Growth Strategy:**
- Reddit: r/pregaming, r/CollegeLife
- TikTok: Short gameplay clips
- Instagram: Story templates with app link
- Word of mouth: Share feature drives organic growth
