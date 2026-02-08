import { getSession } from "@/lib/auth/server";
import { getAdminRole, canManageChallenges } from "@/lib/admin";
import { updateChallenge, deleteChallenge } from "@/lib/challenge";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { data: session } = await getSession();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getAdminRole(session.user.id);
  if (!role || !canManageChallenges(role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = parseInt((await params).id, 10);
  if (Number.isNaN(id)) {
    return Response.json({ error: "Invalid challenge ID" }, { status: 400 });
  }

  const result = await deleteChallenge(id);
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json({ ok: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { data: session } = await getSession();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getAdminRole(session.user.id);
  if (!role || !canManageChallenges(role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = parseInt((await params).id, 10);
  if (Number.isNaN(id)) {
    return Response.json({ error: "Invalid challenge ID" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = await updateChallenge(id, {
    title: body.title as string | undefined,
    description: body.description as string | undefined,
    rules: body.rules as string | null | undefined,
    evaluationCriteria: body.evaluationCriteria as string | null | undefined,
    status: body.status as "upcoming" | "running" | "finished" | undefined,
    minTeamSize: body.minTeamSize as number | null | undefined,
    maxTeamSize: body.maxTeamSize as number | null | undefined,
    maxTeams: body.maxTeams as number | null | undefined,
    startAt: body.startAt as string | null | undefined,
    endAt: body.endAt as string | null | undefined,
    submissionDeadline: body.submissionDeadline as string | null | undefined,
    submissionTypes: Array.isArray(body.submissionTypes) ? (body.submissionTypes as string[]) : undefined,
    submissionTypeConfig:
      body.submissionTypeConfig && typeof body.submissionTypeConfig === "object"
        ? (body.submissionTypeConfig as Record<string, { label?: string; description?: string }>)
        : undefined,
  });

  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json({ ok: true });
}
