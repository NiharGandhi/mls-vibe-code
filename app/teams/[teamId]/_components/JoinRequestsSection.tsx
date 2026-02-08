"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type PendingRequest = {
  requestId: number;
  requesterUserId: string;
  requesterName: string;
  createdAt: string;
};

async function fetchPendingRequests(teamId: number): Promise<PendingRequest[]> {
  const res = await fetch(`/api/team/${teamId}/pending-join-requests`);
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export function JoinRequestsSection({ teamId }: { teamId: number }) {
  const queryClient = useQueryClient();
  const { data: requests, isLoading } = useQuery({
    queryKey: ["team", teamId, "pending-requests"],
    queryFn: () => fetchPendingRequests(teamId),
    enabled: !Number.isNaN(teamId),
  });

  const [acting, setActing] = useState<number | null>(null);

  async function handleRespond(requestId: number, action: "accept" | "reject") {
    setActing(requestId);
    try {
      const res = await fetch(`/api/join-request/${requestId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error ?? `Failed to ${action} request.`);
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["team", teamId] });
      await queryClient.invalidateQueries({ queryKey: ["team", teamId, "pending-requests"] });
    } finally {
      setActing(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner className="size-4" />
        Loading requests…
      </div>
    );
  }

  if (!requests?.length) {
    return (
      <p className="text-sm text-muted-foreground">No pending join requests.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {requests.map((r) => (
        <li
          key={r.requestId}
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 px-4 py-3"
        >
          <div>
            <p className="font-medium text-foreground">{r.requesterName}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(r.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={acting === r.requestId}
              onClick={() => handleRespond(r.requestId, "accept")}
            >
              {acting === r.requestId ? "…" : "Accept"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={acting === r.requestId}
              onClick={() => handleRespond(r.requestId, "reject")}
            >
              Reject
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
