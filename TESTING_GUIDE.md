# DrinkUp Testing Guide

Complete end-to-end testing checklist for production readiness.

---

## Pre-Flight Checklist

Before testing, ensure:

- [ ] RevenueCat account created
- [ ] Products created in App Store Connect (`drinkup_pro_monthly`, `drinkup_pro_annual`)
- [ ] Products added to RevenueCat
- [ ] Entitlement created (`pro`)
- [ ] Offering created and set as current
- [ ] API keys added to `lib/purchases.ts`
- [ ] Sandbox tester account created
- [ ] Webhook configured (optional for first tests)
- [ ] Migration 005 run (subscription_events table)

---

## Test Suite 1: First-Time User Flow

### Test 1.1: Onboarding
**Goal:** Verify first-launch onboarding works

1. Fresh install (or clear app data)
2. Launch app
3. **Expected:** See onboarding screen 1
4. Swipe left → Screen 2
5. Swipe left → Screen 3
6. Tap "Get Started"
7. **Expected:** Navigate to Auth screen

**Pass Criteria:**
- ✅ All 3 screens display correctly
- ✅ Pagination dots animate
- ✅ "Skip" button works on any screen
- ✅ "Get Started" navigates to Auth

---

### Test 1.2: Guest Mode
**Goal:** Verify guest can play one game

1. On Auth screen, tap "Continue as Guest"
2. **Expected:** Navigate to Home screen
3. Tap "Truth or Dare" → PLAY
4. Enter 2 player names → Start Game
5. Play through 10 cards (free limit)
6. **Expected:** Card 11 shows paywall
7. Tap "Maybe Later"
8. **Expected:** Return to Home
9. Try to start new game
10. **Expected:** Can play another game (new 10-card allowance)

**Pass Criteria:**
- ✅ Guest can access app without signup
- ✅ Paywall appears at card 11
- ✅ "Maybe Later" allows return to home
- ✅ Each new game session gets 10 free cards

---

### Test 1.3: Email Sign Up
**Goal:** Verify email registration works

1. Launch app (or sign out)
2. On Auth screen, tap "Continue with Email"
3. Enter test email + password
4. Tap "Sign Up"
5. **Expected:** Alert "Check your email!"
6. Check inbox → Click confirmation link
7. Return to app → Tap "Sign In"
8. Enter same email + password
9. **Expected:** Navigate to Home
10. Check Profile → Stats should be 0

**Pass Criteria:**
- ✅ Sign up sends confirmation email
- ✅ Sign in works after confirmation
- ✅ User profile created in database
- ✅ Stats initialize to 0

---

## Test Suite 2: Purchase Flow

### Test 2.1: View Paywall
**Goal:** Verify paywall loads real pricing

1. Sign in as regular user
2. Start any game → Play 10 cards
3. **Expected:** Paywall appears on card 11
4. Wait 2-3 seconds
5. **Expected:** See loading spinner → Real prices load
6. **Verify:**
   - Monthly: Shows actual price from App Store
   - Annual: Shows actual price + savings %
   - Both have correct currency

**Pass Criteria:**
- ✅ Paywall loads offerings from RevenueCat
- ✅ Prices match App Store Connect
- ✅ Savings % calculated correctly
- ✅ Loading state shown while fetching

---

### Test 2.2: Purchase Annual Subscription
**Goal:** Complete full purchase flow

**IMPORTANT:** Sign out of real Apple ID first!
- Settings → App Store → Sign Out

1. On paywall, tap "Annual" plan
2. **Expected:** Apple payment sheet appears
3. When prompted, sign in with **sandbox tester** account
4. Complete purchase with Face ID / Touch ID
5. **Expected:** 
   - Alert: "🎉 Welcome to Pro!"
   - Return to game
   - Continue playing beyond card 11
6. Go to Profile
7. **Expected:** "👑 PRO" badge visible

**Pass Criteria:**
- ✅ Payment sheet shows correct price
- ✅ Purchase completes successfully
- ✅ Success alert shows
- ✅ Game continues unlimited
- ✅ Pro badge appears in Profile
- ✅ Database updated: `is_pro = true`

---

### Test 2.3: Restore Purchases
**Goal:** Verify subscription persists after reinstall

1. Uninstall app completely
2. Reinstall from TestFlight
3. Launch → Skip onboarding → Sign in
4. Go to Profile
5. **Expected:** Still shows "👑 PRO"
6. If not, tap "Restore Purchases"
7. **Expected:** Pro status restored

**Pass Criteria:**
- ✅ Pro status automatically restored on sign-in
- ✅ Or "Restore Purchases" works
- ✅ Unlimited gameplay works immediately

---

## Test Suite 3: Subscription Management

### Test 3.1: View Subscription Details
**Goal:** User can see subscription info

1. Sign in as Pro user
2. Go to Profile → Tap "Subscription"
3. **Expected:** Shows:
   - "Active: $39.99/year"
   - Renewal date
   - "Manage Subscription" button

**Pass Criteria:**
- ✅ Subscription details display correctly
- ✅ Renewal date is accurate

---

### Test 3.2: Cancel Subscription
**Goal:** Verify cancellation flow works

1. In Profile → Subscription → "Manage Subscription"
2. **Expected:** Opens App Store subscriptions page
3. Tap "Cancel Subscription"
4. Confirm cancellation
5. Return to app (may take 5-10 min for webhook)
6. **Expected:** 
   - Pro badge remains until expiry date
   - "Active until [date]" shown
7. After expiry date passes (in sandbox: instant)
8. **Expected:**
   - Pro badge removed
   - Paywall appears at card 11 again

**Pass Criteria:**
- ✅ Can cancel via App Store
- ✅ Webhook updates database
- ✅ Grace period until expiry works
- ✅ After expiry, paywall returns

---

## Test Suite 4: Edge Cases

### Test 4.1: Offline Purchase
**Goal:** Handle no internet during purchase

1. Turn on Airplane Mode
2. Try to purchase subscription
3. **Expected:** Alert "No internet connection"
4. Turn off Airplane Mode
5. Retry purchase
6. **Expected:** Works normally

**Pass Criteria:**
- ✅ Graceful error when offline
- ✅ Works when connection restored

---

### Test 4.2: Declined Payment
**Goal:** Handle payment failure

1. In Sandbox, use a "declined" test card (if available)
2. Or, cancel payment sheet
3. **Expected:** Alert "Purchase Failed" or "User cancelled"
4. User remains non-Pro
5. Can retry purchase

**Pass Criteria:**
- ✅ Error handled gracefully
- ✅ User can retry
- ✅ No partial state (not stuck "processing")

---

### Test 4.3: Multiple Devices
**Goal:** Subscription works across devices

1. Purchase on iPhone A
2. Sign in with same account on iPhone B
3. **Expected:** Pro status immediately available
4. Or tap "Restore Purchases"

**Pass Criteria:**
- ✅ Subscription syncs across devices
- ✅ Both devices show Pro

---

## Test Suite 5: Analytics & Tracking

### Test 5.1: Verify Webhook
**Goal:** RevenueCat webhook updates database

1. Make a purchase
2. Check Supabase:
   ```sql
   SELECT * FROM subscription_events 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```
3. **Expected:** See event with:
   - `event_type`: "INITIAL_PURCHASE"
   - `is_pro`: true
   - `product_id`: "drinkup_pro_annual"

**Pass Criteria:**
- ✅ Webhook fires on purchase
- ✅ Event logged in database
- ✅ Profile updated correctly

---

### Test 5.2: Check RevenueCat Dashboard
**Goal:** Verify revenue tracking works

1. Make test purchase
2. Go to RevenueCat → Overview
3. **Expected:** See:
   - Active subscriptions: 1
   - MRR: ~$3.33 (for annual) or $5.99 (monthly)
   - Transaction in "Activity" feed

**Pass Criteria:**
- ✅ Purchase appears in dashboard
- ✅ Revenue calculated correctly

---

## Test Suite 6: User Experience

### Test 6.1: Performance
**Goal:** App feels fast and responsive

1. Launch app
2. **Expected:** Loads in <2 seconds
3. Navigate between tabs
4. **Expected:** Instant transitions
5. Start game → Load cards
6. **Expected:** Cards appear <500ms

**Pass Criteria:**
- ✅ App launches quickly
- ✅ Navigation is smooth
- ✅ No loading spinners >2 seconds

---

### Test 6.2: Accessibility
**Goal:** App works with assistive tech

1. Enable VoiceOver (Settings → Accessibility)
2. Navigate through app
3. **Expected:** All buttons/text readable
4. Tap "PLAY" button
5. **Expected:** VoiceOver announces action

**Pass Criteria:**
- ✅ All UI elements have labels
- ✅ Navigation works with VoiceOver

---

## Bug Reporting Template

If you find issues, report with:

```markdown
**Bug:** [Short description]

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected:** [What should happen]
**Actual:** [What actually happened]

**Screenshots:** [If applicable]

**Device:** iPhone 15 Pro / iOS 18.2
**Build:** TestFlight build #1
**User Type:** Guest / Pro / Free

**Console Logs:** [If available]
```

---

## Production Release Checklist

Before submitting to App Store:

### Code
- [ ] All tests pass
- [ ] No console errors
- [ ] Analytics tracking working
- [ ] Crash reporting set up (Sentry/Firebase)

### Legal
- [ ] Terms of Service published
- [ ] Privacy Policy published
- [ ] GDPR compliance (if EU users)
- [ ] Links added to app

### App Store
- [ ] Screenshots uploaded (all sizes)
- [ ] App description written
- [ ] Keywords optimized
- [ ] Age rating set (17+ for DrinkUp)
- [ ] Pricing configured
- [ ] In-app purchases approved

### Monitoring
- [ ] RevenueCat webhook live
- [ ] Supabase functions deployed
- [ ] Error tracking configured
- [ ] Revenue alerts set up

### Support
- [ ] Support email configured
- [ ] FAQ page created
- [ ] Refund policy written

---

## Success Metrics

Track these KPIs:

**User Acquisition:**
- Downloads/day
- Onboarding completion rate (target: >80%)
- Guest → Signup conversion (target: >30%)

**Engagement:**
- Games played/user/week (target: >2)
- Retention Day 7 (target: >40%)
- Retention Day 30 (target: >20%)

**Monetization:**
- Paywall views/day
- Paywall → Purchase conversion (target: >2%)
- MRR growth rate
- Churn rate (target: <5%/month)

**Technical:**
- Crash-free sessions (target: >99.9%)
- API latency p95 (target: <500ms)
- App launch time (target: <2s)

---

**Good luck with testing! 🚀**
