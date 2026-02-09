"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/AppSidebar";
import { UserMenu } from "@/components/UserMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RouteProgressBar } from "@/components/RouteProgressBar";
import { cn } from "@/lib/utils";

function shouldShowSidebar(pathname: string): boolean {
  if (pathname === "/") return false;
  if (pathname.startsWith("/auth")) return false;
  return true;
}

export function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const showSidebar = shouldShowSidebar(pathname ?? "/");

  if (!showSidebar) {
    return (
      <>
        <RouteProgressBar />
        {children}
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <RouteProgressBar />
      <AppSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div
        className={cn(
          "flex flex-1 flex-col min-h-screen transition-[margin] lg:ml-0",
          "lg:pl-64"
        )}
      >
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background px-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
          <div className="flex-1" />
          <ThemeToggle />
          <UserMenu />
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
