"use client";

import { authClient } from "@/lib/auth-client";
import type { TeamWithRole } from "@/lib/team";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import TeamCard from "./_components/TeamCard";
import { EmptyTeamsListState } from "./_components/EmptyTeamsListState";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";

async function fetchAllTeams(): Promise<TeamWithRole[]> {
  const res = await fetch("/api/all-teams");
  if (!res.ok) throw new Error("Failed to fetch teams");
  const json = await res.json();
  return json.teams ?? [];
}

const TeamsPage = () => {
  const { data } = authClient.useSession();
  const queryClient = useQueryClient();
  const [requestingTeamId, setRequestingTeamId] = useState<number | null>(null);

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ["all-teams"],
    queryFn: fetchAllTeams,
  });

  const onRequestJoin = async (teamId: number) => {
    setRequestingTeamId(teamId);
    try {
      const res = await fetch(`/api/team/${teamId}/join`, { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (res.ok && !json.error) {
        await queryClient.invalidateQueries({ queryKey: ["all-teams"] });
      }
    } finally {
      setRequestingTeamId(null);
    }
  };

  if (data === undefined) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-4 py-16">
        <Spinner className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!data?.user) {
    return <div className="mx-auto max-w-5xl p-6">Please sign in to view teams.</div>;
  }

  if (teamsLoading) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-4 py-16">
        <Spinner className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading teams…</p>
      </div>
    );
  }

  const hasTeams = (teams?.length ?? 0) > 0;

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Teams</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse and join teams to compete in challenges together.
        </p>
      </div>
      {hasTeams ? (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams?.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onRequestJoin={onRequestJoin}
              isRequesting={requestingTeamId === team.id}
            />
          ))}
        </ul>
      ) : (
        <EmptyTeamsListState />
      )}
    </div>
  );
};

export default TeamsPage;