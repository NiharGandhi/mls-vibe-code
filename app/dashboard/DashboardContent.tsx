"use client";

import { authClient } from "@/lib/auth-client";
import type { TeamWithRole } from "@/lib/team";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "./_components/DashboardHeader";
import { MyTeamCard } from "./_components/MyTeamCard";
import { EmptyTeamsCard } from "./_components/EmptyTeamsCard";
import { NotificationsList } from "./_components/NotificationsList";
import { CreateTeamModal } from "./_components/CreateTeamModal";

export function DashboardContent({
  teams,
  userName,
  currentUserId,
}: {
  teams: TeamWithRole[];
  userName: string | null;
  currentUserId: string;
}) {
  const { data } = authClient.useSession();
  const router = useRouter();
  const userId = data?.user?.id ?? currentUserId;
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const canCreateTeam = teams.length === 0;

  async function handleCreateTeam(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreateError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = (formData.get("name") as string)?.trim();
    const description = (formData.get("description") as string)?.trim() || undefined;
    if (!name) {
      setCreateError("Team name is required.");
      return;
    }
    setCreateLoading(true);
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    const dataRes = await res.json().catch(() => ({}));
    setCreateLoading(false);
    if (!res.ok) {
      setCreateError(dataRes.error ?? "Failed to create team.");
      return;
    }
    if (dataRes.error) {
      setCreateError(dataRes.error);
      return;
    }
    setCreateOpen(false);
    form.reset();
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10 p-6">
      <DashboardHeader
        title="Dashboard"
        subtitle={`Welcome back, ${userName ?? "there"}`}
      />

      <div className="grid gap-10 lg:grid-cols-2 lg:items-stretch">
        <section className="min-w-0 flex min-h-[440px] flex-col">
          {teams.length === 0 ? (
            <EmptyTeamsCard
              canCreateTeam={canCreateTeam}
              onCreateTeam={canCreateTeam ? () => setCreateOpen(true) : undefined}
            />
          ) : (
            <MyTeamCard
              team={teams[0]}
              currentUserId={userId}
              isOwner={teams[0].roleInTeam === "owner"}
            />
          )}
        </section>

        <section className="min-w-0 flex min-h-[440px] flex-col">
          <NotificationsList />
        </section>
      </div>

      <CreateTeamModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateTeam}
        loading={createLoading}
        error={createError}
      />
    </div>
  );
}
