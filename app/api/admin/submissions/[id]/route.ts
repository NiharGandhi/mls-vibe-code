import { getSession } from "@/lib/auth/server";
import { getAdminRole, canJudgeSubmissions } from "@/lib/admin";
import { updateSubmission } from "@/lib/admin-submissions";

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
  if (!role || !canJudgeSubmissions(role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = parseInt((await params).id, 10);
  if (Number.isNaN(id)) {
    return Response.json({ error: "Invalid submission ID" }, { status: 400 });
  }

  let body: { status?: string; score?: number | null; feedback?: string | null };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validStatuses = ["pending", "needs_review", "accepted", "rejected"];
  if (body.status != null && !validStatuses.includes(body.status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }

  const result = await updateSubmission(id, {
    status: body.status,
    score: body.score,
    feedback: body.feedback,
  });

  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json({ ok: true });
}
