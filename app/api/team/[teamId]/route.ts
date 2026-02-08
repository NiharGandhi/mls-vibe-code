import { getSession } from "@/lib/auth/server";
import { getTeamById, deleteTeam } from "@/lib/team";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId: teamIdParam } = await params;
  const teamId = parseInt(teamIdParam, 10);
  if (Number.isNaN(teamId)) {
    return Response.json({ error: "Invalid team ID" }, { status: 400 });
  }

  const { data: session } = await getSession();
  const userId = session?.user?.id;

  const team = await getTeamById(teamId, userId);
  if (!team) {
    return Response.json({ error: "Team not found" }, { status: 404 });
  }

  return Response.json(team);
}

export async function DELETE(
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

  const result = await deleteTeam(teamId, session.user.id);
  if ("error" in result) {
    return Response.json(
      { error: result.error },
      { status: result.error === "Team not found." ? 404 : 403 }
    );
  }

  return Response.json({ ok: true });
}
