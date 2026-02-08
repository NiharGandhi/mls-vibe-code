import { getSession } from "@/lib/auth/server";
import { db, teamJoinRequests, teams, users } from "@/db";
import { eq, and, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Returns pending join requests for the team. Owner only. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { data: session } = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teamId = Number((await params).teamId);
  if (Number.isNaN(teamId)) {
    return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
  }

  const [team] = await db.select().from(teams).where(eq(teams.id, teamId));
  if (!team || team.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Team not found or access denied" }, { status: 404 });
  }

  const rows = await db
    .select({
      requestId: teamJoinRequests.id,
      requesterUserId: teamJoinRequests.requesterUserId,
      requesterName: users.name,
      createdAt: teamJoinRequests.createdAt,
    })
    .from(teamJoinRequests)
    .innerJoin(users, eq(users.id, teamJoinRequests.requesterUserId))
    .where(
      and(
        eq(teamJoinRequests.teamId, teamId),
        eq(teamJoinRequests.status, "pending")
      )
    )
    .orderBy(desc(teamJoinRequests.createdAt));

  const pending = rows.map((r) => ({
    requestId: r.requestId,
    requesterUserId: r.requesterUserId,
    requesterName: r.requesterName,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
  }));

  return NextResponse.json(pending);
}
