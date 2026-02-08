import { getSession } from "@/lib/auth/server";
import { getAdminRole, canManageTeams } from "@/lib/admin";
import { updateTeamStatus } from "@/lib/admin-teams";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { data: session } = await getSession();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getAdminRole(session.user.id);
  if (!role || !canManageTeams(role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = parseInt((await params).id, 10);
  if (Number.isNaN(id)) {
    return Response.json({ error: "Invalid team ID" }, { status: 400 });
  }

  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const status = body.status;
  if (!status || !["open", "closed", "disqualified"].includes(status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }

  const result = await updateTeamStatus(id, status as "open" | "closed" | "disqualified");

  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json({ ok: true });
}
