import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { getAppProfile } from "@/lib/auth/sync-user";
import { SettingsContent } from "./SettingsContent";

export const metadata = {
  title: "Settings",
  description: "Manage your account and profile",
};

export default async function SettingsPage() {
  const { data: session } = await getSession();
  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const { profile } = await getAppProfile();
  const initialProfile = profile
    ? {
        name: profile.name,
        email: profile.email,
        imageUrl: profile.imageUrl ?? undefined,
        yearOfStudy: profile.yearOfStudy ?? undefined,
        majorOfStudy: profile.majorOfStudy ?? undefined,
        dob: profile.dob ?? undefined,
      }
    : undefined;

  return (
    <main className="container mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Settings
      </h1>
      <SettingsContent
        user={{ id: session.user.id, name: session.user.name ?? undefined, email: session.user.email ?? undefined }}
        initialProfile={initialProfile}
      />
    </main>
  );
}
