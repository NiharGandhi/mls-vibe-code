import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, Users } from "lucide-react";
import Link from "next/link";

interface EmptyTeamsCardProps {
  onCreateTeam?: () => void;
  canCreateTeam: boolean;
}

/** Empty state in the same card chrome as NotificationsList / MyTeamCard for identical height and look. */
export function EmptyTeamsCard({
  onCreateTeam,
  canCreateTeam,
}: EmptyTeamsCardProps) {
  return (
    <div className="flex min-h-[440px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Header - same as notification card */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold text-foreground">Your team</h2>
        {canCreateTeam && (
          <Button size="sm" onClick={onCreateTeam}>
            Create team
          </Button>
        )}
      </div>

      {/* Tabs strip - same height as notification tabs */}
      <div className="flex border-b border-border px-5">
        <span className="border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground">
          Members
        </span>
      </div>

      {/* Content - same min-h as notification card */}
      <div className="flex min-h-[280px] flex-1 flex-col items-center justify-center py-16 text-center">
        <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
          <Users className="size-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">
          {canCreateTeam ? "No team yet" : "No teams"}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {canCreateTeam
            ? "Create a team to collaborate on challenges."
            : "You're not in any teams."}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {canCreateTeam && onCreateTeam && (
            <Button size="sm" variant="outline" onClick={onCreateTeam} className="gap-1.5">
              <Plus className="size-3.5" />
              Create team
            </Button>
          )}
          <Button size="sm" variant="outline" asChild className="gap-1.5">
            <Link href="/teams">
              Browse teams
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer - same as other cards */}
      <div className="flex justify-center border-t border-border py-3">
        <Link
          href="/teams"
          className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          View all teams
        </Link>
      </div>
    </div>
  );
}
