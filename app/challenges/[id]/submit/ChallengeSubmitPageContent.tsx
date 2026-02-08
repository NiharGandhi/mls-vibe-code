"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChallengeSubmissionForm } from "../ChallengeSubmissionForm";
import { SubmissionReadOnlyView } from "./SubmissionReadOnlyView";

interface ChallengeSubmitPageContentProps {
  challenge: {
    id: number;
    title: string;
    submissionTypes: string[];
    submissionTypeConfig: Record<string, { label?: string; description?: string }> | null;
  };
  teamId: number;
  teamName: string;
  isOwner: boolean;
}

export function ChallengeSubmitPageContent({
  challenge,
  teamId,
  teamName,
  isOwner,
}: ChallengeSubmitPageContentProps) {
  return (
    <>
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Team submission
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {teamName}
          {isOwner
            ? " — You can submit and update your team’s submission."
            : " — You can view the submission. Only the team owner can submit or update it."}
        </p>
      </header>

      {isOwner ? (
        <ChallengeSubmissionForm
          challengeId={challenge.id}
          teamId={teamId}
          submissionTypes={challenge.submissionTypes.length ? challenge.submissionTypes : null}
          submissionTypeConfig={challenge.submissionTypeConfig ?? null}
        />
      ) : (
        <SubmissionReadOnlyView challengeId={challenge.id} teamId={teamId} teamName={teamName} />
      )}
    </>
  );
}
