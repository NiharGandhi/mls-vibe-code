import { getSession } from "@/lib/auth/server";
import { getAdminRole, canManageChallenges } from "@/lib/admin";
import { updateRubricCriterion, deleteRubricCriterion } from "@/lib/rubric";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; criterionId: string }> }
) {
  const { data: session } = await getSession();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getAdminRole(session.user.id);
  if (!role || !canManageChallenges(role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const criterionId = parseInt((await params).criterionId, 10);
  if (Number.isNaN(criterionId)) {
    return Response.json({ error: "Invalid criterion ID" }, { status: 400 });
  }

  let body: { label?: string; description?: string; maxPoints?: number; sortOrder?: number };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = await updateRubricCriterion(criterionId, body);
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 400 });
  }
  return Response.json({ ok: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; criterionId: string }> }
) {
  const { data: session } = await getSession();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getAdminRole(session.user.id);
  if (!role || !canManageChallenges(role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const criterionId = parseInt((await params).criterionId, 10);
  if (Number.isNaN(criterionId)) {
    return Response.json({ error: "Invalid criterion ID" }, { status: 400 });
  }

  const result = await deleteRubricCriterion(criterionId);
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 400 });
  }
  return Response.json({ ok: true });
}
