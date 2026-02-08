import { getSession } from "@/lib/auth/server";
import { db, notifications } from "@/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { data: session } = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number((await params).id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid notification ID" }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  if (body.isRead !== true && body.read !== true) {
    return NextResponse.json(
      { error: "Send { \"isRead\": true } or { \"read\": true } to mark as read." },
      { status: 400 }
    );
  }

  const [row] = await db
    .select({ userId: notifications.userId })
    .from(notifications)
    .where(eq(notifications.id, id));
  if (!row) {
    return NextResponse.json({ error: "Notification not found." }, { status: 404 });
  }
  if (row.userId !== session.user.id) {
    return NextResponse.json({ error: "Not allowed to update this notification." }, { status: 403 });
  }

  const now = new Date();
  await db
    .update(notifications)
    .set({ isRead: true, readAt: now })
    .where(eq(notifications.id, id));

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { data: session } = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number((await params).id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid notification ID" }, { status: 400 });
  }

  const { deleteNotification } = await import("@/lib/notifications");
  const result = await deleteNotification(id, session.user.id);

  if ("error" in result) {
    return NextResponse.json(
      { error: result.error },
      { status: result.error === "Notification not found." ? 404 : 403 }
    );
  }

  return NextResponse.json({ ok: true });
}
