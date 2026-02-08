"use client";

import { authClient } from "@/lib/auth-client";
import type { TeamWithRole } from "@/lib/team";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { JoinRequestsSection } from "./_components/JoinRequestsSection";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

async function fetchTeam(teamId: number): Promise<TeamWithRole | null> {
  const res = await fetch(`/api/team/${teamId}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch team");
  return res.json();
}

export default function TeamDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = Number(params.teamId);
  const { data } = authClient.useSession();
  const queryClient = useQueryClient();
  const [requesting, setRequesting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data: team, isLoading } = useQuery({
    queryKey: ["team", teamId],
    queryFn: () => fetchTeam(teamId),
    enabled: !Number.isNaN(teamId),
  });

  const onRequestJoin = async () => {
    setRequesting(true);
    try {
      const res = await fetch(`/api/team/${teamId}/join`, { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (res.ok && !json.error) {
        await queryClient.invalidateQueries({ queryKey: ["team", teamId] });
        await queryClient.invalidateQueries({ queryKey: ["all-teams"] });
      }
    } finally {
      setRequesting(false);
    }
  };

  if (Number.isNaN(teamId)) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <p className="text-muted-foreground">Invalid team.</p>
        <Link href="/teams" className="text-primary hover:underline">
          Back to teams
        </Link>
      </div>
    );
  }

  if (data === undefined || isLoading) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <p className="text-muted-foreground">Team not found.</p>
        <Link href="/teams" className="text-primary hover:underline">
          Back to teams
        </Link>
      </div>
    );
  }

  const status = team.joinRequestStatus ?? "none";
  const isMember = status === "member";
  const isPending = status === "pending";

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link
          href="/teams"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Teams
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-card-foreground">
          {team.name}
        </h1>
        {team.description ? (
          <p className="mt-2 text-muted-foreground">{team.description}</p>
        ) : (
          <p className="mt-2 italic text-muted-foreground">No description</p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="rounded-full bg-muted px-2 py-0.5 font-medium capitalize">
            {team.status}
          </span>
          <span>
            {team.memberCount ?? 0}
            {team.maxMembers != null ? ` / ${team.maxMembers}` : ""} members
          </span>
        </div>

        {data?.user && (
          <div className="mt-6">
            {isMember ? (
              <span className="inline-block rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
                You are a member
              </span>
            ) : isPending ? (
              <span className="inline-block rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
                Request pending
              </span>
            ) : (
              <button
                type="button"
                disabled={requesting}
                onClick={onRequestJoin}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
              >
                {requesting ? "Requesting…" : "Request to join"}
              </button>
            )}
          </div>
        )}
      </div>

      {team.isOwner && (
        <>
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight text-card-foreground">
              Requests
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Pending join requests for this team.
            </p>
            <div className="mt-4">
              <JoinRequestsSection teamId={teamId} />
            </div>
          </div>

          <div className="rounded-xl border border-destructive/30 bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight text-destructive">
              Danger zone
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Deleting this team will remove all members, join requests, and any submissions linked to it. This cannot be undone.
            </p>
            <Button
              type="button"
              variant="destructive"
              className="mt-4"
              disabled={deleting}
              onClick={async () => {
                if (
                  !confirm(
                    "Are you sure you want to delete this team? All members, requests, and linked data will be removed. This cannot be undone."
                  )
                )
                  return;
                setDeleting(true);
                try {
                  const res = await fetch(`/api/team/${teamId}`, {
                    method: "DELETE",
                  });
                  const json = await res.json().catch(() => ({}));
                  if (!res.ok) {
                    alert(json.error ?? "Failed to delete team.");
                    return;
                  }
                  await queryClient.invalidateQueries({ queryKey: ["all-teams"] });
                  router.push("/teams");
                  router.refresh();
                } finally {
                  setDeleting(false);
                }
              }}
            >
              {deleting ? "Deleting…" : "Delete team"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
