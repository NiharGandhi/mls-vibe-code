import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { db, challenges } from "@/db";
import { eq } from "drizzle-orm";
import { ChallengeDetailContent } from "./ChallengeDetailContent";
import { getTeamsOwnedByUser, getTeamForUserInChallenge } from "@/lib/team";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ChallengeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string }>;
}) {
  const message = (await searchParams).message;
  const { data: session } = await getSession();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const id = parseInt((await params).id, 10);
  if (Number.isNaN(id)) {
    redirect("/challenges");
  }

  const [challenge] = await db
    .select()
    .from(challenges)
    .where(eq(challenges.id, id));

  if (!challenge) {
    redirect("/challenges");
  }

  const ownedTeams = await getTeamsOwnedByUser(session.user.id);
  const ownedTeam = ownedTeams.length === 1 ? ownedTeams[0] : null;
  /** User's team in this challenge (any member). Used for "View submission" link. */
  const userTeamInChallenge = await getTeamForUserInChallenge(session.user.id, id);

  const challengeData = {
    id: challenge.id,
    title: challenge.title,
    description: challenge.description,
    rules: challenge.rules,
    evaluationCriteria: challenge.evaluationCriteria,
    status: challenge.status,
    minTeamSize: challenge.minTeamSize,
    maxTeamSize: challenge.maxTeamSize,
    startAt: challenge.startAt
      ? challenge.startAt instanceof Date
        ? challenge.startAt.toISOString()
        : String(challenge.startAt)
      : null,
    endAt: challenge.endAt
      ? challenge.endAt instanceof Date
        ? challenge.endAt.toISOString()
        : String(challenge.endAt)
      : null,
    submissionDeadline: challenge.submissionDeadline
      ? challenge.submissionDeadline instanceof Date
        ? challenge.submissionDeadline.toISOString()
        : String(challenge.submissionDeadline)
      : null,
    submissionTypes: Array.isArray(challenge.submissionTypes) ? challenge.submissionTypes : [],
    submissionTypeConfig:
      challenge.submissionTypeConfig && typeof challenge.submissionTypeConfig === "object"
        ? challenge.submissionTypeConfig
        : null,
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6">
      <Link
        href="/challenges"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to challenges
      </Link>
      <ChallengeDetailContent challenge={challengeData} ownedTeam={ownedTeam} userTeamInChallenge={userTeamInChallenge} message={message} />
    </div>
  );
}
