import { db, submissions, challenges, teams, users } from "@/db";
import { eq, desc } from "drizzle-orm";

export type AdminSubmission = {
  id: number;
  challengeId: number;
  challengeTitle: string;
  teamId: number;
  teamName: string;
  submittedByUserId: string;
  submittedByName: string;
  status: string;
  payload: unknown;
  score: number | null;
  rank: number | null;
  feedback: string | null;
  submittedAt: string;
};

export async function getAllSubmissionsForAdmin(): Promise<AdminSubmission[]> {
  const rows = await db
    .select({
      id: submissions.id,
      challengeId: submissions.challengeId,
      teamId: submissions.teamId,
      submittedByUserId: submissions.submittedByUserId,
      status: submissions.status,
      payload: submissions.payload,
      score: submissions.score,
      rank: submissions.rank,
      feedback: submissions.feedback,
      submittedAt: submissions.submittedAt,
      challengeTitle: challenges.title,
      teamName: teams.name,
      submittedByName: users.name,
    })
    .from(submissions)
    .innerJoin(challenges, eq(challenges.id, submissions.challengeId))
    .innerJoin(teams, eq(teams.id, submissions.teamId))
    .innerJoin(users, eq(users.id, submissions.submittedByUserId))
    .orderBy(desc(submissions.submittedAt));

  return rows.map((r) => ({
    id: r.id,
    challengeId: r.challengeId,
    challengeTitle: r.challengeTitle,
    teamId: r.teamId,
    teamName: r.teamName,
    submittedByUserId: r.submittedByUserId,
    submittedByName: r.submittedByName ?? "Unknown",
    status: r.status,
    payload: r.payload,
    score: r.score,
    rank: r.rank,
    feedback: r.feedback,
    submittedAt:
      r.submittedAt instanceof Date ? r.submittedAt.toISOString() : String(r.submittedAt),
  }));
}

export async function updateSubmission(
  id: number,
  data: { status?: string; score?: number | null; feedback?: string | null }
): Promise<{ ok: true } | { error: string }> {
  const values: Record<string, unknown> = {};
  if (data.status != null) values.status = data.status;
  if (data.score !== undefined) values.score = data.score;
  if (data.feedback !== undefined) values.feedback = data.feedback;

  const [row] = await db
    .update(submissions)
    .set(values as Record<string, never>)
    .where(eq(submissions.id, id))
    .returning({ id: submissions.id });

  if (!row) return { error: "Submission not found." };
  return { ok: true };
}

export type AdminSubmissionDetail = AdminSubmission;

export async function getSubmissionByIdForAdmin(
  submissionId: number
): Promise<AdminSubmissionDetail | null> {
  const rows = await getAllSubmissionsForAdmin();
  return rows.find((s) => s.id === submissionId) ?? null;
}
