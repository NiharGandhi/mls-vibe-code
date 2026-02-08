import { getSession } from "@/lib/auth/server";
import { getTeamsForUser, createTeamForUser } from "@/lib/team";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data: session } = await getSession();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const teams = await getTeamsForUser(session.user.id);
    return Response.json({ teams });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load teams";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { data: session } = await getSession();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: string; description?: string | null };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = await createTeamForUser(session.user.id, {
    name: body.name ?? "",
    description: body.description ?? null,
  });

  if ("error" in result) {
    return Response.json({ ok: false, error: result.error }, { status: 400 });
  }

  return Response.json({ ok: true, id: result.id });
}
