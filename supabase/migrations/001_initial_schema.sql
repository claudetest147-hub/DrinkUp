-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Game types enum
CREATE TYPE game_type AS ENUM ('truth_or_dare', 'would_you_rather', 'most_likely_to');

-- Content intensity levels
CREATE TYPE intensity_level AS ENUM ('mild', 'spicy', 'extreme');

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
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
CREATE TABLE public.content_packs (
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

-- Individual cards/prompts
CREATE TABLE public.cards (
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

-- Game sessions for analytics
CREATE TABLE public.game_sessions (
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

-- Profiles: users can read all, update own
CREATE POLICY "Public profiles are viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Content: all users can read
CREATE POLICY "Cards are viewable" ON public.cards FOR SELECT USING (true);
CREATE POLICY "Packs are viewable" ON public.content_packs FOR SELECT USING (true);

-- Sessions: users can CRUD own
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

-- Seed content for Truth or Dare (mild)
INSERT INTO public.cards (game_type, content, card_subtype, intensity, drink_penalty, is_premium) VALUES
('truth_or_dare', 'What''s the most embarrassing song on your playlist?', 'truth', 'mild', 1, false),
('truth_or_dare', 'Do your best impression of someone in the room', 'dare', 'mild', 1, false),
('truth_or_dare', 'What''s the last lie you told?', 'truth', 'mild', 1, false),
('truth_or_dare', 'Let someone post anything on your Instagram story', 'dare', 'mild', 1, false),
('truth_or_dare', 'What''s your most used emoji and why?', 'truth', 'mild', 1, false),
('truth_or_dare', 'Call a random contact and sing happy birthday', 'dare', 'mild', 2, false),
('truth_or_dare', 'What''s your screen time average this week?', 'truth', 'mild', 1, false),
('truth_or_dare', 'Do a TikTok dance right now', 'dare', 'mild', 1, false),
('truth_or_dare', 'Who in this room would survive a zombie apocalypse last?', 'truth', 'mild', 1, false),
('truth_or_dare', 'Let the group go through your recent searches', 'dare', 'mild', 2, false);

-- Seed content for Truth or Dare (spicy)
INSERT INTO public.cards (game_type, content, card_subtype, intensity, drink_penalty, is_premium) VALUES
('truth_or_dare', 'What''s your biggest red flag in dating?', 'truth', 'spicy', 2, false),
('truth_or_dare', 'Send a "thinking of you" text to your crush', 'dare', 'spicy', 2, false),
('truth_or_dare', 'What''s the worst date you''ve ever been on?', 'truth', 'spicy', 2, false),
('truth_or_dare', 'DM your ex "hey" right now', 'dare', 'spicy', 3, false),
('truth_or_dare', 'Who in this room would you swipe right on?', 'truth', 'spicy', 2, false);

-- Seed content for Would You Rather
INSERT INTO public.cards (game_type, option_a, option_b, intensity, drink_penalty, is_premium) VALUES
('would_you_rather', 'Have your search history made public', 'Have your DMs made public', 'mild', 1, false),
('would_you_rather', 'Only eat one food forever', 'Never eat your favorite food again', 'mild', 1, false),
('would_you_rather', 'Be famous on TikTok', 'Be rich but unknown', 'mild', 1, false),
('would_you_rather', 'Live without music', 'Live without movies', 'mild', 1, false),
('would_you_rather', 'Always say what you''re thinking', 'Never speak again', 'mild', 1, false),
('would_you_rather', 'Have unlimited money but no friends', 'Be broke with amazing friends', 'mild', 1, false),
('would_you_rather', 'Relive high school', 'Skip to age 40', 'mild', 1, false),
('would_you_rather', 'Be able to fly', 'Be invisible', 'mild', 1, false),
('would_you_rather', 'Only communicate through memes', 'Only communicate through song lyrics', 'mild', 1, false),
('would_you_rather', 'Give up social media forever', 'Give up streaming services forever', 'mild', 1, false);

-- Seed content for Most Likely To
INSERT INTO public.cards (game_type, content, intensity, drink_penalty, is_premium) VALUES
('most_likely_to', 'Most likely to go viral on TikTok', 'mild', 1, false),
('most_likely_to', 'Most likely to survive on a deserted island', 'mild', 1, false),
('most_likely_to', 'Most likely to become a millionaire', 'mild', 1, false),
('most_likely_to', 'Most likely to text their ex tonight', 'spicy', 2, false),
('most_likely_to', 'Most likely to fall asleep first at the party', 'mild', 1, false),
('most_likely_to', 'Most likely to start a fight over nothing', 'mild', 1, false),
('most_likely_to', 'Most likely to eat something off the floor', 'mild', 1, false),
('most_likely_to', 'Most likely to become famous', 'mild', 1, false),
('most_likely_to', 'Most likely to cry during a movie', 'mild', 1, false),
('most_likely_to', 'Most likely to ghost someone', 'spicy', 2, false);
