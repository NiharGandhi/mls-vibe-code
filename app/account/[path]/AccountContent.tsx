"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

type User = { name?: string | null; email?: string | null; image?: string | null };

export function AccountContent({ user }: { user: User }) {
  const router = useRouter();
  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-2xl font-semibold">Account</h1>
      <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
        <dl className="space-y-2">
          <div>
            <dt className="text-sm text-muted-foreground">Name</dt>
            <dd className="font-medium">{user.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Email</dt>
            <dd className="font-medium">{user.email ?? "—"}</dd>
          </div>
        </dl>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" asChild>
          <Link href="/account/settings">Settings</Link>
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            await signOut();
            router.push("/");
          }}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
