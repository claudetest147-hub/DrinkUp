-- Add never_have_i_ever to game_type enum
ALTER TYPE game_type ADD VALUE IF NOT EXISTS 'never_have_i_ever';

-- Seed Never Have I Ever content
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.cards WHERE game_type = 'never_have_i_ever' LIMIT 1) THEN
    INSERT INTO public.cards (game_type, content, intensity, drink_penalty, is_premium) VALUES
    ('never_have_i_ever'::game_type, 'Texted the wrong person', 'mild'::intensity_level, 1, false),
    ('never_have_i_ever'::game_type, 'Stalked an ex on social media', 'spicy'::intensity_level, 2, false),
    ('never_have_i_ever'::game_type, 'Cried during a kids movie', 'mild'::intensity_level, 1, false),
    ('never_have_i_ever'::game_type, 'Pretended to be sick to skip work', 'mild'::intensity_level, 1, false),
    ('never_have_i_ever'::game_type, 'Googled myself', 'mild'::intensity_level, 1, false),
    ('never_have_i_ever'::game_type, 'Had a crush on a celebrity', 'mild'::intensity_level, 1, false),
    ('never_have_i_ever'::game_type, 'Lied about my age', 'spicy'::intensity_level, 2, false),
    ('never_have_i_ever'::game_type, 'Fallen asleep in class or at work', 'mild'::intensity_level, 1, false),
    ('never_have_i_ever'::game_type, 'Checked someone''s phone without permission', 'spicy'::intensity_level, 2, false),
    ('never_have_i_ever'::game_type, 'Sent a risky text to the wrong person', 'spicy'::intensity_level, 3, false),
    ('never_have_i_ever'::game_type, 'Been in a long-distance relationship', 'mild'::intensity_level, 1, false),
    ('never_have_i_ever'::game_type, 'Regretted a haircut immediately', 'mild'::intensity_level, 1, false),
    ('never_have_i_ever'::game_type, 'Had a paranormal experience', 'mild'::intensity_level, 1, false),
    ('never_have_i_ever'::game_type, 'Been catfished online', 'spicy'::intensity_level, 2, false),
    ('never_have_i_ever'::game_type, 'Eaten food that fell on the floor', 'mild'::intensity_level, 1, false);
  END IF;
END $$;
