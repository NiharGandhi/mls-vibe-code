"use client";

import { Trophy } from "lucide-react";

export function EmptyChallengesState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-8 py-16 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
        <Trophy className="size-7 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">
        No challenges yet
      </h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        Challenges will appear here once they&apos;re created. Check back later
        or contact the organizers.
      </p>
    </div>
  );
}
