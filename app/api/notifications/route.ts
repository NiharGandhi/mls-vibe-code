import { getSession } from "@/lib/auth/server";
import { getNotificationsForUser } from "@/lib/notifications";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data: session } = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await getNotificationsForUser(session.user.id);
  return NextResponse.json(notifications);
}
