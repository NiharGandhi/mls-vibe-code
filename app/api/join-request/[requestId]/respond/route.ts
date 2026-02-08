import { getSession } from "@/lib/auth/server";
import { createNotification } from "@/lib/notifications";
import { db, teamJoinRequests, teamMembers, teams } from "@/db";
import { eq, and, isNull, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function getMemberCount(teamId: number): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), isNull(teamMembers.removedAt)));
  return row?.count ?? 0;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { data: session } = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requestIdNum = Number((await params).requestId);
  if (Number.isNaN(requestIdNum)) {
    return NextResponse.json({ error: "Invalid request ID" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const action = body.action === "reject" ? "reject" : "accept";

  const [joinRequest] = await db
    .select()
    .from(teamJoinRequests)
    .where(eq(teamJoinRequests.id, requestIdNum));
  if (!joinRequest || joinRequest.status !== "pending") {
    return NextResponse.json(
      { error: "Join request not found or already resolved." },
      { status: 400 }
    );
  }

  const [team] = await db
    .select()
    .from(teams)
    .where(eq(teams.id, joinRequest.teamId));
  if (!team) {
    return NextResponse.json({ error: "Team not found." }, { status: 404 });
  }
  if (team.ownerId !== session.user.id) {
    return NextResponse.json(
      { error: "Only the team owner can accept or reject join requests." },
      { status: 403 }
    );
  }

  const now = new Date();
  if (action === "reject") {
    await db
      .update(teamJoinRequests)
      .set({ status: "rejected", decidedAt: now })
      .where(eq(teamJoinRequests.id, requestIdNum));
    return NextResponse.json({ ok: true });
  }

  const [existingRow] = await db
    .select()
    .from(teamMembers)
    .where(
      and(
        eq(teamMembers.teamId, joinRequest.teamId),
        eq(teamMembers.userId, joinRequest.requesterUserId)
      )
    );

  const alreadyActive = existingRow && existingRow.removedAt == null;

  if (!existingRow) {
    const memberCount = await getMemberCount(joinRequest.teamId);
    const max = team.maxMembers ?? 999;
    if (memberCount >= max) {
      return NextResponse.json({ error: "Team is full." }, { status: 400 });
    }
    await db.insert(teamMembers).values({
      teamId: joinRequest.teamId,
      userId: joinRequest.requesterUserId,
      roleInTeam: "member",
    });
  } else if (existingRow.removedAt != null) {
    await db
      .update(teamMembers)
      .set({ removedAt: null, roleInTeam: "member" })
      .where(
        and(
          eq(teamMembers.teamId, joinRequest.teamId),
          eq(teamMembers.userId, joinRequest.requesterUserId)
        )
      );
  }

  await db
    .update(teamJoinRequests)
    .set({ status: "accepted", decidedAt: now })
    .where(eq(teamJoinRequests.id, requestIdNum));

  if (!alreadyActive) {
    await createNotification({
      userId: joinRequest.requesterUserId,
      type: "join_request_approved",
      title: "Join request approved",
      body: `Your request to join ${team.name} was approved.`,
      relatedEntityType: "team",
      relatedEntityId: team.id,
    });
  }

  return NextResponse.json({ ok: true });
}
