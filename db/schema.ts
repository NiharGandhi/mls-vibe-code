import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  jsonb,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";
import { unique } from "drizzle-orm/pg-core/unique-constraint";

// Enums
export const userRoleEnum = pgEnum("user_role", ["participant", "mentor", "admin"]);

export const teamStatusEnum = pgEnum("team_status", [
  "open",
  "closed",
  "disqualified",
]);

export const challengeStatusEnum = pgEnum("challenge_status", [
  "upcoming",
  "running",
  "finished",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "invite_received",
  "invite_accepted",
  "join_request_received",
  "join_request_approved",
  "submission_feedback",
  "system_announcement",
]);

export const notificationPriorityEnum = pgEnum("notification_priority", [
  "low",
  "normal",
  "high",
]);

export const notificationUrgencyEnum = pgEnum("notification_urgency", [
  "info",
  "warning",
  "critical",
]);

export const submissionStatusEnum = pgEnum("submission_status", [
  "pending",
  "accepted",
  "rejected",
  "needs_review",
]);

export const teamInviteStatusEnum = pgEnum("team_invite_status", [
  "pending",
  "accepted",
  "declined",
  "expired",
]);

export const joinRequestStatusEnum = pgEnum("join_request_status", [
  "pending",
  "accepted",
  "rejected",
  "withdrawn",
]);

export const adminRoleEnum = pgEnum("admin_role", [
  "super_admin",
  "organizer",
  "judge",
  "mentor",
]);

export const settingScopeEnum = pgEnum("setting_scope", [
  "global",
  "challenge",
]);

/* ===========================
   Users
   =========================== */
   export const users = pgTable("users", {
    id: text("id").primaryKey(), // Better Auth user ID (text)
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    // Password handled by Better Auth
    role: userRoleEnum("role").notNull().default("participant"),
    /** Profile/avatar image URL (uploaded or preset). */
    imageUrl: varchar("image_url", { length: 500 }),
    // Your requested fields
    yearOfStudy: varchar("year_of_study", { length: 20 }), // "1st", "2nd", etc.
    majorOfStudy: varchar("major_of_study", { length: 100 }), // "CIT", "CSEC", etc.
    dob: timestamp("dob", { withTimezone: true, mode: "date" }), // Just date
    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  });
  

/* ===========================
   Teams and Membership
   =========================== */

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: teamStatusEnum("status").notNull().default("open"),
  maxMembers: integer("max_members").default(3), // Admin can override; default 3
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  challengeId: integer("challenge_id").references(() => challenges.id, { onDelete: "set null" }),
});

export const teamMembers = pgTable(
  "team_members",
  {
    teamId: integer("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleInTeam: varchar("role_in_team", { length: 50 }).notNull().default("member"),
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
    removedAt: timestamp("removed_at", { withTimezone: true }),
  },
  (t) => ({
    pk: primaryKey(t.teamId, t.userId),
  }),
);

// Team invites (owner/any member invites a user)
export const teamInvites = pgTable("team_invites", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  invitedUserId: text("invited_user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  invitedEmail: varchar("invited_email", { length: 255 }), // for non-registered users
  invitedByUserId: text("invited_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: teamInviteStatusEnum("status").notNull().default("pending"),
  message: text("message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
});

// Join requests (user requests to join team)
export const teamJoinRequests = pgTable("team_join_requests", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  requesterUserId: text("requester_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: joinRequestStatusEnum("status").notNull().default("pending"),
  message: text("message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
});

/* ===========================
   Challenges and Registration
   =========================== */

/** Submission type slugs for challenge config. "all" = all of the below. */
export const SUBMISSION_TYPE_SLUGS = [
  "pitch_deck",
  "word_doc",
  "video",
  "url_github",
  "url_live",
] as const;
export type SubmissionTypeSlug = (typeof SUBMISSION_TYPE_SLUGS)[number];
export const SUBMISSION_TYPE_ALL = "all" as const;

export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  rules: text("rules"),
  evaluationCriteria: text("evaluation_criteria"),
  status: challengeStatusEnum("status").notNull().default("upcoming"),
  minTeamSize: integer("min_team_size").default(1),
  maxTeamSize: integer("max_team_size"),
  maxTeams: integer("max_teams"), // Cap on how many teams can join
  startAt: timestamp("start_at", { withTimezone: true }),
  endAt: timestamp("end_at", { withTimezone: true }),
  submissionDeadline: timestamp("submission_deadline", { withTimezone: true }),
  /** Required submission types: array of slugs, or ["all"] for all types */
  submissionTypes: jsonb("submission_types").$type<string[]>().default([]),
  /** Optional custom label and description per submission type, e.g. { "pitch_deck": { "label": "Pitch Deck (PDF)", "description": "Max 10MB" } } */
  submissionTypeConfig: jsonb("submission_type_config").$type<Record<string, { label?: string; description?: string }>>().default({}),
  /** When set, rubric scores are visible to participants; before that only admins/judges see them. */
  scoresReleasedAt: timestamp("scores_released_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ===========================
   Submissions
   =========================== */

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id")
    .notNull()
    .references(() => challenges.id, { onDelete: "cascade" }),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  submittedByUserId: text("submitted_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: submissionStatusEnum("status").notNull().default("pending"),
  payload: jsonb("payload").notNull(), // can store link, repo, file references etc.
  score: integer("score"),
  rank: integer("rank"),
  feedback: text("feedback"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ===========================
 Notifications
 =========================== */

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  priority: notificationPriorityEnum("priority").notNull().default("normal"),
  urgency: notificationUrgencyEnum("urgency").notNull().default("info"),
  title: varchar("title", { length: 200 }).notNull(),
  body: text("body"),
  relatedEntityType: varchar("related_entity_type", { length: 50 }),
  relatedEntityId: integer("related_entity_id"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  readAt: timestamp("read_at", { withTimezone: true }),
});

/* ===========================
   Admin & Settings
   =========================== */

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: adminRoleEnum("role").notNull().default("organizer"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const challengeRoles = pgTable("challenge_roles", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id")
    .notNull()
    .references(() => challenges.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: adminRoleEnum("role").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ===========================
   Rubric & Judge Scores
   =========================== */

/** Rubric criterion for a challenge (e.g. "Technical quality" 0–10). */
export const rubricCriteria = pgTable("rubric_criteria", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id")
    .notNull()
    .references(() => challenges.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
  label: varchar("label", { length: 200 }).notNull(),
  description: text("description"),
  maxPoints: integer("max_points").notNull().default(10),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Optional feedback from a judge for a submission (one per judge per submission). */
export const submissionJudgeFeedback = pgTable(
  "submission_judge_feedback",
  {
    id: serial("id").primaryKey(),
    submissionId: integer("submission_id")
      .notNull()
      .references(() => submissions.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    feedback: text("feedback"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    onePerJudge: unique().on(t.submissionId, t.userId),
  })
);

/** Score given by a judge for one criterion on one submission. */
export const submissionScores = pgTable(
  "submission_scores",
  {
    id: serial("id").primaryKey(),
    submissionId: integer("submission_id")
      .notNull()
      .references(() => submissions.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    rubricCriterionId: integer("rubric_criterion_id")
      .notNull()
      .references(() => rubricCriteria.id, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    onePerJudgePerCriterion: unique().on(t.submissionId, t.userId, t.rubricCriterionId),
  })
);

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  scope: settingScopeEnum("scope").notNull().default("global"),
  scopeId: integer("scope_id"), // null for global, challenge_id for challenge
  key: varchar("key", { length: 100 }).notNull(),
  value: text("value").notNull(), // or jsonb if you prefer
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
