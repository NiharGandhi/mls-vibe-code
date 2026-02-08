import { getSession } from "@/lib/auth/server";
import { db, challenges, teams, teamMembers, submissions } from "@/db";
import { eq, and, isNull } from "drizzle-orm";
import { getEffectiveSubmissionTypes } from "@/lib/submission-types";
import { getPayloadKeyForSlug, type SubmissionPayload } from "@/lib/submission-payload";

export const dynamic = "force-dynamic";

/** GET ?teamId= – returns existing submission for this team in this challenge (if any). */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { data: session } = await getSession();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const challengeId = parseInt((await params).id, 10);
  const url = new URL(request.url);
  const teamId = url.searchParams.get("teamId");
  const teamIdNum = teamId ? parseInt(teamId, 10) : null;
  if (Number.isNaN(challengeId) || !teamIdNum || Number.isNaN(teamIdNum)) {
    return Response.json({ error: "Invalid challenge or team" }, { status: 400 });
  }

  const [member] = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamIdNum), eq(teamMembers.userId, session.user.id), isNull(teamMembers.removedAt)));
  if (!member) {
    return Response.json({ error: "Not a member of this team" }, { status: 403 });
  }

  const [sub] = await db
    .select({ id: submissions.id, payload: submissions.payload, status: submissions.status, submittedAt: submissions.submittedAt })
    .from(submissions)
    .where(and(eq(submissions.challengeId, challengeId), eq(submissions.teamId, teamIdNum)));

  if (!sub) return Response.json({ submission: null });
  return Response.json({
    submission: {
      id: sub.id,
      payload: sub.payload,
      status: sub.status,
      submittedAt: sub.submittedAt instanceof Date ? sub.submittedAt.toISOString() : String(sub.submittedAt),
    },
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { data: session } = await getSession();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const challengeId = parseInt((await params).id, 10);
  if (Number.isNaN(challengeId)) {
    return Response.json({ error: "Invalid challenge ID" }, { status: 400 });
  }

  let body: { teamId: number; payload: SubmissionPayload };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { teamId, payload } = body;
  if (!teamId || typeof teamId !== "number" || !payload || typeof payload !== "object") {
    return Response.json({ error: "teamId and payload are required." }, { status: 400 });
  }

  const [challenge] = await db.select().from(challenges).where(eq(challenges.id, challengeId));
  if (!challenge) {
    return Response.json({ error: "Challenge not found." }, { status: 404 });
  }
  if (challenge.status === "finished") {
    return Response.json({ error: "This challenge has ended." }, { status: 400 });
  }

  const requiredTypes = getEffectiveSubmissionTypes(challenge.submissionTypes ?? null);
  if (requiredTypes.length === 0) {
    return Response.json({ error: "This challenge does not accept submissions." }, { status: 400 });
  }

  const [team] = await db.select().from(teams).where(eq(teams.id, teamId));
  if (!team || team.challengeId !== challengeId) {
    return Response.json({ error: "Team not found or not registered for this challenge." }, { status: 400 });
  }
  if (team.ownerId !== session.user.id) {
    return Response.json({ error: "Only the team owner can submit for this team." }, { status: 403 });
  }

  for (const slug of requiredTypes) {
    const key = getPayloadKeyForSlug(slug);
    if (!key) continue;
    const value = payload[key];
    if (value == null || String(value).trim() === "") {
      return Response.json(
        { error: `Missing required submission: ${slug}.` },
        { status: 400 }
      );
    }
  }

  const [existing] = await db
    .select({ id: submissions.id })
    .from(submissions)
    .where(and(eq(submissions.challengeId, challengeId), eq(submissions.teamId, teamId)));

  if (existing) {
    const [updated] = await db
      .update(submissions)
      .set({
        payload: payload as unknown as Record<string, never>,
        submittedByUserId: session.user.id,
        status: "pending",
        submittedAt: new Date(),
      })
      .where(eq(submissions.id, existing.id))
      .returning({ id: submissions.id });
    return Response.json({ id: updated!.id, updated: true });
  }

  const [inserted] = await db
    .insert(submissions)
    .values({
      challengeId,
      teamId,
      submittedByUserId: session.user.id,
      status: "pending",
      payload: payload as unknown as Record<string, never>,
    })
    .returning({ id: submissions.id });

  return Response.json({ id: inserted!.id });
}
