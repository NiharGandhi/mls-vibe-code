"use client";

import type { AdminTeam } from "@/lib/admin-teams";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface AdminTeamsListProps {
  teams: AdminTeam[];
}

const statusConfig = {
  open: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  closed: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  disqualified: "bg-destructive/15 text-destructive",
} as const;

export function AdminTeamsList({ teams }: AdminTeamsListProps) {
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  async function handleStatusChange(teamId: number, status: "open" | "closed" | "disqualified") {
    setUpdatingId(teamId);
    try {
      const res = await fetch(`/api/admin/teams/${teamId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) router.refresh();
    } finally {
      setUpdatingId(null);
    }
  }

  if (teams.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
        <p className="text-muted-foreground">No teams yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 font-medium text-foreground">Team</th>
            <th className="px-4 py-3 font-medium text-foreground">Owner</th>
            <th className="px-4 py-3 font-medium text-foreground">Status</th>
            <th className="px-4 py-3 font-medium text-foreground">Members</th>
            <th className="px-4 py-3 font-medium text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((t) => (
            <tr key={t.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3">
                <span className="font-medium text-foreground">{t.name}</span>
                {t.description && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                    {t.description}
                  </p>
                )}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{t.ownerName}</td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                    statusConfig[t.status as keyof typeof statusConfig] ?? "bg-muted text-muted-foreground"
                  )}
                >
                  {t.status}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {t.memberCount}
                {t.maxMembers != null ? ` / ${t.maxMembers}` : ""}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {(["open", "closed", "disqualified"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={updatingId === t.id || t.status === s}
                      onClick={() => handleStatusChange(t.id, s)}
                      className={cn(
                        "rounded px-2 py-1 text-xs font-medium transition-colors",
                        t.status === s
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-50"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
