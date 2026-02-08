"use client";

import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User, Settings, LogOut } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import { cn } from "@/lib/utils";

async function fetchProfile(): Promise<{ profile: { imageUrl?: string | null } }> {
  const res = await fetch("/api/account/profile");
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { data: profileData } = useQuery({
    queryKey: ["account-profile"],
    queryFn: fetchProfile,
    enabled: !!session?.user,
  });

  const imageUrl = profileData?.profile?.imageUrl ?? null;

  if (isPending) {
    return (
      <div className="flex size-9 items-center justify-center rounded-full bg-muted">
        <User className="size-5 text-muted-foreground" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <Button variant="outline" size="sm" asChild>
        <Link href="/auth/sign-in">Sign in</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted ring-offset-background transition-shadow hover:ring-2 hover:ring-ring hover:ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Account menu"
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <User className="size-5 text-muted-foreground" />
          )}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-40 overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          align="end"
          sideOffset={6}
        >
          <DropdownMenu.Item asChild>
            <Link
              href="/account/settings"
              className={cn(
                "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
              )}
            >
              <Settings className="size-4" />
              Settings
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={async (e) => {
              e.preventDefault();
              await signOut();
              router.push("/");
            }}
            className={cn(
              "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
            )}
          >
            <LogOut className="size-4" />
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
