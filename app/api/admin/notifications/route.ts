import { getSession } from "@/lib/auth/server";
import { getAdminRole, canSendNotifications } from "@/lib/admin";
import {
  broadcastToAllUsers,
  broadcastRegardingChallenge,
} from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { data: session } = await getSession();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getAdminRole(session.user.id);
  if (!role || !canSendNotifications(role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: {
    mode: "all" | "challenge";
    challengeId?: number;
    audience?: "all" | "participants";
    title: string;
    body?: string | null;
    priority?: "low" | "normal" | "high";
    urgency?: "info" | "warning" | "critical";
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = body.title?.trim();
  if (!title || title.length > 200) {
    return Response.json({ error: "Title is required (max 200 characters)." }, { status: 400 });
  }

  if (body.mode === "all") {
    const result = await broadcastToAllUsers({
      title,
      body: body.body?.trim() || null,
      priority: body.priority ?? "normal",
      urgency: body.urgency ?? "info",
    });
    return Response.json({ ok: true, count: result.count });
  }

  if (body.mode === "challenge") {
    const challengeId = body.challengeId;
    if (typeof challengeId !== "number" || challengeId < 1) {
      return Response.json({ error: "Valid challengeId is required for challenge mode." }, { status: 400 });
    }
    const audience = body.audience === "participants" ? "participants" : "all";
    const result = await broadcastRegardingChallenge({
      challengeId,
      title,
      body: body.body?.trim() || null,
      priority: body.priority ?? "normal",
      urgency: body.urgency ?? "info",
      audience,
    });
    return Response.json({ ok: true, count: result.count });
  }

  return Response.json({ error: "Invalid mode. Use 'all' or 'challenge'." }, { status: 400 });
}
