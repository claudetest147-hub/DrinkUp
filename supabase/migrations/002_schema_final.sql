-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Game types enum
DO $$ BEGIN
  CREATE TYPE game_type AS ENUM ('truth_or_dare', 'would_you_rather', 'most_likely_to');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Content intensity levels
DO $$ BEGIN
  CREATE TYPE intensity_level AS ENUM ('mild', 'spicy', 'extreme');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Profiles table
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content packs
CREATE TABLE IF NOT EXISTS public.content_packs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Game sessions
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
CREATE POLICY "Public profiles are viewable" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Cards are viewable" ON public.cards;
CREATE POLICY "Cards are viewable" ON public.cards FOR SELECT USING (true);

DROP POLICY IF EXISTS "Packs are viewable" ON public.content_packs;
CREATE POLICY "Packs are viewable" ON public.content_packs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users manage own sessions" ON public.game_sessions;
CREATE POLICY "Users manage own sessions" ON public.game_sessions FOR ALL USING (auth.uid() = user_id);

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Player'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed Truth or Dare content with explicit casts
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.cards WHERE game_type = 'truth_or_dare' LIMIT 1) THEN
    INSERT INTO public.cards (game_type, content, card_subtype, intensity, drink_penalty, is_premium) VALUES
    ('truth_or_dare'::game_type, 'What''s the most embarrassing song on your playlist?', 'truth', 'mild'::intensity_level, 1, false),
    ('truth_or_dare'::game_type, 'Do your best impression of someone in the room', 'dare', 'mild'::intensity_level, 1, false),
    ('truth_or_dare'::game_type, 'What''s the last lie you told?', 'truth', 'mild'::intensity_level, 1, false),
    ('truth_or_dare'::game_type, 'Let someone post anything on your Instagram story', 'dare', 'mild'::intensity_level, 1, false),
    ('truth_or_dare'::game_type, 'What''s your most used emoji and why?', 'truth', 'mild'::intensity_level, 1, false),
    ('truth_or_dare'::game_type, 'Call a random contact and sing happy birthday', 'dare', 'mild'::intensity_level, 2, false),
    ('truth_or_dare'::game_type, 'What''s your screen time average this week?', 'truth', 'mild'::intensity_level, 1, false),
    ('truth_or_dare'::game_type, 'Do a TikTok dance right now', 'dare', 'mild'::intensity_level, 1, false),
    ('truth_or_dare'::game_type, 'Who in this room would survive a zombie apocalypse last?', 'truth', 'mild'::intensity_level, 1, false),
    ('truth_or_dare'::game_type, 'Let the group go through your recent searches', 'dare', 'mild'::intensity_level, 2, false),
    ('truth_or_dare'::game_type, 'What''s your biggest red flag in dating?', 'truth', 'spicy'::intensity_level, 2, false),
    ('truth_or_dare'::game_type, 'Send a "thinking of you" text to your crush', 'dare', 'spicy'::intensity_level, 2, false),
    ('truth_or_dare'::game_type, 'What''s the worst date you''ve ever been on?', 'truth', 'spicy'::intensity_level, 2, false),
    ('truth_or_dare'::game_type, 'DM your ex "hey" right now', 'dare', 'spicy'::intensity_level, 3, false),
    ('truth_or_dare'::game_type, 'Who in this room would you swipe right on?', 'truth', 'spicy'::intensity_level, 2, false);
  END IF;
END $$;

-- Seed Would You Rather content
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.cards WHERE game_type = 'would_you_rather' LIMIT 1) THEN
    INSERT INTO public.cards (game_type, content, option_a, option_b, intensity, drink_penalty, is_premium) VALUES
    ('would_you_rather'::game_type, 'Would you rather...', 'Have your search history made public', 'Have your DMs made public', 'mild'::intensity_level, 1, false),
    ('would_you_rather'::game_type, 'Would you rather...', 'Only eat one food forever', 'Never eat your favorite food again', 'mild'::intensity_level, 1, false),
    ('would_you_rather'::game_type, 'Would you rather...', 'Be famous on TikTok', 'Be rich but unknown', 'mild'::intensity_level, 1, false),
    ('would_you_rather'::game_type, 'Would you rather...', 'Live without music', 'Live without movies', 'mild'::intensity_level, 1, false),
    ('would_you_rather'::game_type, 'Would you rather...', 'Always say what you''re thinking', 'Never speak again', 'mild'::intensity_level, 1, false),
    ('would_you_rather'::game_type, 'Would you rather...', 'Have unlimited money but no friends', 'Be broke with amazing friends', 'mild'::intensity_level, 1, false),
    ('would_you_rather'::game_type, 'Would you rather...', 'Relive high school', 'Skip to age 40', 'mild'::intensity_level, 1, false),
    ('would_you_rather'::game_type, 'Would you rather...', 'Be able to fly', 'Be invisible', 'mild'::intensity_level, 1, false),
    ('would_you_rather'::game_type, 'Would you rather...', 'Only communicate through memes', 'Only communicate through song lyrics', 'mild'::intensity_level, 1, false),
    ('would_you_rather'::game_type, 'Would you rather...', 'Give up social media forever', 'Give up streaming services forever', 'mild'::intensity_level, 1, false);
  END IF;
END $$;

-- Seed Most Likely To content
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.cards WHERE game_type = 'most_likely_to' LIMIT 1) THEN
    INSERT INTO public.cards (game_type, content, intensity, drink_penalty, is_premium) VALUES
    ('most_likely_to'::game_type, 'Most likely to go viral on TikTok', 'mild'::intensity_level, 1, false),
    ('most_likely_to'::game_type, 'Most likely to survive on a deserted island', 'mild'::intensity_level, 1, false),
    ('most_likely_to'::game_type, 'Most likely to become a millionaire', 'mild'::intensity_level, 1, false),
    ('most_likely_to'::game_type, 'Most likely to text their ex tonight', 'spicy'::intensity_level, 2, false),
    ('most_likely_to'::game_type, 'Most likely to fall asleep first at the party', 'mild'::intensity_level, 1, false),
    ('most_likely_to'::game_type, 'Most likely to start a fight over nothing', 'mild'::intensity_level, 1, false),
    ('most_likely_to'::game_type, 'Most likely to eat something off the floor', 'mild'::intensity_level, 1, false),
    ('most_likely_to'::game_type, 'Most likely to become famous', 'mild'::intensity_level, 1, false),
    ('most_likely_to'::game_type, 'Most likely to cry during a movie', 'mild'::intensity_level, 1, false),
    ('most_likely_to'::game_type, 'Most likely to ghost someone', 'spicy'::intensity_level, 2, false);
  END IF;
END $$;
