import { db, challenges, teams, teamMembers } from "@/db";
import { and, asc, eq, isNull, sql } from "drizzle-orm";

export type Challenge = {
  id: number;
  title: string;
  description: string;
  rules: string | null;
  evaluationCriteria: string | null;
  status: "upcoming" | "running" | "finished";
  minTeamSize: number | null;
  maxTeamSize: number | null;
  maxTeams: number | null;
  startAt: string | null;
  endAt: string | null;
  submissionDeadline: string | null;
  submissionTypes: string[] | null;
  submissionTypeConfig: Record<string, { label?: string; description?: string }> | null;
  scoresReleasedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getAllChallenges(): Promise<Challenge[]> {
  const rows = await db
    .select()
    .from(challenges)
    .orderBy(
      sql`CASE WHEN ${challenges.status} = 'running' THEN 1 WHEN ${challenges.status} = 'upcoming' THEN 2 WHEN ${challenges.status} = 'finished' THEN 3 ELSE 4 END`,
      asc(challenges.startAt)
    );

  return rows.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    rules: c.rules,
    evaluationCriteria: c.evaluationCriteria,
    status: c.status,
    minTeamSize: c.minTeamSize,
    maxTeamSize: c.maxTeamSize,
    maxTeams: c.maxTeams ?? null,
    startAt: c.startAt
      ? c.startAt instanceof Date
        ? c.startAt.toISOString()
        : String(c.startAt)
      : null,
    endAt: c.endAt
      ? c.endAt instanceof Date
        ? c.endAt.toISOString()
        : String(c.endAt)
      : null,
    submissionDeadline: c.submissionDeadline
      ? c.submissionDeadline instanceof Date
        ? c.submissionDeadline.toISOString()
        : String(c.submissionDeadline)
      : null,
    submissionTypes: Array.isArray(c.submissionTypes) ? c.submissionTypes : null,
    submissionTypeConfig:
      c.submissionTypeConfig && typeof c.submissionTypeConfig === "object"
        ? (c.submissionTypeConfig as Record<string, { label?: string; description?: string }>)
        : null,
    scoresReleasedAt: c.scoresReleasedAt
      ? c.scoresReleasedAt instanceof Date
        ? c.scoresReleasedAt.toISOString()
        : String(c.scoresReleasedAt)
      : null,
    createdAt:
      c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt),
    updatedAt:
      c.updatedAt instanceof Date ? c.updatedAt.toISOString() : String(c.updatedAt),
  }));
}

export type CreateChallengeInput = {
  title: string;
  description: string;
  rules?: string | null;
  evaluationCriteria?: string | null;
  status?: "upcoming" | "running" | "finished";
  minTeamSize?: number | null;
  maxTeamSize?: number | null;
  maxTeams?: number | null;
  startAt?: string | null;
  endAt?: string | null;
  submissionDeadline?: string | null;
  submissionTypes?: string[] | null;
  submissionTypeConfig?: Record<string, { label?: string; description?: string }> | null;
};

export async function createChallenge(
  input: CreateChallengeInput
): Promise<{ id: number } | { error: string }> {
  const title = input.title?.trim();
  const description = input.description?.trim();
  if (!title || title.length > 200) {
    return { error: "Title is required (max 200 characters)." };
  }
  if (!description) {
    return { error: "Description is required." };
  }

  const status = ["upcoming", "running", "finished"].includes(input.status ?? "")
    ? input.status
    : "upcoming";

  const [row] = await db
    .insert(challenges)
    .values({
      title,
      description,
      rules: input.rules?.trim() || null,
      evaluationCriteria: input.evaluationCriteria?.trim() || null,
      status,
      minTeamSize: input.minTeamSize ?? 1,
      maxTeamSize: input.maxTeamSize ?? null,
      maxTeams: input.maxTeams ?? null,
      startAt: input.startAt ? new Date(input.startAt) : null,
      endAt: input.endAt ? new Date(input.endAt) : null,
      submissionDeadline: input.submissionDeadline
        ? new Date(input.submissionDeadline)
        : null,
      submissionTypes: Array.isArray(input.submissionTypes) ? input.submissionTypes : [],
      submissionTypeConfig:
        input.submissionTypeConfig && typeof input.submissionTypeConfig === "object"
          ? input.submissionTypeConfig
          : {},
    })
    .returning({ id: challenges.id });

  if (!row) return { error: "Failed to create challenge." };
  return { id: row.id };
}

export type UpdateChallengeInput = Partial<CreateChallengeInput>;

export async function updateChallenge(
  id: number,
  input: UpdateChallengeInput
): Promise<{ ok: true } | { error: string }> {
  const title = input.title?.trim();
  if (title != null && (!title || title.length > 200)) {
    return { error: "Title must be 1–200 characters." };
  }
  const description = input.description?.trim();
  if (description != null && !description) {
    return { error: "Description cannot be empty." };
  }

  const status =
    input.status && ["upcoming", "running", "finished"].includes(input.status)
      ? input.status
      : undefined;

  const values: Record<string, unknown> = { updatedAt: new Date() };
  if (title != null) values.title = title;
  if (description != null) values.description = description;
  if (input.rules !== undefined) values.rules = input.rules?.trim() || null;
  if (input.evaluationCriteria !== undefined)
    values.evaluationCriteria = input.evaluationCriteria?.trim() || null;
  if (status != null) values.status = status;
  if (input.minTeamSize !== undefined) values.minTeamSize = input.minTeamSize;
  if (input.maxTeamSize !== undefined) values.maxTeamSize = input.maxTeamSize;
  if (input.maxTeams !== undefined) values.maxTeams = input.maxTeams;
  if (input.startAt !== undefined)
    values.startAt = input.startAt ? new Date(input.startAt) : null;
  if (input.endAt !== undefined)
    values.endAt = input.endAt ? new Date(input.endAt) : null;
  if (input.submissionDeadline !== undefined)
    values.submissionDeadline = input.submissionDeadline
      ? new Date(input.submissionDeadline)
      : null;
  if (input.submissionTypes !== undefined)
    values.submissionTypes = Array.isArray(input.submissionTypes) ? input.submissionTypes : [];
  if (input.submissionTypeConfig !== undefined)
    values.submissionTypeConfig =
      input.submissionTypeConfig && typeof input.submissionTypeConfig === "object"
        ? input.submissionTypeConfig
        : {};

  const [row] = await db
    .update(challenges)
    .set(values as Record<string, never>)
    .where(eq(challenges.id, id))
    .returning({ id: challenges.id });

  if (!row) return { error: "Challenge not found." };
  return { ok: true };
}

/** Team owner joins their team to a challenge. */
export async function joinTeamToChallenge(
  userId: string,
  challengeId: number,
  teamId: number
): Promise<{ ok: true } | { error: string }> {
  const [challenge] = await db.select().from(challenges).where(eq(challenges.id, challengeId));
  if (!challenge) return { error: "Challenge not found." };
  if (challenge.status === "finished") return { error: "This challenge has ended." };

  const [team] = await db.select().from(teams).where(eq(teams.id, teamId));
  if (!team) return { error: "Team not found." };
  if (team.ownerId !== userId) return { error: "Only the team owner can join a challenge." };
  if (team.status === "disqualified") return { error: "This team is disqualified." };
  // Each team can only be in one challenge at a time.
  if (team.challengeId != null && team.challengeId !== challengeId) {
    return { error: "This team is already in another challenge. Leave that challenge first to join this one." };
  }

  if (challenge.maxTeams != null) {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(teams)
      .where(eq(teams.challengeId, challengeId));
    if (count >= challenge.maxTeams) {
      return { error: "This challenge has reached its team limit." };
    }
  }

  const members = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), isNull(teamMembers.removedAt)));
  const memberCount = members.length;

  const minSize = challenge.minTeamSize ?? 1;
  const maxSize = challenge.maxTeamSize ?? 999;
  if (memberCount < minSize) {
    return { error: `Team needs at least ${minSize} member(s). Current: ${memberCount}.` };
  }
  if (memberCount > maxSize) {
    return { error: `Team has more than ${maxSize} member(s).` };
  }

  await db
    .update(teams)
    .set({ challengeId, updatedAt: new Date() })
    .where(eq(teams.id, teamId));

  return { ok: true };
}

/** Team owner leaves a challenge (unregisters their team). */
export async function leaveChallenge(
  userId: string,
  teamId: number
): Promise<{ ok: true } | { error: string }> {
  const [team] = await db.select().from(teams).where(eq(teams.id, teamId));
  if (!team) return { error: "Team not found." };
  if (team.ownerId !== userId) return { error: "Only the team owner can leave a challenge." };

  await db
    .update(teams)
    .set({ challengeId: null, updatedAt: new Date() })
    .where(eq(teams.id, teamId));

  return { ok: true };
}

/** Release all rubric scores for a challenge so participants can see them. */
export async function releaseChallengeScores(
  challengeId: number
): Promise<{ ok: true } | { error: string }> {
  const [c] = await db
    .select({ id: challenges.id })
    .from(challenges)
    .where(eq(challenges.id, challengeId));
  if (!c) return { error: "Challenge not found." };

  await db
    .update(challenges)
    .set({ scoresReleasedAt: new Date(), updatedAt: new Date() })
    .where(eq(challenges.id, challengeId));
  return { ok: true };
}

/** Delete a challenge (admin only). Related data is removed by DB cascade. */
export async function deleteChallenge(
  id: number
): Promise<{ ok: true } | { error: string }> {
  const [row] = await db
    .delete(challenges)
    .where(eq(challenges.id, id))
    .returning({ id: challenges.id });
  if (!row) return { error: "Challenge not found." };
  return { ok: true };
}
