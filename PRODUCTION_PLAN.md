# DrinkUp - Production Architecture Plan

## 🎯 Business Requirements

### Revenue Goals
- **Target**: $10K MRR in 6 months
- **Conversion**: 2% free → paid (industry standard)
- **To hit target**: Need 500 Pro subscribers = 25,000 MAU
- **Pricing**: $5.99/month or $39.99/year

### Cost Constraints
- **Max burn**: $500/month until break-even
- **Target**: < 10% of revenue on infrastructure
- **Break-even**: 84 Pro subscribers ($500 MRR)

---

## 💰 Cost Analysis - Current vs Production

### ❌ CURRENT APPROACH (Broken):
```
AI API calls per game session:
- 1 call to generate 15 cards = $0.50 (Claude Sonnet)
- If 1,000 games/day = $500/day = $15,000/month
- UNSUSTAINABLE
```

### ✅ PRODUCTION APPROACH:
```
Pre-generate content via daily CRON:
- 1 cron job/day = 1 API call
- Generate 200 cards = $2/day = $60/month
- Store in Postgres
- Serve from cache = FREE
- Cost per game: $0.00
- SUSTAINABLE
```

**Savings**: $14,940/month 💰

---

## 🏗️ Architecture Redesign

### Current (Bad):
```
User starts game → Call Claude API → Wait 3-5s → Get cards
Problems:
- Slow (3-5s latency)
- Expensive ($0.50 per game)
- Breaks if API is down
- No content moderation
```

### Production (Good):
```
CRON job (daily 6 AM):
  ↓
Fetch trending topics (Twitter/Reddit)
  ↓
Generate 200 fresh cards via Claude
  ↓
Store in Postgres with moderation_status='pending'
  ↓
Human/AI review (flag NSFW, offensive)
  ↓
Approve → Set active=true
  ↓
User starts game → Fetch from Postgres (50ms)
  ↓
Instant, cheap, reliable
```

---

## 🔒 Security Requirements

### Input Validation
- **Player names**: Max 20 chars, alphanumeric only
- **SQL injection**: Use parameterized queries (Supabase already does this)
- **Rate limiting**: Max 10 games/hour per IP
- **CORS**: Only allow app domain

### Authentication
- **Anonymous users**: Can play 10 cards (free tier)
- **Registered users**: Can favorite games, track streaks
- **Pro users**: Unlimited + premium content

### Data Privacy
- **No PII stored**: Only anonymous user IDs
- **GDPR compliant**: Users can delete account
- **Age gate**: 21+ verification on first launch

### Content Moderation
```sql
CREATE TABLE moderation_queue (
  card_id UUID,
  flagged_reason TEXT,
  reviewed_by UUID,
  approved BOOLEAN,
  created_at TIMESTAMPTZ
);
```

---

## 📊 Storage Strategy

### Current Problem
- Cards accumulate forever
- No cleanup = database bloat
- Costs increase over time

### Solution: Data Lifecycle
```sql
-- Keep only fresh content
DELETE FROM cards 
WHERE created_at < NOW() - INTERVAL '30 days'
  AND play_count < 10; -- Keep popular cards

-- Archive old sessions
INSERT INTO archive.game_sessions
SELECT * FROM game_sessions
WHERE ended_at < NOW() - INTERVAL '7 days';

DELETE FROM game_sessions
WHERE ended_at < NOW() - INTERVAL '7 days';

-- Run weekly via CRON
```

**Savings**: 70% reduction in storage costs

---

## 🚀 Scaling Plan

### Phase 1: Launch (0-1K users)
- **Infrastructure**: Supabase Hobby ($25/month)
- **CDN**: Vercel (free tier)
- **Analytics**: Mixpanel (free tier)
- **Cost**: ~$100/month

### Phase 2: Growth (1K-10K users)
- **Infrastructure**: Supabase Pro ($25/month)
- **CDN**: Cloudflare ($20/month)
- **Analytics**: Mixpanel paid ($100/month)
- **Cost**: ~$200/month

### Phase 3: Scale (10K-100K users)
- **Infrastructure**: Supabase Team ($599/month)
- **CDN**: Cloudflare ($50/month)
- **Analytics**: Mixpanel scale ($300/month)
- **Redis cache**: Upstash ($40/month)
- **Cost**: ~$1,000/month (but at 2% conversion = $12K MRR)

---

## 🎮 Viral Mechanics (Critical for Growth)

### 1. Share Features
```typescript
// After every game:
"🎉 We just played DrinkUp!
[Player1] took 15 sips
[Player2] was the bravest
[Player3] chickened out 😂

Download and challenge us:
https://drinkupapp.com/challenge/abc123"
```
**K-Factor**: 0.3 (every 10 users bring 3 new users)

### 2. Streak System
- Day 3: Unlock bonus pack
- Day 7: Unlock voice mode
- Day 30: FREE month of Pro
**Retention**: +40% from streaks

### 3. Leaderboards
- Weekly challenges
- Friend groups can compete
- Badge system (Bronze/Silver/Gold/Legend)
**Engagement**: +60% from competition

### 4. Photo Challenges (Pro)
- "Take a pic of your dare"
- Auto-post to Instagram Stories with watermark
- "Created with DrinkUp 🍻"
**Virality**: Every photo = free marketing

---

## 🧪 Testing Strategy

### Regression Testing
```bash
# Before every deploy:
1. Run unit tests (Jest)
2. Run integration tests (Playwright)
3. Test on iOS Simulator
4. Test on real iPhone
5. Test paywall flow
6. Test offline mode
7. Load test (100 concurrent users)
```

### Test Coverage Targets
- **Core flows**: 95% coverage
- **Payment flows**: 100% coverage
- **Edge cases**: 80% coverage

### Pre-Deploy Checklist
- [ ] All tests passing
- [ ] No console errors
- [ ] Database migrations run
- [ ] Environment variables set
- [ ] Analytics tracking works
- [ ] Paywall triggers correctly
- [ ] Offline mode works
- [ ] App icon + splash screen set

---

## 💸 Monetization Strategy

### Free Tier (Hook)
- 10 cards per session
- 1 game type unlocked daily (rotates)
- Ads after 5 cards
- Share to unlock 5 more cards

### Pro Tier ($5.99/mo)
**Must-have features:**
1. ♾️ Unlimited cards
2. 🔥 Extreme mode (18+ content)
3. 🎙️ Voice acting (hands-free)
4. 📸 Photo challenges
5. 🏆 Leaderboards
6. 🎨 6 custom packs
7. 🚫 No ads
8. ⚡ Early access to new games

**Value prop**: $1.50 per game vs $5.99/month unlimited

### Revenue Optimization
```typescript
// Show paywall at HIGH ENGAGEMENT moments
const showPaywall = () => {
  if (cardsPlayed === 10) {
    // Basic paywall
    showModal('upgrade');
  }
  
  if (laughCount > 5 && cardsPlayed === 7) {
    // Dynamic paywall when they're having fun
    showModal('upgrade_fun');
  }
  
  if (friendCount > 4) {
    // Group discount
    showModal('upgrade_group', { discount: 20% });
  }
};
```

---

## 📈 Metrics Dashboard

### Daily Tracking
- MAU (Monthly Active Users)
- DAU/MAU ratio (target: >20%)
- Avg session length (target: >10 min)
- Free → Pro conversion (target: >2%)
- Churn rate (target: <5% monthly)
- K-factor (viral coefficient, target: >0.5)

### Alerts
- If API calls > $100/day → Email alert
- If crash rate > 1% → Page ops
- If conversion < 1% → Review paywall

---

## 🔧 Maintenance Plan

### Daily (Automated)
- Generate fresh content via CRON
- Clean up old sessions (>7 days)
- Backup database
- Check error logs

### Weekly (Manual)
- Review flagged content
- Approve new AI-generated cards
- Check analytics dashboard
- Respond to support tickets

### Monthly (Manual)
- Review top requested features
- Update trending topics manually
- Optimize database queries
- Deploy new content packs

---

## 🎯 Success Metrics (6 Months)

### Phase 1 (Month 1-2): Launch & Learn
- Goal: 1,000 MAU
- Goal: 20 Pro subscribers ($120 MRR)
- Goal: 4.5+ App Store rating
- Cost: $200/month
- Status: LEARNING

### Phase 2 (Month 3-4): Optimize & Grow
- Goal: 5,000 MAU
- Goal: 100 Pro subscribers ($600 MRR)
- Goal: Featured in App Store
- Cost: $300/month
- Status: PROFITABLE

### Phase 3 (Month 5-6): Scale
- Goal: 25,000 MAU
- Goal: 500 Pro subscribers ($3,000 MRR)
- Goal: 10K+ downloads
- Cost: $500/month
- Status: SCALING

---

## 🚨 Risk Mitigation

### Technical Risks
- **Claude API goes down**: Have 30 days of pre-generated content cached
- **Database overload**: Use read replicas (Supabase built-in)
- **App Store rejection**: Follow all guidelines, 21+ age gate

### Business Risks
- **Low conversion**: A/B test paywall placement
- **High churn**: Add streak mechanics, push notifications
- **Copycats**: Build community, ship features fast

---

## ✅ Immediate Action Items

1. **Refactor AI generation** (1 hour)
   - Move from live calls to daily CRON
   - Store in Postgres with active=true flag

2. **Add content moderation** (1 hour)
   - Flagging system
   - Human review queue

3. **Implement data cleanup** (30 min)
   - CRON job to delete old data
   - Archive old sessions

4. **Add rate limiting** (30 min)
   - Max 10 games/hour per IP
   - Prevent abuse

5. **Full regression testing** (2 hours)
   - Test all 4 games
   - Test paywall
   - Test offline mode
   - Screenshot all flows

6. **Deploy preparation** (1 hour)
   - App icon
   - Screenshots
   - App Store listing

---

**Total estimated time to production-ready: 6 hours**

**Deploy target: 9 AM EST (in 8 hours)**
