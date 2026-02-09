"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MarkdownContent } from "@/components/MarkdownContent";
import type { Challenge } from "@/lib/challenge";
import { formatDateInDubai } from "@/lib/datetime-dubai";
import { Calendar, Users, Trophy } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ChallengeCardProps {
  challenge: Challenge;
}

const statusConfig = {
  running: {
    label: "Live",
    className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    dotClassName: "bg-emerald-500 animate-pulse",
  },
  upcoming: {
    label: "Upcoming",
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
    dotClassName: "bg-amber-500",
  },
  finished: {
    label: "Finished",
    className: "bg-muted text-muted-foreground border-border",
    dotClassName: "bg-muted-foreground",
  },
} as const;

function formatTeamSize(min: number | null, max: number | null): string {
  if (min == null && max == null) return "Flexible";
  if (min != null && max != null) return `${min}–${max} members`;
  if (min != null) return `${min}+ members`;
  if (max != null) return `Up to ${max} members`;
  return "Flexible";
}

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
  const config = statusConfig[challenge.status];

  return (
    <Card className="group flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-border/80">
      <CardHeader className="gap-2 pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg font-semibold tracking-tight text-card-foreground leading-tight">
            <Link
              href={`/challenges/${challenge.id}`}
              className="hover:underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
            >
              {challenge.title}
            </Link>
          </CardTitle>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
              config.className
            )}
          >
            <span className={cn("size-1.5 rounded-full", config.dotClassName)} />
            {config.label}
          </span>
        </div>
        {challenge.description && (
          <div className="line-clamp-3 text-sm">
            <MarkdownContent
              content={challenge.description}
              className="text-muted-foreground [&_.markdown-content]:text-sm"
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 pt-0">
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          {(challenge.startAt || challenge.endAt) && (
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5 shrink-0" />
              {challenge.startAt && formatDateInDubai(challenge.startAt)}
              {challenge.startAt && challenge.endAt && " → "}
              {challenge.endAt && formatDateInDubai(challenge.endAt)}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5 shrink-0" />
            {formatTeamSize(challenge.minTeamSize, challenge.maxTeamSize)}
          </span>
        </div>
        <div className="mt-auto pt-2">
          <Link
            href={`/challenges/${challenge.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline underline-offset-4"
          >
            View details
            <Trophy className="size-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
