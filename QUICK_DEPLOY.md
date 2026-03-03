# Quick Deploy Guide - 5 Minutes

## Prerequisites
You already have:
- ✅ Supabase CLI installed (`/opt/homebrew/bin/supabase`)
- ✅ Project ID: `yicbsjkdioiknonuuhvf`
- ✅ Service role key in `.env`
- ✅ Edge Function code ready in `supabase/functions/`

---

## Step 1: Login & Link (1 minute)

```bash
cd /Users/pmcodesprint/.openclaw/workspace/DrinkUp

# Login (opens browser, one-time setup)
supabase login

# Link to project
supabase link --project-ref yicbsjkdioiknonuuhvf
```

## Step 2: Set Claude API Key (1 minute)

You need a Claude API key. Get one at: https://console.anthropic.com/

```bash
# Set the secret
supabase secrets set CLAUDE_API_KEY="your-claude-api-key-here"
```

**Cost**: ~$2/day for daily content generation

## Step 3: Deploy Edge Function (2 minutes)

```bash
# Deploy the function
supabase functions deploy daily-content-generation

# Should output:
# Deployed Function daily-content-generation to project yicbsjkdioiknonuuhvf
```

## Step 4: Test It Works (1 minute)

```bash
# Test the function manually
curl -X POST \
  'https://yicbsjkdioiknonuuhvf.supabase.co/functions/v1/daily-content-generation' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpY2JzamtkaW9pa25vbnV1aHZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ4NDE4OSwiZXhwIjoyMDg4MDYwMTg5fQ.N4IilmJYfx2bnfw9owSOngR5lFghlppYHp0Ass16KDE'

# Should return JSON with:
# {"success": true, "generated": 200, "topic": "...", "timestamp": "..."}
```

## Step 5: Set Up CRON (2 minutes)

Go to Supabase Dashboard → SQL Editor:
https://supabase.com/dashboard/project/yicbsjkdioiknonuuhvf/sql/new

Run this SQL:

```sql
-- Schedule daily content generation at 6 AM
SELECT cron.schedule(
  'daily-content-generation',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url:='https://yicbsjkdioiknonuuhvf.supabase.co/functions/v1/daily-content-generation',
    headers:='{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpY2JzamtkaW9pa25vbnV1aHZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ4NDE4OSwiZXhwIjoyMDg4MDYwMTg5fQ.N4IilmJYfx2bnfw9owSOngR5lFghlppYHp0Ass16KDE"}'::jsonb
  );
  $$
);

-- Schedule daily cleanup at 3 AM
SELECT cron.schedule(
  'daily-cleanup',
  '0 3 * * *',
  $$
  SELECT archive_old_sessions();
  DELETE FROM public.cards 
  WHERE created_at < NOW() - INTERVAL '30 days' 
    AND play_count < 10;
  $$
);
```

---

## ✅ Done!

Your Edge Function is now:
- ✅ Deployed and live
- ✅ Generating 200 cards daily at 6 AM
- ✅ Cleaning up old data at 3 AM
- ✅ Costing $2/day instead of $500/day

---

## Verify It Worked

Check the database has fresh content:

```sql
SELECT game_type, intensity, COUNT(*) as count
FROM cards
WHERE created_at > NOW() - INTERVAL '1 day'
GROUP BY game_type, intensity
ORDER BY game_type, intensity;
```

Should show:
- truth_or_dare / mild: ~25
- truth_or_dare / spicy: ~25
- would_you_rather / mild: ~25
- would_you_rather / spicy: ~25
- most_likely_to / mild: ~25
- most_likely_to / spicy: ~25
- never_have_i_ever / mild: ~25
- never_have_i_ever / spicy: ~25

**Total: ~200 cards**

---

## Troubleshooting

**"Function not found"**:
- Re-run: `supabase functions deploy daily-content-generation`

**"Secret not set"**:
- Re-run: `supabase secrets set CLAUDE_API_KEY="your-key"`

**"CRON not running"**:
- Check Supabase Dashboard → Database → Extensions → pg_cron is enabled
- View CRON jobs: `SELECT * FROM cron.job;`

**"No cards generated"**:
- Check function logs: Supabase Dashboard → Edge Functions → Logs
- Test manually with curl command above

---

## Next Steps

Once Edge Function is working:
1. ✅ Run production migration (`004_production_features.sql`)
2. ✅ App is ready for TestFlight build!

**Total time to deploy**: 5-10 minutes
