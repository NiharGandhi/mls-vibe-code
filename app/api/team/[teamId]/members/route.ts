import { db, teamMembers, users } from "@/db";
import { eq, and, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const { teamId } = await params;
  const id = Number(teamId);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
  }
  const rows = await db
    .select({
      userId: users.id,
      name: users.name,
      email: users.email,
      yearOfStudy: users.yearOfStudy,
      majorOfStudy: users.majorOfStudy,
      roleInTeam: teamMembers.roleInTeam,
    })
    .from(teamMembers)
    .innerJoin(users, eq(users.id, teamMembers.userId))
    .where(
      and(eq(teamMembers.teamId, id), isNull(teamMembers.removedAt))
    );
  const members = rows.map((r) => ({
    userId: r.userId,
    name: r.name,
    email: r.email,
    yearOfStudy: r.yearOfStudy,
    majorOfStudy: r.majorOfStudy,
    roleInTeam: r.roleInTeam,
  }));
  return NextResponse.json(members);
}
