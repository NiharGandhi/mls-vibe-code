import { getSession } from "@/lib/auth/server";
import { getAdminRole, canManageChallenges } from "@/lib/admin";
import { db, challenges } from "@/db";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getJudgesForChallenge } from "@/lib/challenge-judges";
import { getRubricCriteriaByChallengeId } from "@/lib/rubric";
import { utcToDubaiInputValue } from "@/lib/datetime-dubai";
import { EditChallengeForm } from "./EditChallengeForm";

export default async function EditChallengePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session } = await getSession();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const role = await getAdminRole(session.user.id);
  if (!role || !canManageChallenges(role)) redirect("/admin");

  const id = parseInt((await params).id, 10);
  if (Number.isNaN(id)) redirect("/admin/challenges");

  const [challenge] = await db.select().from(challenges).where(eq(challenges.id, id));
  if (!challenge) redirect("/admin/challenges");

  const challengeData = {
    id: challenge.id,
    title: challenge.title,
    description: challenge.description,
    rules: challenge.rules,
    evaluationCriteria: challenge.evaluationCriteria,
    status: challenge.status,
    minTeamSize: challenge.minTeamSize,
    maxTeamSize: challenge.maxTeamSize,
    maxTeams: challenge.maxTeams,
    startAt: utcToDubaiInputValue(challenge.startAt),
    endAt: utcToDubaiInputValue(challenge.endAt),
    submissionDeadline: utcToDubaiInputValue(challenge.submissionDeadline),
    submissionTypes: Array.isArray(challenge.submissionTypes) ? challenge.submissionTypes : [],
    submissionTypeConfig:
      challenge.submissionTypeConfig && typeof challenge.submissionTypeConfig === "object"
        ? challenge.submissionTypeConfig
        : {},
    scoresReleasedAt: challenge.scoresReleasedAt
      ? challenge.scoresReleasedAt instanceof Date
        ? challenge.scoresReleasedAt.toISOString()
        : String(challenge.scoresReleasedAt)
      : null,
  };

  const judges = await getJudgesForChallenge(id);
  const rubricCriteria = await getRubricCriteriaByChallengeId(id);

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Edit challenge
        </h1>
        <p className="mt-1 text-muted-foreground">{challenge.title}</p>
      </header>

      <EditChallengeForm
        challenge={challengeData}
        judges={judges}
        rubricCriteria={rubricCriteria}
      />
    </div>
  );
}
