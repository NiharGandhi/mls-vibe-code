"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Trophy, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateInDubai, formatDateTimeInDubai } from "@/lib/datetime-dubai";
import { MarkdownContent } from "@/components/MarkdownContent";
import Link from "next/link";
import { FileUp } from "lucide-react";
import type { TeamOwnedForChallenge, TeamInChallenge } from "@/lib/team";

interface ChallengeDetailContentProps {
  challenge: {
    id: number;
    title: string;
    description: string;
    rules: string | null;
    evaluationCriteria: string | null;
    status: string;
    minTeamSize: number | null;
    maxTeamSize: number | null;
    startAt: string | null;
    endAt: string | null;
    submissionDeadline: string | null;
    submissionTypes: string[];
    submissionTypeConfig: Record<string, { label?: string; description?: string }> | null;
  };
  ownedTeam: TeamOwnedForChallenge | null;
  /** User's team in this challenge (any member). Shown so all members can open the submission page. */
  userTeamInChallenge: TeamInChallenge | null;
  /** Optional message from URL (e.g. join-first after redirect from submit page). */
  message?: string;
}

const statusConfig = {
  running: {
    label: "Live",
    className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  },
  upcoming: {
    label: "Upcoming",
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  },
  finished: {
    label: "Finished",
    className: "bg-muted text-muted-foreground",
  },
} as const;

function formatTeamSize(min: number | null, max: number | null): string {
  if (min == null && max == null) return "Flexible";
  if (min != null && max != null) return `${min}–${max} members`;
  if (min != null) return `${min}+ members`;
  if (max != null) return `Up to ${max} members`;
  return "Flexible";
}

export function ChallengeDetailContent({ challenge, ownedTeam, userTeamInChallenge, message }: ChallengeDetailContentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const teamInChallenge = ownedTeam?.challengeId === challenge.id;
  const canJoin =
    (challenge.status === "upcoming" || challenge.status === "running") &&
    ownedTeam != null &&
    !teamInChallenge;

  async function handleJoin() {
    if (!ownedTeam) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/challenges/${challenge.id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: ownedTeam.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        router.refresh();
      } else {
        setError(data.error ?? "Failed to join challenge.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLeave() {
    if (!ownedTeam || !teamInChallenge) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/challenges/${challenge.id}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamId: ownedTeam.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        router.refresh();
      } else {
        setError(data.error ?? "Failed to leave challenge.");
      }
    } finally {
      setLoading(false);
    }
  }

  const config =
    statusConfig[challenge.status as keyof typeof statusConfig] ??
    statusConfig.finished;

  return (
    <div className="space-y-6">
      {message === "join-first" && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-800 dark:text-amber-200">
          Join a team and enroll in this challenge to open the submission page.
        </p>
      )}
      {(canJoin || teamInChallenge) && ownedTeam && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="size-5" />
              {teamInChallenge ? "Your team is registered" : "Join challenge"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {teamInChallenge ? (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{ownedTeam.name}</span> is
                  registered for this challenge.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLeave}
                  disabled={loading}
                >
                  {loading ? "Leaving…" : "Leave challenge"}
                </Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Join with <span className="font-medium text-foreground">{ownedTeam.name}</span>
                </p>
                <Button
                  onClick={handleJoin}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <UsersRound className="size-4" />
                  {loading ? "Joining…" : "Join challenge"}
                </Button>
              </>
            )}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </CardContent>
        </Card>
      )}

      {(challenge.status === "running" || challenge.status === "upcoming") && userTeamInChallenge && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your team&apos;s submission</CardTitle>
            <p className="text-sm text-muted-foreground">
              View or submit your team&apos;s work. All team members can see the submission page; only the team owner can submit or update.
            </p>
          </CardHeader>
          <CardContent>
            <Link
              href={`/challenges/${challenge.id}/submit`}
              className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <FileUp className="size-4" />
              View submission page
            </Link>
          </CardContent>
        </Card>
      )}

      <header>
        <div className="mb-3">
          <span
            className={cn(
              "inline-flex rounded-full px-3 py-1 text-xs font-medium",
              config.className
            )}
          >
            {config.label}
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {challenge.title}
        </h1>
        <div className="mt-4 flex flex-wrap gap-6 text-sm text-muted-foreground">
          {(challenge.startAt || challenge.endAt) && (
            <span className="flex items-center gap-2">
              <Calendar className="size-4" />
              {challenge.startAt && formatDateInDubai(challenge.startAt)}
              {challenge.startAt && challenge.endAt && " – "}
              {challenge.endAt && formatDateInDubai(challenge.endAt)}
            </span>
          )}
          <span className="flex items-center gap-2">
            <Users className="size-4" />
            {formatTeamSize(challenge.minTeamSize, challenge.maxTeamSize)}
          </span>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <MarkdownContent content={challenge.description} />
        </CardContent>
      </Card>

      {challenge.rules && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <MarkdownContent content={challenge.rules} />
          </CardContent>
        </Card>
      )}

      {challenge.evaluationCriteria && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Evaluation criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <MarkdownContent content={challenge.evaluationCriteria} />
          </CardContent>
        </Card>
      )}

      {challenge.submissionDeadline && challenge.status !== "finished" && (
        <p className="text-sm text-muted-foreground">
          Submission deadline (Dubai): {formatDateTimeInDubai(challenge.submissionDeadline)}
        </p>
      )}
    </div>
  );
}
