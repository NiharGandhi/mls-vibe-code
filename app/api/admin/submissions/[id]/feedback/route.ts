import { getSession } from "@/lib/auth/server";
import { isJudgeForChallenge } from "@/lib/admin";
import { db, submissions } from "@/db";
import { eq } from "drizzle-orm";
import { setJudgeFeedback } from "@/lib/judge-feedback";

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

  let body: { feedback?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const feedback = typeof body.feedback === "string" ? body.feedback : "";
  const result = await setJudgeFeedback(submissionId, session.user.id, feedback);

  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 400 });
  }
  return Response.json({ ok: true });
}
