ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "submission_type_config" jsonb DEFAULT '{}'::jsonb;
