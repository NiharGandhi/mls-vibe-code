-- Per-judge optional feedback for a submission
CREATE TABLE IF NOT EXISTS "submission_judge_feedback" (
  "id" serial PRIMARY KEY NOT NULL,
  "submission_id" integer NOT NULL REFERENCES "submissions"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "feedback" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE("submission_id", "user_id")
);

-- When scores are released for a challenge (participants can see them)
ALTER TABLE "challenges" ADD COLUMN IF NOT EXISTS "scores_released_at" timestamp with time zone;
