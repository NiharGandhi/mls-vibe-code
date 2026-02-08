CREATE TABLE "rubric_criteria" (
	"id" serial PRIMARY KEY NOT NULL,
	"challenge_id" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"label" varchar(200) NOT NULL,
	"description" text,
	"max_points" integer DEFAULT 10 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submission_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"submission_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"rubric_criterion_id" integer NOT NULL,
	"score" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "submission_scores_submission_id_user_id_rubric_criterion_id_unique" UNIQUE("submission_id","user_id","rubric_criterion_id")
);
--> statement-breakpoint
ALTER TABLE "rubric_criteria" ADD CONSTRAINT "rubric_criteria_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_scores" ADD CONSTRAINT "submission_scores_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_scores" ADD CONSTRAINT "submission_scores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_scores" ADD CONSTRAINT "submission_scores_rubric_criterion_id_rubric_criteria_id_fk" FOREIGN KEY ("rubric_criterion_id") REFERENCES "public"."rubric_criteria"("id") ON DELETE cascade ON UPDATE no action;