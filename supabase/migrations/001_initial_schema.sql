-- DrinkUp Database Schema

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  is_pro BOOLEAN DEFAULT FALSE,
  pro_expires_at TIMESTAMPTZ,
  daily_streak INTEGER DEFAULT 0,
  last_played_at TIMESTAMPTZ,
  total_games_played INTEGER DEFAULT 0,
  free_cards_used_today INTEGER DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game types enum
CREATE TYPE game_type AS ENUM ('truth_or_dare', 'would_you_rather', 'most_likely_to');

-- Intensity levels enum
CREATE TYPE intensity_level AS ENUM ('mild', 'spicy', 'extreme');

-- Content packs
CREATE TABLE IF NOT EXISTS public.content_packs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  game_type game_type NOT NULL,
  is_daily BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  trending_topic TEXT,
  tags TEXT[] DEFAULT '{}',
  play_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Cards table
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pack_id UUID REFERENCES public.content_packs(id) ON DELETE CASCADE,
  game_type game_type NOT NULL,
  content TEXT NOT NULL,
  card_subtype TEXT,
  option_a TEXT,
  option_b TEXT,
  intensity intensity_level DEFAULT 'mild',
  drink_penalty INTEGER DEFAULT 1,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game sessions for analytics
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  game_type game_type NOT NULL,
  pack_id UUID REFERENCES public.content_packs(id),
  players TEXT[] DEFAULT '{}',
  cards_played INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  intensity intensity_level DEFAULT 'mild',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- Daily content tracking
CREATE TABLE IF NOT EXISTS public.daily_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
  trending_topics JSONB DEFAULT '[]',
  packs_generated UUID[] DEFAULT '{}',
  generation_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public profiles are viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Free content is viewable" ON public.cards FOR SELECT USING (is_premium = false OR EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_pro = true
));

CREATE POLICY "Packs are viewable" ON public.content_packs FOR SELECT USING (true);

CREATE POLICY "Users manage own sessions" ON public.game_sessions FOR ALL USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Player'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed content
INSERT INTO public.content_packs (name, game_type, description, is_daily, is_premium) VALUES
  ('Starter Pack - Truth or Dare', 'truth_or_dare', 'Classic questions to get started', false, false),
  ('Starter Pack - Would You Rather', 'would_you_rather', 'Impossible choices', false, false),
  ('Starter Pack - Most Likely To', 'most_likely_to', 'Point at your friends', false, false);

-- Get pack IDs
WITH pack_ids AS (
  SELECT id, game_type FROM public.content_packs WHERE name LIKE 'Starter Pack%'
)
INSERT INTO public.cards (pack_id, game_type, content, card_subtype, intensity, drink_penalty, is_premium) 
SELECT 
  p.id,
  'truth_or_dare',
  unnest(ARRAY[
    'What''s the most embarrassing song on your playlist?',
    'What''s the last lie you told?',
    'Who in this room would you swipe right on?',
    'What''s your screen time average this week?',
    'What''s your biggest red flag in dating?'
  ]),
  'truth',
  'mild',
  1,
  false
FROM pack_ids p WHERE p.game_type = 'truth_or_dare';

INSERT INTO public.cards (pack_id, game_type, content, card_subtype, intensity, drink_penalty, is_premium)
SELECT 
  p.id,
  'truth_or_dare',
  unnest(ARRAY[
    'Do your best impression of someone in the room',
    'Let someone post a story on your Instagram',
    'Call a random contact and sing happy birthday',
    'Do a TikTok dance right now',
    'DM your ex "hey" right now'
  ]),
  'dare',
  'mild',
  1,
  false
FROM pack_ids p WHERE p.game_type = 'truth_or_dare';

INSERT INTO public.cards (pack_id, game_type, content, option_a, option_b, intensity, drink_penalty, is_premium)
SELECT 
  p.id,
  'would_you_rather',
  'Would you rather...',
  unnest(ARRAY[
    'Have your search history made public',
    'Only eat one food forever',
    'Be famous on TikTok',
    'Live without music',
    'Give up social media forever'
  ]),
  unnest(ARRAY[
    'Have your DMs made public',
    'Never eat your favorite food again',
    'Be rich but unknown',
    'Live without movies',
    'Give up streaming services forever'
  ]),
  'mild',
  1,
  false
FROM pack_ids p WHERE p.game_type = 'would_you_rather';

INSERT INTO public.cards (pack_id, game_type, content, intensity, drink_penalty, is_premium)
SELECT 
  p.id,
  'most_likely_to',
  unnest(ARRAY[
    'Most likely to go viral on TikTok',
    'Most likely to survive on a deserted island',
    'Most likely to text their ex tonight',
    'Most likely to fall asleep first at the party',
    'Most likely to become famous'
  ]),
  'mild',
  1,
  false
FROM pack_ids p WHERE p.game_type = 'most_likely_to';
