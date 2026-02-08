import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { db, challenges } from "@/db";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTeamForUserInChallenge } from "@/lib/team";
import { ChallengeSubmitPageContent } from "./ChallengeSubmitPageContent";

export default async function ChallengeSubmitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  const team = await getTeamForUserInChallenge(session.user.id, id);
  if (!team) {
    redirect(`/challenges/${id}?message=join-first`);
  }

  const challengeData = {
    id: challenge.id,
    title: challenge.title,
    submissionTypes: Array.isArray(challenge.submissionTypes) ? challenge.submissionTypes : [],
    submissionTypeConfig:
      challenge.submissionTypeConfig && typeof challenge.submissionTypeConfig === "object"
        ? challenge.submissionTypeConfig
        : null,
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <Link
        href={`/challenges/${id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to {challenge.title}
      </Link>

      <ChallengeSubmitPageContent
        challenge={challengeData}
        teamId={team.id}
        teamName={team.name}
        isOwner={team.isOwner}
      />
    </div>
  );
}
