import { getSession } from "@/lib/auth/server";
import { db, teams, teamMembers } from "@/db";
import { eq, and, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ teamId: string; userId: string }> }
) {
  const { data: session } = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { teamId, userId: memberUserId } = await params;
  const teamIdNum = Number(teamId);
  if (Number.isNaN(teamIdNum) || !memberUserId) {
    return NextResponse.json({ error: "Invalid team or member" }, { status: 400 });
  }

  const [team] = await db.select().from(teams).where(eq(teams.id, teamIdNum));
  if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });
  if (team.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Only the team owner can remove members." }, { status: 403 });
  }
  if (memberUserId === session.user.id) {
    return NextResponse.json({ error: "You cannot remove yourself." }, { status: 400 });
  }

  await db
    .update(teamMembers)
    .set({ removedAt: new Date() })
    .where(
      and(eq(teamMembers.teamId, teamIdNum), eq(teamMembers.userId, memberUserId))
    );
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ teamId: string; userId: string }> }
) {
  const { data: session } = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { teamId, userId: memberUserId } = await params;
  const teamIdNum = Number(teamId);
  if (Number.isNaN(teamIdNum) || !memberUserId) {
    return NextResponse.json({ error: "Invalid team or member" }, { status: 400 });
  }

  let body: { roleInTeam?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const [team] = await db.select().from(teams).where(eq(teams.id, teamIdNum));
  if (!team) return NextResponse.json({ error: "Team not found." }, { status: 404 });
  if (team.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Only the team owner can change roles." }, { status: 403 });
  }
  if (memberUserId === team.ownerId) {
    return NextResponse.json({ error: "Cannot change the owner's role." }, { status: 400 });
  }

  const role = (body.roleInTeam ?? "member").trim().toLowerCase();
  if (role !== "member" && role !== "lead") {
    return NextResponse.json({ error: "Role must be 'member' or 'lead'." }, { status: 400 });
  }

  await db
    .update(teamMembers)
    .set({ roleInTeam: role })
    .where(
      and(eq(teamMembers.teamId, teamIdNum), eq(teamMembers.userId, memberUserId))
    );
  return NextResponse.json({ ok: true });
}
