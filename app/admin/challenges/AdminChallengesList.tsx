"use client";

import type { Challenge } from "@/lib/challenge";
import { formatDateInDubai } from "@/lib/datetime-dubai";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AdminChallengesListProps {
  challenges: Challenge[];
}

const statusConfig = {
  running: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  upcoming: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  finished: "bg-muted text-muted-foreground",
} as const;

export function AdminChallengesList({ challenges }: AdminChallengesListProps) {
  if (challenges.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
        <p className="text-muted-foreground">No challenges yet. Create one to get started.</p>
        <Link
          href="/admin/challenges/new"
          className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
        >
          Create challenge
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 font-medium text-foreground">Title</th>
            <th className="px-4 py-3 font-medium text-foreground">Status</th>
            <th className="px-4 py-3 font-medium text-foreground">Dates</th>
            <th className="px-4 py-3 font-medium text-foreground">Team size</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {challenges.map((c) => (
            <tr key={c.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3">
                <Link
                  href={`/admin/challenges/${c.id}/edit`}
                  className="font-medium text-foreground hover:underline"
                >
                  {c.title}
                </Link>
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                    statusConfig[c.status]
                  )}
                >
                  {c.status}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {c.startAt
                  ? formatDateInDubai(c.startAt)
                  : "—"}
                {c.endAt && ` – ${formatDateInDubai(c.endAt)}`}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {c.minTeamSize ?? 1}–{c.maxTeamSize ?? "∞"}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/challenges/${c.id}/edit`}
                  className="text-primary hover:underline"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
