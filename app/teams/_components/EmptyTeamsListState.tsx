import { Button } from "@/components/ui/button";
import { Users, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

export function EmptyTeamsListState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-orange-500/20 bg-gradient-to-b from-orange-500/5 to-transparent px-6 py-16 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
        <Users className="size-8" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-foreground">
        No teams yet
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        There are no teams in the system. Create your first team to get started and invite others to join.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
        <Button size="sm" className="gap-2" asChild>
          <Link href="/dashboard">
            <Plus className="size-4" />
            Create team
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild className="gap-2">
          <Link href="/dashboard">
            Go to dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
