"use client";

import { Button } from "@/components/ui/button";
import type { TeamMemberProfile } from "@/lib/team";
import type { TeamWithRole } from "@/lib/team";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  ArrowUp,
  ArrowDown,
  Trash2,
  ChevronRight,
} from "lucide-react";

interface MyTeamCardProps {
  team: TeamWithRole;
  currentUserId: string | null;
  isOwner: boolean;
}

function MemberRow({
  member,
  isOwner,
  currentUserId,
  acting,
  onPromote,
  onDemote,
  onRemove,
}: {
  member: TeamMemberProfile;
  isOwner: boolean;
  currentUserId: string | null;
  acting: string | null;
  onPromote: () => void;
  onDemote: () => void;
  onRemove: () => void;
}) {
  const initials = member.name
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const meta = [
    member.yearOfStudy ? `${member.yearOfStudy} Year` : null,
    member.majorOfStudy ?? null,
  ]
    .filter(Boolean)
    .join(" · ");
  const canManage = isOwner && member.roleInTeam !== "owner" && member.userId !== currentUserId;

  return (
    <li className="group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/50">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
        {initials || "?"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground">{member.name}</p>
          <span className="text-xs text-muted-foreground capitalize">
            {member.roleInTeam}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {member.email}
        </p>
        {meta && (
          <p className="mt-0.5 text-xs text-muted-foreground/80">{meta}</p>
        )}
        {canManage && (
          <div className="mt-2 flex items-center gap-1">
            {member.roleInTeam !== "lead" ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs"
                disabled={!!acting}
                onClick={(e) => {
                  e.stopPropagation();
                  onPromote();
                }}
              >
                <ArrowUp className="size-3" />
                Lead
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs"
                disabled={!!acting}
                onClick={(e) => {
                  e.stopPropagation();
                  onDemote();
                }}
              >
                <ArrowDown className="size-3" />
                Member
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs text-muted-foreground hover:text-destructive"
              disabled={!!acting}
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <Trash2 className="size-3" />
              Remove
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}

export function MyTeamCard({ team, currentUserId, isOwner }: MyTeamCardProps) {
  const router = useRouter();
  const [members, setMembers] = useState<TeamMemberProfile[] | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const fetchMembers = useCallback(() => {
    fetch(`/api/team/${team.id}/members`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: TeamMemberProfile[]) => setMembers(data))
      .catch(() => setMembers([]));
  }, [team.id]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  async function handleRemove(memberUserId: string) {
    if (!currentUserId || memberUserId === currentUserId) return;
    setActing(`remove-${memberUserId}`);
    try {
      const res = await fetch(
        `/api/team/${team.id}/members/${encodeURIComponent(memberUserId)}`,
        { method: "DELETE" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error ?? "Failed to remove member");
        return;
      }
      fetchMembers();
      router.refresh();
    } finally {
      setActing(null);
    }
  }

  async function handleSetRole(memberUserId: string, newRole: "member" | "lead") {
    setActing(`role-${memberUserId}`);
    try {
      const res = await fetch(
        `/api/team/${team.id}/members/${encodeURIComponent(memberUserId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roleInTeam: newRole }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error ?? "Failed to update role");
        return;
      }
      fetchMembers();
      router.refresh();
    } finally {
      setActing(null);
    }
  }

  const memberCount = team.memberCount ?? 0;
  const maxMembers = team.maxMembers;
  const countLabel = maxMembers != null ? `${memberCount}/${maxMembers} members` : `${memberCount} members`;

  return (
    <div className="flex min-h-[440px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Header - same as notification card */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-foreground">
            {team.name}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {team.roleInTeam} · {countLabel}
            {team.status !== "active" && ` · ${team.status}`}
          </p>
        </div>
        <Link
          href={`/teams/${team.id}`}
          className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Open team"
        >
          <ChevronRight className="size-4" />
        </Link>
      </div>

      {/* Tabs strip - same as notification card (single "Members" tab) */}
      <div className="flex border-b border-border px-5">
        <span className="border-b-2 border-primary px-4 py-3 text-sm font-medium text-foreground">
          Members
        </span>
      </div>

      {/* Description (optional) - compact so height stays aligned */}
      {team.description && (
        <div className="border-b border-border px-5 py-2">
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {team.description}
          </p>
        </div>
      )}

      {/* Members list - same min-h as notification content */}
      <div className="min-h-[280px] flex-1">
        {members === null ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="size-6 animate-spin rounded-full border-2 border-border border-t-foreground/30" />
            <p className="text-sm text-muted-foreground">Loading members…</p>
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
              <Users className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No members yet</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Invite people from the team page
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/80">
            {members.map((m) => (
              <MemberRow
                key={m.userId}
                member={m}
                isOwner={isOwner}
                currentUserId={currentUserId}
                acting={acting}
                onPromote={() => handleSetRole(m.userId, "lead")}
                onDemote={() => handleSetRole(m.userId, "member")}
                onRemove={() => handleRemove(m.userId)}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-center border-t border-border py-3">
        <Link
          href={`/teams/${team.id}`}
          className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          View team
        </Link>
      </div>
    </div>
  );
}
