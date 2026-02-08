-- Add submission_types to challenges (jsonb array: pitch_deck, word_doc, video, url_github, url_live, or ["all"])
ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "submission_types" jsonb DEFAULT '[]'::jsonb;
