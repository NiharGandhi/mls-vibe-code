import { db, submissionJudgeFeedback, users } from "@/db";
import { eq, and } from "drizzle-orm";

export type JudgeFeedbackRow = {
  userId: string;
  judgeName: string | null;
  feedback: string | null;
};

export async function getJudgeFeedbackForSubmission(
  submissionId: number
): Promise<JudgeFeedbackRow[]> {
  const rows = await db
    .select({
      userId: submissionJudgeFeedback.userId,
      judgeName: users.name,
      feedback: submissionJudgeFeedback.feedback,
    })
    .from(submissionJudgeFeedback)
    .innerJoin(users, eq(users.id, submissionJudgeFeedback.userId))
    .where(eq(submissionJudgeFeedback.submissionId, submissionId));

  return rows.map((r) => ({
    userId: r.userId,
    judgeName: r.judgeName,
    feedback: r.feedback,
  }));
}

export async function getJudgeFeedbackForSubmissionByJudge(
  submissionId: number,
  userId: string
): Promise<string | null> {
  const [row] = await db
    .select({ feedback: submissionJudgeFeedback.feedback })
    .from(submissionJudgeFeedback)
    .where(
      and(
        eq(submissionJudgeFeedback.submissionId, submissionId),
        eq(submissionJudgeFeedback.userId, userId)
      )
    );
  return row?.feedback ?? null;
}

export async function setJudgeFeedback(
  submissionId: number,
  userId: string,
  feedback: string
): Promise<{ ok: true } | { error: string }> {
  const trimmed = feedback.trim() || null;
  const [existing] = await db
    .select({ id: submissionJudgeFeedback.id })
    .from(submissionJudgeFeedback)
    .where(
      and(
        eq(submissionJudgeFeedback.submissionId, submissionId),
        eq(submissionJudgeFeedback.userId, userId)
      )
    );

  const now = new Date();
  if (existing) {
    if (trimmed === null) {
      await db
        .delete(submissionJudgeFeedback)
        .where(eq(submissionJudgeFeedback.id, existing.id));
    } else {
      await db
        .update(submissionJudgeFeedback)
        .set({ feedback: trimmed, updatedAt: now })
        .where(eq(submissionJudgeFeedback.id, existing.id));
    }
  } else if (trimmed !== null) {
    await db.insert(submissionJudgeFeedback).values({
      submissionId,
      userId,
      feedback: trimmed,
      updatedAt: now,
    });
  }
  return { ok: true };
}
