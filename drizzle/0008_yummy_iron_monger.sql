CREATE TABLE "submission_judge_feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"submission_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"feedback" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "submission_judge_feedback_submission_id_user_id_unique" UNIQUE("submission_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "challenges" ADD COLUMN "scores_released_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "submission_judge_feedback" ADD CONSTRAINT "submission_judge_feedback_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_judge_feedback" ADD CONSTRAINT "submission_judge_feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;