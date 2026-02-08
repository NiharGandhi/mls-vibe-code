import { getSession } from "@/lib/auth/server";
import { getAllTeams } from "@/lib/team";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data: session } = await getSession();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const teams = await getAllTeams(session.user.id);
    return Response.json({ teams });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load teams";
    return Response.json({ error: message }, { status: 500 });
  }
}