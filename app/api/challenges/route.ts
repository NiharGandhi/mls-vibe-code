import { getSession } from "@/lib/auth/server";
import { getAllChallenges } from "@/lib/challenge";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data: session } = await getSession();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const challenges = await getAllChallenges();
    return Response.json({ challenges });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load challenges";
    return Response.json({ error: message }, { status: 500 });
  }
}
