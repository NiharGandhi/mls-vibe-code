-- Rubric criteria per challenge
CREATE TABLE IF NOT EXISTS "rubric_criteria" (
  "id" serial PRIMARY KEY NOT NULL,
  "challenge_id" integer NOT NULL REFERENCES "challenges"("id") ON DELETE CASCADE,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "label" varchar(200) NOT NULL,
  "description" text,
  "max_points" integer DEFAULT 10 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Judge scores per submission per criterion
CREATE TABLE IF NOT EXISTS "submission_scores" (
  "id" serial PRIMARY KEY NOT NULL,
  "submission_id" integer NOT NULL REFERENCES "submissions"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "rubric_criterion_id" integer NOT NULL REFERENCES "rubric_criteria"("id") ON DELETE CASCADE,
  "score" integer NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE("submission_id", "user_id", "rubric_criterion_id")
);
