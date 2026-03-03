-- Production Features Migration
-- Adds: moderation, cleanup, rate limiting, analytics

-- Add moderation and lifecycle fields to cards
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS trending_topic TEXT;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'approved';
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS play_count INTEGER DEFAULT 0;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS flag_count INTEGER DEFAULT 0;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_cards_active ON public.cards(active) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_cards_game_intensity ON public.cards(game_type, intensity, active);
CREATE INDEX IF NOT EXISTS idx_cards_created ON public.cards(created_at DESC);

-- Rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  action TEXT NOT NULL, -- 'start_game', 'generate_content', etc.
  count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ip_address, action, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON public.rate_limits(ip_address, action, window_start);

-- Function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_ip TEXT,
  p_action TEXT,
  p_limit INTEGER,
  p_window_minutes INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Clean up old entries
  DELETE FROM public.rate_limits
  WHERE window_start < NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Get current count
  SELECT COALESCE(SUM(count), 0) INTO v_count
  FROM public.rate_limits
  WHERE ip_address = p_ip
    AND action = p_action
    AND window_start > NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Check if over limit
  IF v_count >= p_limit THEN
    RETURN FALSE;
  END IF;
  
  -- Increment counter
  INSERT INTO public.rate_limits (ip_address, action, count, window_start)
  VALUES (p_ip, p_action, 1, NOW())
  ON CONFLICT (ip_address, action, window_start)
  DO UPDATE SET count = public.rate_limits.count + 1;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Analytics table for tracking
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'game_started', 'card_played', 'paywall_shown', etc.
  user_id UUID REFERENCES public.profiles(id),
  session_id TEXT,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_type_date ON public.analytics_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_user ON public.analytics_events(user_id, created_at DESC);

-- Function to increment play count
CREATE OR REPLACE FUNCTION increment_card_play_count(card_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.cards
  SET play_count = play_count + 1
  WHERE id = card_uuid;
END;
$$ LANGUAGE plpgsql;

-- Moderation queue for flagged content
CREATE TABLE IF NOT EXISTS public.moderation_queue (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  card_id UUID REFERENCES public.cards(id),
  flagged_by UUID REFERENCES public.profiles(id),
  reason TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to flag inappropriate content
CREATE OR REPLACE FUNCTION flag_card(
  p_card_id UUID,
  p_user_id UUID,
  p_reason TEXT
) RETURNS void AS $$
BEGIN
  -- Increment flag count
  UPDATE public.cards
  SET flag_count = flag_count + 1
  WHERE id = p_card_id;
  
  -- Add to moderation queue
  INSERT INTO public.moderation_queue (card_id, flagged_by, reason)
  VALUES (p_card_id, p_user_id, p_reason);
  
  -- Auto-deactivate if too many flags (5+)
  UPDATE public.cards
  SET active = FALSE
  WHERE id = p_card_id
    AND flag_count >= 5;
END;
$$ LANGUAGE plpgsql;

-- Archive table for old sessions (cost savings)
CREATE SCHEMA IF NOT EXISTS archive;

CREATE TABLE IF NOT EXISTS archive.game_sessions (
  LIKE public.game_sessions INCLUDING ALL
);

-- Function to archive old sessions
CREATE OR REPLACE FUNCTION archive_old_sessions()
RETURNS INTEGER AS $$
DECLARE
  v_archived INTEGER;
BEGIN
  -- Move sessions older than 7 days to archive
  WITH moved AS (
    INSERT INTO archive.game_sessions
    SELECT * FROM public.game_sessions
    WHERE ended_at < NOW() - INTERVAL '7 days'
    RETURNING id
  )
  SELECT COUNT(*) INTO v_archived FROM moved;
  
  -- Delete from main table
  DELETE FROM public.game_sessions
  WHERE ended_at < NOW() - INTERVAL '7 days';
  
  RETURN v_archived;
END;
$$ LANGUAGE plpgsql;

-- CRON job to run daily cleanup (if pg_cron is enabled)
-- SELECT cron.schedule('daily-cleanup', '0 3 * * *', $$
--   SELECT archive_old_sessions();
--   DELETE FROM public.cards 
--   WHERE created_at < NOW() - INTERVAL '30 days' 
--     AND play_count < 10;
-- $$);

-- RLS for new tables
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;

-- Analytics: Users can insert their own events
CREATE POLICY "Users can log analytics" ON public.analytics_events
  FOR INSERT WITH CHECK (true);

-- Moderation: Users can flag content
CREATE POLICY "Users can flag content" ON public.moderation_queue
  FOR INSERT WITH CHECK (auth.uid() = flagged_by);

-- Add streak tracking to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_played_date DATE;

-- Function to update streak
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_last_played DATE;
  v_current_streak INTEGER;
BEGIN
  SELECT last_played_date, current_streak INTO v_last_played, v_current_streak
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- If played today, do nothing
  IF v_last_played = CURRENT_DATE THEN
    RETURN;
  END IF;
  
  -- If played yesterday, increment streak
  IF v_last_played = CURRENT_DATE - 1 THEN
    UPDATE public.profiles
    SET current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_played_date = CURRENT_DATE
    WHERE id = p_user_id;
  ELSE
    -- Streak broken, reset to 1
    UPDATE public.profiles
    SET current_streak = 1,
        last_played_date = CURRENT_DATE
    WHERE id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_rate_limit TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_card_play_count TO anon, authenticated;
GRANT EXECUTE ON FUNCTION flag_card TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_streak TO authenticated;
GRANT EXECUTE ON FUNCTION archive_old_sessions TO service_role;
