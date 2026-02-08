import { getSession } from "@/lib/auth/server";
import { isJudgeForChallenge } from "@/lib/admin";
import { db, submissions, rubricCriteria } from "@/db";
import { eq } from "drizzle-orm";
import { setSubmissionScore } from "@/lib/submission-scores";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { data: session } = await getSession();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submissionId = parseInt((await params).id, 10);
  if (Number.isNaN(submissionId)) {
    return Response.json({ error: "Invalid submission ID" }, { status: 400 });
  }

  const [sub] = await db
    .select({ challengeId: submissions.challengeId })
    .from(submissions)
    .where(eq(submissions.id, submissionId));
  if (!sub) {
    return Response.json({ error: "Submission not found" }, { status: 404 });
  }

  const isJudge = await isJudgeForChallenge(session.user.id, sub.challengeId);
  if (!isJudge) {
    return Response.json({ error: "You are not a judge for this challenge" }, { status: 403 });
  }

  let body: { rubricCriterionId?: number; score?: number };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { rubricCriterionId, score } = body;
  if (
    rubricCriterionId == null ||
    typeof rubricCriterionId !== "number" ||
    score == null ||
    typeof score !== "number"
  ) {
    return Response.json(
      { error: "rubricCriterionId and score are required" },
      { status: 400 }
    );
  }

  const [criterion] = await db
    .select({ maxPoints: rubricCriteria.maxPoints, challengeId: rubricCriteria.challengeId })
    .from(rubricCriteria)
    .where(eq(rubricCriteria.id, rubricCriterionId));
  if (!criterion || criterion.challengeId !== sub.challengeId) {
    return Response.json({ error: "Invalid rubric criterion" }, { status: 400 });
  }
  if (score < 0 || score > criterion.maxPoints) {
    return Response.json(
      { error: `Score must be between 0 and ${criterion.maxPoints}` },
      { status: 400 }
    );
  }

  const result = await setSubmissionScore(
    submissionId,
    session.user.id,
    rubricCriterionId,
    score
  );

  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 400 });
  }
  return Response.json({ ok: true });
}
