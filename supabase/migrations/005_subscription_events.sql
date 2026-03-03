-- Subscription events table for tracking RevenueCat webhooks
CREATE TABLE IF NOT EXISTS public.subscription_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  is_pro BOOLEAN NOT NULL,
  product_id TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id 
  ON public.subscription_events(user_id);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_subscription_events_timestamp 
  ON public.subscription_events(timestamp DESC);

-- RLS policies (admin access only)
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage subscription events"
  ON public.subscription_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Users can view their own events
CREATE POLICY "Users can view own subscription events"
  ON public.subscription_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Comment
COMMENT ON TABLE public.subscription_events IS 'Tracks all subscription events from RevenueCat webhooks for analytics';
