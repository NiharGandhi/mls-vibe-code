import { getSession } from "@/lib/auth/server";
import { getAdminRole } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data: session } = await getSession();
  if (!session?.user?.id) {
    return Response.json({ isAdmin: false, role: null });
  }

  const role = await getAdminRole(session.user.id);
  return Response.json({
    isAdmin: role != null,
    role,
  });
}
