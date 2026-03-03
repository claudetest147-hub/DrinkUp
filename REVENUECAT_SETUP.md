# RevenueCat + App Store Connect Setup Guide

## Overview
RevenueCat handles all subscription complexity: App Store, Google Play, Stripe web payments, receipt validation, webhooks, analytics.

**Time Required:** 30-45 minutes  
**Cost:** Free up to $2.5K MRR

---

## Step 1: Create RevenueCat Account (5 min)

1. Go to https://app.revenuecat.com/signup
2. Sign up with email
3. Create new project: **"DrinkUp"**
4. Select platform: **iOS** (add Android later)

---

## Step 2: Get Apple API Keys (10 min)

### A. App Store Connect API Key

1. Go to https://appstoreconnect.apple.com/access/api
2. Click **Generate API Key**
   - Name: "RevenueCat Integration"
   - Access: **Admin** (required for subscription management)
3. Download the `.p8` file (save as `AuthKey_XXXXXXXX.p8`)
4. Copy:
   - Key ID (e.g., `2X9R4HXF34`)
   - Issuer ID (e.g., `57246542-96fe-1a63-e053-0824d011072a`)

### B. Upload to RevenueCat

1. In RevenueCat dashboard → **Project Settings** → **Service Credentials**
2. Click **App Store Connect API**
3. Upload:
   - Issuer ID
   - Key ID  
   - .p8 file
4. Click **Verify** → Should show ✅ Connected

---

## Step 3: Create Products in App Store Connect (15 min)

1. Go to https://appstoreconnect.apple.com/
2. Navigate to **My Apps** → **DrinkUp** (or create app first)
3. Click **In-App Purchases** → **Manage**

### A. Create Monthly Subscription

1. Click **+** → **Auto-Renewable Subscription**
2. Fill in:
   - **Reference Name:** DrinkUp Pro Monthly
   - **Product ID:** `drinkup_pro_monthly`
   - **Subscription Group:** Create new "DrinkUp Pro"
3. **Subscription Duration:** 1 Month
4. **Price:** $5.99 USD
   - RevenueCat will auto-convert to other currencies
5. **Localization (English - US):**
   - Display Name: "DrinkUp Pro"
   - Description: "Unlimited party games with AI-powered content"
6. Click **Save**

### B. Create Annual Subscription

1. Click **+** → **Auto-Renewable Subscription**
2. Fill in:
   - **Reference Name:** DrinkUp Pro Annual  
   - **Product ID:** `drinkup_pro_annual`
   - **Subscription Group:** "DrinkUp Pro" (same as monthly)
3. **Subscription Duration:** 1 Year
4. **Price:** $39.99 USD
5. **Introductory Offer (Optional):**
   - 7-day free trial → Then $39.99/year
   - Helps conversion by 30-50%
6. **Localization:** Same as monthly
7. Click **Save**

---

## Step 4: Configure Products in RevenueCat (5 min)

1. In RevenueCat → **Products** tab
2. Click **+ New**

### Add Monthly Product:
- **Product Identifier:** `drinkup_pro_monthly`
- **Store:** App Store
- Click **Save**

### Add Annual Product:
- **Product Identifier:** `drinkup_pro_annual`
- **Store:** App Store
- Click **Save**

---

## Step 5: Create Entitlement (3 min)

Entitlements = what users get access to

1. RevenueCat → **Entitlements** tab
2. Click **+ New Entitlement**
3. Fill in:
   - **Identifier:** `pro`
   - **Display Name:** "Pro Membership"
4. Click **Create**

---

## Step 6: Create Offering (3 min)

Offerings = packages you show to users

1. RevenueCat → **Offerings** tab
2. Click **+ New Offering**
3. Fill in:
   - **Identifier:** `default`
   - **Description:** "Default paywall"
4. **Add Packages:**
   - **Monthly Package:**
     - Identifier: `$rc_monthly`
     - Product: `drinkup_pro_monthly`
     - Entitlements: `pro`
   - **Annual Package:**
     - Identifier: `$rc_annual`
     - Product: `drinkup_pro_annual`
     - Entitlements: `pro`
5. Set as **Current Offering**
6. Click **Save**

---

## Step 7: Get API Keys for App (2 min)

1. RevenueCat → **Project Settings** → **API Keys**
2. Copy:
   - **Apple App-specific Shared Secret** (for iOS)
   - Or simpler: **Public SDK Key** (newer, recommended)

**Public SDK Key format:** `appl_XxXxXxXxXxXxXxXx`

---

## Step 8: Add Keys to App (2 min)

Update `lib/purchases.ts`:

```typescript
const REVENUECAT_APPLE_KEY = 'appl_YOUR_KEY_FROM_STEP_7';
```

---

## Step 9: Configure Webhook (5 min)

Keeps Supabase in sync with subscription status

1. RevenueCat → **Integrations** → **Webhooks**
2. Click **+ Add Webhook**
3. Fill in:
   - **URL:** `https://yicbsjkdioiknonuuhvf.supabase.co/functions/v1/revenuecat-webhook`
   - **Authorization:** Bearer `YOUR_SUPABASE_SERVICE_ROLE_KEY`
4. Events to send:
   - ✅ Initial Purchase
   - ✅ Renewal
   - ✅ Cancellation
   - ✅ Expiration
5. Click **Save**

---

## Step 10: Create Webhook Handler in Supabase (10 min)

Create Edge Function to handle webhooks:

```bash
cd DrinkUp
supabase functions new revenuecat-webhook
```

**File:** `supabase/functions/revenuecat-webhook/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  const event = await req.json()
  
  // Extract relevant data
  const {
    event: eventType,
    app_user_id: userId,
    entitlements,
    subscriber_attributes,
  } = event
  
  // Check if user has active "pro" entitlement
  const isPro = entitlements?.pro !== undefined
  
  // Update user in database
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      is_pro: isPro,
      pro_expires_at: entitlements?.pro?.expires_date || null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'id'
    })
  
  if (error) {
    console.error('Error updating user:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
  
  console.log(`✅ Updated user ${userId}: isPro=${isPro}`)
  
  return new Response(JSON.stringify({ success: true }), { status: 200 })
})
```

Deploy:
```bash
supabase functions deploy revenuecat-webhook
```

---

## Step 11: Test in Sandbox (10 min)

### Create Sandbox Tester Account

1. App Store Connect → **Users and Access** → **Sandbox Testers**
2. Click **+** to add tester
3. Fill in fake details (must be unique email)
   - Email: `test+drinkup@yourdomain.com`
   - Password: Something you'll remember
   - Country: United States

### Test on Device

1. iPhone Settings → **App Store** → Sign out
2. Build app: `eas build --profile development --platform ios`
3. Install on device
4. Go through flow:
   - Onboard → Auth → Play game → Hit paywall
   - Tap "Upgrade to Pro"
   - Sign in with sandbox tester when prompted
   - Complete purchase
5. Verify:
   - Purchase completes
   - User gets "Pro" badge
   - Unlimited cards work
   - RevenueCat dashboard shows transaction

---

## Step 12: Test Restore Purchases

1. Uninstall app
2. Reinstall  
3. Sign in with same account
4. Go to Profile → "Restore Purchases"
5. Should show Pro status

---

## Troubleshooting

### "Product not found"
- Wait 2-4 hours after creating products in App Store Connect
- Products must be "Ready to Submit" status
- Clear RevenueCat cache: Dashboard → Products → Refresh

### "Invalid Product Identifier"
- Double-check Product IDs match exactly
- Format: `drinkup_pro_monthly` (lowercase, underscores)

### Webhook not firing
- Test URL with curl:
  ```bash
  curl -X POST https://yicbsjkdioiknonuuhvf.supabase.co/functions/v1/revenuecat-webhook \
    -H "Authorization: Bearer YOUR_SERVICE_KEY" \
    -d '{"event":"TEST"}'
  ```
- Check Supabase Edge Function logs

### Sandbox purchase stuck
- Sometimes sandbox is slow (Apple issue)
- Try different sandbox tester
- Wait 5-10 minutes and retry

---

## Production Checklist

Before going live:

- [ ] Products approved in App Store Connect
- [ ] RevenueCat webhook configured
- [ ] Supabase Edge Function deployed
- [ ] Tested in sandbox with real device
- [ ] Tested restore purchases
- [ ] Verified webhook updates database
- [ ] Set up subscription cancellation flow
- [ ] Added "Terms of Service" and "Privacy Policy" links

---

## Revenue Dashboard

RevenueCat provides:
- Real-time revenue tracking
- MRR/ARR calculations
- Churn rate
- Trial conversion rate
- Cohort analysis
- Refund tracking

Access: https://app.revenuecat.com/overview

---

## Monthly Costs

**RevenueCat:**
- Free: Up to $2,500 MRR
- Growth: $250/mo for up to $10K MRR
- After 15 Pro subscribers ($90 MRR) → Still free tier

**Apple:**
- 30% commission first year
- 15% after year 1 (for retained subscribers)
- Small Business Program: 15% if <$1M revenue/year

**Example with 100 Pro subscribers ($600 MRR):**
- Revenue: $600
- Apple cut (30%): -$180
- Your take: $420/month
- RevenueCat: $0 (under $2.5K MRR)
- **Net profit: $420 - $86 (infrastructure) = $334/month**

---

**Next: I'll create the Supabase webhook function**
