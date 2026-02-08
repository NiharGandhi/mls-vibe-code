import { Button } from "@/components/ui/button";
import { Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

interface EmptyTeamsStateProps {
  onCreateTeam?: () => void;
  canCreateTeam: boolean;
}

export function EmptyTeamsState({ onCreateTeam, canCreateTeam }: EmptyTeamsStateProps) {
  return (
    <div className="py-10 text-center">
      <p className="text-sm font-medium text-foreground">
        {canCreateTeam ? "No team yet" : "No teams"}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {canCreateTeam
          ? "Create a team to collaborate on challenges."
          : "You're not in any teams."}
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {canCreateTeam && onCreateTeam && (
          <Button size="sm" onClick={onCreateTeam} className="gap-1.5">
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
  );
}
