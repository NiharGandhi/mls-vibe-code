"use client";

import { authClient } from "@/lib/auth-client";
import type { Challenge } from "@/lib/challenge";
import { useQuery } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { DashboardHeader } from "@/app/dashboard/_components/DashboardHeader";
import ChallengeCard from "./_components/ChallengeCard";
import { EmptyChallengesState } from "./_components/EmptyChallengesState";
import { cn } from "@/lib/utils";

async function fetchChallenges(): Promise<Challenge[]> {
  const res = await fetch("/api/challenges");
  if (!res.ok) throw new Error("Failed to fetch challenges");
  const json = await res.json();
  return json.challenges ?? [];
}

const STATUS_FILTERS = [
  { value: "all" as const, label: "All" },
  { value: "running" as const, label: "Live" },
  { value: "upcoming" as const, label: "Upcoming" },
  { value: "finished" as const, label: "Finished" },
] as const;

export default function ChallengesPage() {
  const { data: session } = authClient.useSession();
  const [statusFilter, setStatusFilter] = useState<"all" | "running" | "upcoming" | "finished">("all");

  const { data: challenges, isLoading } = useQuery({
    queryKey: ["challenges"],
    queryFn: fetchChallenges,
  });

  if (session === undefined) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-4 py-16">
        <Spinner className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const filtered =
    statusFilter === "all"
      ? challenges ?? []
      : (challenges ?? []).filter((c) => c.status === statusFilter);

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <DashboardHeader
        title="Challenges"
        subtitle="Explore and join challenges to compete with your team"
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <Spinner className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading challenges…</p>
        </div>
      ) : (
        <>
          {(challenges?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-2 border-b border-border pb-4">
              {STATUS_FILTERS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value)}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    statusFilter === value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <EmptyChallengesState />
          ) : (
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {filtered.map((challenge) => (
                <li key={challenge.id}>
                  <ChallengeCard challenge={challenge} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
