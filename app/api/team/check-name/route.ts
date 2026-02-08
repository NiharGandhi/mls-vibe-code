import { getSession } from "@/lib/auth/server";
import { isTeamNameAvailable } from "@/lib/team";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { data: session } = await getSession();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name") ?? "";
  const available = await isTeamNameAvailable(name);
  return Response.json({ available });
}
