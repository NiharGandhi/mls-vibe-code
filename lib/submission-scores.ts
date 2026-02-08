import { db, submissionScores, rubricCriteria, users } from "@/db";
import { eq, and } from "drizzle-orm";

export type SubmissionScoreRow = {
  id: number;
  submissionId: number;
  userId: string;
  rubricCriterionId: number;
  score: number;
  criterionLabel: string;
  maxPoints: number;
};

/** Get all scores for a submission (all judges, all criteria). */
export async function getSubmissionScores(
  submissionId: number
): Promise<SubmissionScoreRow[]> {
  const rows = await db
    .select({
      id: submissionScores.id,
      submissionId: submissionScores.submissionId,
      userId: submissionScores.userId,
      rubricCriterionId: submissionScores.rubricCriterionId,
      score: submissionScores.score,
      criterionLabel: rubricCriteria.label,
      maxPoints: rubricCriteria.maxPoints,
    })
    .from(submissionScores)
    .innerJoin(rubricCriteria, eq(rubricCriteria.id, submissionScores.rubricCriterionId))
    .where(eq(submissionScores.submissionId, submissionId));

  return rows.map((r) => ({
    id: r.id,
    submissionId: r.submissionId,
    userId: r.userId,
    rubricCriterionId: r.rubricCriterionId,
    score: r.score,
    criterionLabel: r.criterionLabel,
    maxPoints: r.maxPoints,
  }));
}

/** Get scores for one judge for one submission. */
export async function getJudgeScoresForSubmission(
  submissionId: number,
  userId: string
): Promise<{ rubricCriterionId: number; score: number; label: string; maxPoints: number }[]> {
  const rows = await db
    .select({
      rubricCriterionId: submissionScores.rubricCriterionId,
      score: submissionScores.score,
      label: rubricCriteria.label,
      maxPoints: rubricCriteria.maxPoints,
    })
    .from(submissionScores)
    .innerJoin(rubricCriteria, eq(rubricCriteria.id, submissionScores.rubricCriterionId))
    .where(
      and(
        eq(submissionScores.submissionId, submissionId),
        eq(submissionScores.userId, userId)
      )
    );

  return rows.map((r) => ({
    rubricCriterionId: r.rubricCriterionId,
    score: r.score,
    label: r.label,
    maxPoints: r.maxPoints,
  }));
}

/** Upsert a single criterion score by a judge. */
export async function setSubmissionScore(
  submissionId: number,
  userId: string,
  rubricCriterionId: number,
  score: number
): Promise<{ ok: true } | { error: string }> {
  const [existing] = await db
    .select({ id: submissionScores.id })
    .from(submissionScores)
    .where(
      and(
        eq(submissionScores.submissionId, submissionId),
        eq(submissionScores.userId, userId),
        eq(submissionScores.rubricCriterionId, rubricCriterionId)
      )
    );

  const now = new Date();
  if (existing) {
    await db
      .update(submissionScores)
      .set({ score, updatedAt: now })
      .where(eq(submissionScores.id, existing.id));
  } else {
    await db.insert(submissionScores).values({
      submissionId,
      userId,
      rubricCriterionId,
      score,
      updatedAt: now,
    });
  }
  return { ok: true };
}

/** Tabulated score: average of each judge's total (sum of criterion scores), then normalized to a single number. Returns { averageTotal, judgeTotals: { userId, total } }. */
export async function getTabulatedScore(
  submissionId: number
): Promise<{
  averageTotal: number;
  judgeCount: number;
  judgeTotals: { userId: string; judgeName: string | null; total: number }[];
}> {
  const rows = await db
    .select({
      userId: submissionScores.userId,
      score: submissionScores.score,
      judgeName: users.name,
    })
    .from(submissionScores)
    .innerJoin(users, eq(users.id, submissionScores.userId))
    .where(eq(submissionScores.submissionId, submissionId));

  const byJudge = new Map<string, { total: number; name: string | null }>();
  for (const r of rows) {
    const cur = byJudge.get(r.userId) ?? { total: 0, name: r.judgeName };
    cur.total += r.score;
    byJudge.set(r.userId, cur);
  }

  const judgeTotals = Array.from(byJudge.entries()).map(([userId, v]) => ({
    userId,
    judgeName: v.name,
    total: v.total,
  }));

  const judgeCount = judgeTotals.length;
  const averageTotal =
    judgeCount === 0 ? 0 : judgeTotals.reduce((a, j) => a + j.total, 0) / judgeCount;

  return { averageTotal, judgeCount, judgeTotals };
}
