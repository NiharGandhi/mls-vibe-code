import { getSession } from "@/lib/auth/server";
import { getAdminRole, canManageChallenges } from "@/lib/admin";
import {
  getRubricCriteriaByChallengeId,
  createRubricCriterion,
} from "@/lib/rubric";

export const dynamic = "force-dynamic";

export async function GET(
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

  const criteria = await getRubricCriteriaByChallengeId(id);
  return Response.json({ criteria });
}

export async function POST(
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

  let body: { label?: string; description?: string; maxPoints?: number; sortOrder?: number };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const label = body.label?.trim();
  if (!label) {
    return Response.json({ error: "label is required" }, { status: 400 });
  }

  const result = await createRubricCriterion(id, {
    label,
    description: body.description ?? null,
    maxPoints: body.maxPoints,
    sortOrder: body.sortOrder,
  });

  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 400 });
  }
  return Response.json({ id: result.id });
}
