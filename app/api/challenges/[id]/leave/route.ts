import { getSession } from "@/lib/auth/server";
import { leaveChallenge } from "@/lib/challenge";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { data: session } = await getSession();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { teamId?: number };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const teamId = body.teamId;
  if (typeof teamId !== "number" || teamId < 1) {
    return Response.json({ error: "Valid teamId is required" }, { status: 400 });
  }

  const result = await leaveChallenge(session.user.id, teamId);

  if ("error" in result) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json({ ok: true });
}
