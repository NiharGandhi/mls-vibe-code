import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import type { TeamWithRole } from "@/lib/team";
import Link from "next/link";

interface TeamCardProps {
  team: TeamWithRole;
  onRequestJoin: (teamId: number) => void;
  isRequesting?: boolean;
}

export default function TeamCard({ team, onRequestJoin, isRequesting }: TeamCardProps) {
  const status = team.joinRequestStatus ?? "none";
  const isMember = status === "member";
  const isPending = status === "pending";

  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="gap-1 pb-2">
        <CardTitle className="text-base font-semibold tracking-tight text-card-foreground">
          <Link href={`/teams/${team.id}`} className="hover:underline">
            {team.name}
          </Link>
        </CardTitle>
        <CardAction>
          {isMember ? (
            <span className="rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
              Member
            </span>
          ) : isPending ? (
            <span className="rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
              Requested
            </span>
          ) : (
            <button
              type="button"
              disabled={isRequesting}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-60"
              onClick={() => onRequestJoin(team.id)}
            >
              {isRequesting ? "Requesting…" : "Request to join"}
            </button>
          )}
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 pt-0">
        {team.description ? (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {team.description}
          </p>
        ) : (
          <p className="text-sm italic text-muted-foreground">No description</p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-muted px-2 py-0.5 font-medium capitalize text-muted-foreground">
            {team.status}
          </span>
          <span>
            {team.memberCount ?? 0}
            {team.maxMembers != null ? ` / ${team.maxMembers}` : ""} members
          </span>
        </div>
      </CardContent>
    </Card>
  );
}