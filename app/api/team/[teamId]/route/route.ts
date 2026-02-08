import { getSession } from "@/lib/auth/server";
import { createNotification } from "@/lib/notifications";
import { createJoinRequest } from "@/lib/team";
import { db, teams } from "@/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { data: session } = await getSession();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { teamId: teamIdParam } = await params;
  const teamId = parseInt(teamIdParam, 10);
  if (Number.isNaN(teamId)) {
    return Response.json({ error: "Invalid team ID" }, { status: 400 });
  }

  const result = await createJoinRequest(session.user.id, teamId);

  if ("error" in result) {
    return Response.json({ ok: false, error: result.error }, { status: 400 });
  }

  const [team] = await db.select().from(teams).where(eq(teams.id, teamId));
  if (team && "requestId" in result) {
    const requesterName = session.user.name ?? "Someone";
    await createNotification({
      userId: team.ownerId,
      type: "join_request_received",
      title: "New join request",
      body: `${requesterName} requested to join ${team.name}.`,
      relatedEntityType: "team",
      relatedEntityId: teamId,
    });
  }

  return Response.json({ ok: true });
}
