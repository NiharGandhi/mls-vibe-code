"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Info,
  Megaphone,
  Users,
  AlertCircle,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Notification = {
  id: number;
  type: string;
  title: string;
  body: string | null;
  relatedEntityType: string | null;
  relatedEntityId: number | null;
  isRead: boolean;
  createdAt: string;
};

const typeConfig = {
  success: {
    icon: CheckCircle2,
    bg: "bg-emerald-100 dark:bg-emerald-500/20",
    iconClass: "text-emerald-600 dark:text-emerald-400",
  },
  team: {
    icon: Users,
    bg: "bg-orange-100 dark:bg-orange-500/20",
    iconClass: "text-orange-600 dark:text-orange-400",
  },
  info: {
    icon: Info,
    bg: "bg-sky-100 dark:bg-sky-500/20",
    iconClass: "text-sky-600 dark:text-sky-400",
  },
  announcement: {
    icon: Megaphone,
    bg: "bg-rose-100 dark:bg-rose-500/20",
    iconClass: "text-rose-600 dark:text-rose-400",
  },
  warning: {
    icon: AlertCircle,
    bg: "bg-amber-100 dark:bg-amber-500/20",
    iconClass: "text-amber-600 dark:text-amber-400",
  },
} as const;

function mapNotificationType(
  type: string
): keyof typeof typeConfig {
  switch (type) {
    case "invite_accepted":
    case "join_request_approved":
      return "success";
    case "join_request_received":
    case "invite_received":
      return "team";
    case "submission_feedback":
      return "info";
    case "system_announcement":
      return "announcement";
    default:
      return "info";
  }
}

function formatRelativeTime(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function getLink(n: Notification): { href: string; label: string } | null {
  if (
    (n.relatedEntityType === "team" || n.relatedEntityType === "challenge") &&
    n.relatedEntityId != null
  ) {
    return {
      href:
        n.relatedEntityType === "challenge"
          ? `/challenges/${n.relatedEntityId}`
          : `/teams/${n.relatedEntityId}`,
      label:
        n.relatedEntityType === "challenge"
          ? "View challenge"
          : "View team",
    };
  }
  return null;
}

export function NotificationsPageContent() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchNotifications = useCallback(() => {
    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Notification[]) => setNotifications(data))
      .catch(() => setNotifications([]));
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  async function markRead(id: number) {
    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    });
    fetchNotifications();
  }

  async function deleteNotification(id: number) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      if (res.ok) {
        setNotifications((prev) =>
          prev ? prev.filter((n) => n.id !== id) : []
        );
      }
    } finally {
      setDeletingId(null);
    }
  }

  function handleRowClick(n: Notification) {
    const link = getLink(n);
    if (!n.isRead) markRead(n.id);
    if (link) router.push(link.href);
  }

  if (notifications === null) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <Spinner className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading notifications…</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center">
        <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
          <Bell className="size-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">All caught up</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          You have no notifications.
        </p>
        <Link href="/dashboard" className="mt-4 text-sm font-medium text-primary hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {notifications.map((n) => {
        const type = mapNotificationType(n.type);
        const config = typeConfig[type];
        const Icon = config.icon;
        const link = getLink(n);

        return (
          <li
            key={n.id}
            className={cn(
              "flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-colors",
              link && "cursor-pointer hover:bg-muted/50"
            )}
            role={link ? "button" : undefined}
            tabIndex={link ? 0 : undefined}
            onClick={() => link && handleRowClick(n)}
            onKeyDown={(e) => {
              if (link && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                handleRowClick(n);
              }
            }}
          >
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full",
                config.bg,
                config.iconClass
              )}
            >
              <Icon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-sm",
                  n.isRead
                    ? "font-medium text-foreground/90"
                    : "font-semibold text-foreground"
                )}
              >
                {n.title}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatRelativeTime(n.createdAt)}
              </p>
              {n.body && (
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {n.body}
                </p>
              )}
              {link && (
                <Link
                  href={link.href}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    handleRowClick(n);
                  }}
                >
                  {link.label}
                  <ChevronRight className="size-3.5" />
                </Link>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {!n.isRead && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => markRead(n.id)}
                >
                  Mark read
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive"
                aria-label="Delete notification"
                disabled={deletingId === n.id}
                onClick={() => deleteNotification(n.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
