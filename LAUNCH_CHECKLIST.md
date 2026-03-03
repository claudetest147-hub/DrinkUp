# 🚀 DrinkUp Launch Checklist

**Goal:** Get app live on TestFlight in 4 hours

---

## ✅ Pre-Flight (1 Hour)

### Task 1: App Icon (15 min)
- [ ] Open Microsoft Designer: https://designer.microsoft.com/image-creator
- [ ] Use prompt from `APP_ICON_REQUIREMENTS.md`
- [ ] Generate and download icon (1024x1024)
- [ ] Follow `ADD_ICON_INSTRUCTIONS.md` to add to app
- [ ] Verify: `npm start` and check icon appears

**Backup:** Use Canva or keep Expo default for beta

---

### Task 2: Screenshots (30 min)
- [ ] Launch app in iOS Simulator: `npm start`, press `i`
- [ ] Run screenshot script: `./take-screenshots.sh`
- [ ] Follow prompts to capture all 7 screens
- [ ] Verify all saved to `~/Desktop/DrinkUp-Screenshots/`
- [ ] Review quality (1290x2796 resolution)

**Screens Needed:**
1. Home (all 4 games)
2. Truth or Dare gameplay
3. Would You Rather gameplay
4. Player setup
5. Profile screen
6. Daily packs
7. Paywall modal

---

### Task 3: RevenueCat Setup (45 min)
**Can skip for beta testing** - paywall will show UI only

If setting up now:
- [ ] Create account: https://app.revenuecat.com/signup
- [ ] Follow `REVENUECAT_SETUP.md` steps 1-12
- [ ] Update `lib/purchases.ts` with API keys
- [ ] Deploy webhook: `supabase functions deploy revenuecat-webhook`

**Or defer:** Set up after beta feedback

---

## 🧪 Testing (1 Hour)

### Quick Smoke Test
- [ ] Launch app in simulator
- [ ] Complete onboarding (3 screens)
- [ ] Sign in as Guest
- [ ] Play Truth or Dare (10 cards)
- [ ] Verify paywall appears at card 11
- [ ] Try other 3 games
- [ ] Check Profile tab
- [ ] Check Daily tab

**If anything breaks:** Fix before building

---

## 🏗️ Build (1 Hour)

### EAS Setup (if first time)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Initialize project
eas build:configure
```

### Build for TestFlight
```bash
cd /Users/pmcodesprint/.openclaw/workspace/DrinkUp

# Start build (takes 15-20 min)
eas build --profile production --platform ios

# Wait for build to complete
# You'll get a URL to download the IPA
```

**While building:** Prepare App Store Connect

---

## 📦 App Store Connect Setup (30 min)

### Create App Listing
1. Go to https://appstoreconnect.apple.com/
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - **Platform:** iOS
   - **Name:** DrinkUp
   - **Primary Language:** English (US)
   - **Bundle ID:** Select the one from your build
   - **SKU:** `drinkup-ios-2026`
   - **User Access:** Full Access

### Add App Information
4. Click **App Information**
5. Fill in:
   - **Privacy Policy URL:** (create one first or use placeholder)
   - **Category:** Games > Card
   - **Age Rating:** 17+ (alcohol references)

### Prepare for Release
6. Click **1.0 Prepare for Submission**
7. Upload screenshots (7 required)
8. Write app description (see below)
9. Add keywords
10. Set pricing: Free with in-app purchases

---

## 📝 App Store Copy

### App Name (30 chars max)
```
DrinkUp - Party Games
```

### Subtitle (30 chars max)
```
AI-Powered Truth or Dare
```

### Description (4000 chars max)
```
Turn any party into an unforgettable night with DrinkUp - the ultimate party game app featuring Truth or Dare, Would You Rather, Most Likely To, and Never Have I Ever.

🤖 ALWAYS FRESH
Our AI generates new content daily, so you'll never see the same prompts twice. No stale questions here!

🎮 4 CLASSIC GAMES
• Truth or Dare - Spill secrets or face the challenge
• Would You Rather - Choose your chaos
• Most Likely To - Point fingers at your friends
• Never Have I Ever - Confess or drink

🔥 INTENSITY LEVELS
Choose from Mild, Spicy, or Extreme modes based on your group's vibe

👥 2-8 PLAYERS
Perfect for small gatherings or big parties

✨ FREE TO START
10 free cards per game. Upgrade to Pro for unlimited access and exclusive content.

💎 DRINKUP PRO
• Unlimited cards per session
• Extreme intensity mode
• AI-personalized content
• Exclusive daily packs
• No ads ever

Perfect for:
• College parties
• Game nights
• Bar hangouts
• Birthday parties
• Bachelor/bachelorette parties
• Breaking the ice with new friends

Download now and make your next party legendary!

---

Note: This app features alcohol-related content and is intended for users 21+. Please drink responsibly.
```

### Keywords (100 chars max)
```
party,game,truth,dare,drinking,friends,fun,ice,breaker,social
```

### Promotional Text (170 chars max)
```
🎉 NEW: Daily AI-generated content! Never play the same game twice. Download now and turn your next party into the highlight of the year!
```

---

## 📲 Submit to TestFlight (30 min)

### Upload Build
```bash
# After build completes
eas submit --platform ios --latest
```

### Configure TestFlight
1. Go to App Store Connect → **TestFlight** tab
2. Click on your build
3. Add **What to Test** notes:
   ```
   BETA TEST FOCUS:
   • Does onboarding flow work smoothly?
   • Are the games fun and engaging?
   • Any bugs or crashes?
   • Is the paywall clear?
   • Would you upgrade to Pro?
   
   Please play at least 2 complete games and share feedback!
   ```

### Add Beta Testers
4. Click **Add Testers**
5. Create **Internal Testing** group
6. Add email addresses (up to 100)
7. Send invitations

**Testers will receive email with TestFlight link**

---

## 🐛 Beta Testing Phase (2-4 Hours)

### Monitor Feedback
- [ ] Check TestFlight Feedback section daily
- [ ] Respond to tester questions
- [ ] Track crash reports

### Critical Bugs Only
Fix if:
- App crashes on launch
- Games don't load
- Can't navigate between screens
- Database connection fails

Don't fix:
- Minor UI tweaks
- Small text changes
- Feature requests (save for v1.1)

### Update if Needed
```bash
# Fix bugs
# Increment version in app.json

# Rebuild
eas build --profile production --platform ios

# Resubmit
eas submit --platform ios --latest
```

---

## 🎉 App Store Submission (Day 3-4)

### Final Prep
- [ ] All beta feedback addressed
- [ ] No critical bugs remaining
- [ ] Terms of Service published
- [ ] Privacy Policy published
- [ ] Support email configured

### Submit for Review
1. App Store Connect → **1.0 Prepare for Submission**
2. Fill in all required fields
3. Upload final build
4. Click **Submit for Review**

### Apple Review (24-72 hours)
- Usually takes 24-48 hours
- Check status in App Store Connect
- Respond quickly if Apple has questions

### If Approved
- **Go Live!** 🎉
- Share on social media
- Tell friends
- Monitor downloads
- Respond to reviews

---

## 📊 Post-Launch (Week 1)

### Day 1-3: Monitor
- [ ] Check crash rates (target: <1%)
- [ ] Monitor user reviews
- [ ] Track download numbers
- [ ] Watch conversion rates

### Day 4-7: Optimize
- [ ] Respond to all reviews (positive & negative)
- [ ] Fix any critical bugs
- [ ] Plan v1.1 features based on feedback
- [ ] Start marketing efforts

---

## 🎯 Success Metrics

**Week 1 Targets:**
- 50+ downloads
- <1% crash rate
- 4.0+ star rating
- 5+ positive reviews
- 1-2 Pro subscribers

**Month 1 Targets:**
- 100 downloads
- 2 Pro subscribers
- 10+ reviews
- <5% churn rate

---

## 🆘 Troubleshooting

### Build Fails
- Check `eas build --profile production --platform ios --local` for detailed logs
- Verify all dependencies installed: `npm install`
- Clear cache: `npm start -- --clear`

### TestFlight Upload Fails
- Check Apple Developer account is active
- Verify Bundle ID matches in Xcode and App Store Connect
- Try `eas submit` again (sometimes Apple's servers timeout)

### App Rejected by Apple
- Read rejection reason carefully
- Fix the specific issue mentioned
- Respond in Resolution Center
- Resubmit immediately

Common rejection reasons:
- Missing privacy policy
- Age rating incorrect (should be 17+ for alcohol)
- Screenshots don't match app functionality
- In-app purchases not configured properly

---

## 📞 Need Help?

**Documentation:**
- `FINAL_STATUS.md` - Complete overview
- `REVENUECAT_SETUP.md` - Monetization setup
- `TESTING_GUIDE.md` - Detailed test cases
- `USER_FLOW.md` - Complete user journey

**External Resources:**
- Expo Docs: https://docs.expo.dev/
- RevenueCat Docs: https://www.revenuecat.com/docs/
- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/

---

**Total Time:** 4-5 hours spread over 2 days

**You've got this! 🚀**
