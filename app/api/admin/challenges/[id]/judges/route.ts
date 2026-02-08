import { getSession } from "@/lib/auth/server";
import { getAdminRole, canManageChallenges } from "@/lib/admin";
import { getJudgesForChallenge, addJudgeToChallenge, removeJudgeFromChallenge } from "@/lib/challenge-judges";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";
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

  const judges = await getJudgesForChallenge(id);
  return Response.json({ judges });
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

  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = body.email?.trim();
  if (!email) {
    return Response.json({ error: "email is required" }, { status: 400 });
  }

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    return Response.json({ error: "User not found with that email" }, { status: 404 });
  }

  const result = await addJudgeToChallenge(id, user.id);
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 400 });
  }
  return Response.json({ ok: true });
}

export async function DELETE(
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

  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  if (!userId) {
    return Response.json({ error: "userId query param is required" }, { status: 400 });
  }

  const result = await removeJudgeFromChallenge(id, userId);
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 400 });
  }
  return Response.json({ ok: true });
}
