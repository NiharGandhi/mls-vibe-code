"use client";

import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Bell,
  Settings,
  CheckCircle2,
  Info,
  Megaphone,
  Users,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const POLL_INTERVAL_MS = 60_000;

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

type TabId = "all" | "team" | "feedback" | "announcements";

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
): "info" | "success" | "warning" | "team" | "announcement" {
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

function getContextLabel(
  relatedEntityType: string | null,
  relatedEntityId: number | null
): string {
  if (!relatedEntityType) return "";
  if (relatedEntityType === "team") return "Team";
  if (relatedEntityType === "challenge") return "Challenge";
  return relatedEntityType;
}

function matchesTab(notification: Notification, tab: TabId): boolean {
  const t = mapNotificationType(notification.type);
  if (tab === "all") return true;
  if (tab === "team") return t === "team" || t === "success";
  if (tab === "feedback") return t === "info";
  if (tab === "announcements") return t === "announcement";
  return true;
}

/** Single notification row with expandable body when longer than 2 lines */
function NotificationListItem({
  n,
  link,
  config,
  secondary,
  onItemClick,
  onMarkRead,
}: {
  n: Notification;
  link: { href: string; label: string } | null;
  config: (typeof typeConfig)["info" | "success" | "warning" | "team" | "announcement"];
  secondary: string;
  onItemClick: () => void;
  onMarkRead: () => void;
}) {
  const Icon = config.icon;
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const hasBody = Boolean(n.body);
  const likelyLong = (n.body?.length ?? 0) > 80;
  const showExpandControl = hasBody && (isTruncated || likelyLong || expanded);

  useLayoutEffect(() => {
    if (!n.body || expanded) {
      setIsTruncated(false);
      return;
    }
    const el = bodyRef.current;
    if (!el) return;
    setIsTruncated(el.scrollHeight > el.clientHeight);
  }, [n.body, expanded]);

  return (
    <li
      className={cn(
        "group flex items-start gap-4 px-5 py-4 transition-colors",
        link && "cursor-pointer hover:bg-muted/50"
      )}
      role={link ? "button" : undefined}
      tabIndex={link ? 0 : undefined}
      onClick={() => link && onItemClick()}
      onKeyDown={(e) => {
        if (link && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onItemClick();
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
        {secondary && (
          <p className="mt-0.5 text-xs text-muted-foreground">{secondary}</p>
        )}
        {n.body && (
          <p
            ref={bodyRef}
            className={cn(
              "mt-1 text-xs text-muted-foreground",
              expanded ? "whitespace-pre-wrap" : "line-clamp-2"
            )}
          >
            {n.body}
          </p>
        )}
        {showExpandControl && (
          <button
            type="button"
            className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((prev) => !prev);
            }}
          >
            {expanded ? (
              <>
                See less
                <ChevronUp className="size-3.5" />
              </>
            ) : (
              <>
                See more
                <ChevronDown className="size-3.5" />
              </>
            )}
          </button>
        )}
        <div
          className="mt-2 flex flex-wrap items-center gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          {!n.isRead && (
            <button
              type="button"
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => onMarkRead()}
            >
              Mark read
            </button>
          )}
          {link && (
            <Link
              href={link.href}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              onClick={(e) => {
                e.preventDefault();
                onItemClick();
              }}
            >
              {link.label}
              <ChevronRight className="size-3.5" />
            </Link>
          )}
        </div>
      </div>
    </li>
  );
}

export function NotificationsList() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("all");

  const fetchNotifications = useCallback(() => {
    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Notification[]) => setNotifications(data))
      .catch(() => setNotifications([]));
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    const onFocus = () => fetchNotifications();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchNotifications]);

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;
  const teamUnreadCount = notifications?.filter(
    (n) => !n.isRead && ["team", "success"].includes(mapNotificationType(n.type))
  ).length ?? 0;
  const filtered =
    notifications?.filter((n) => matchesTab(n, activeTab)) ?? [];

  async function markRead(id: number) {
    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    });
    fetchNotifications();
  }

  async function handleItemClick(
    n: Notification,
    link: { href: string; label: string } | null
  ) {
    if (!n.isRead) await markRead(n.id);
    if (link) router.push(link.href);
  }

  return (
    <div className="flex max-h-[70vh] min-h-[440px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold text-foreground">
          Notifications
        </h2>
        <button
          type="button"
          aria-label="Notification settings"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Settings className="size-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border px-5">
        {[
          { id: "all" as const, label: "All", badge: undefined as number | undefined },
          { id: "team" as const, label: "Team", badge: teamUnreadCount },
          { id: "feedback" as const, label: "Feedback", badge: undefined as number | undefined },
          { id: "announcements" as const, label: "Announcements", badge: undefined as number | undefined },
        ].map(({ id, label, badge }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              "relative flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
              activeTab === id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
            {badge != null && badge > 0 && (
              <span className="flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                {badge > 9 ? "9+" : badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content – scrollable when list is long */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {notifications === null ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Spinner className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted">
              <Bell className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {activeTab === "all" ? "All caught up" : "No notifications here"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {activeTab === "all"
                ? "No new notifications yet"
                : "Try another tab"}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/80">
            {filtered.map((n) => {
              const type = mapNotificationType(n.type);
              const config = typeConfig[type] ?? typeConfig.info;
              const Icon = config.icon;
              const link =
                (n.relatedEntityType === "team" ||
                  n.relatedEntityType === "challenge") &&
                n.relatedEntityId != null
                  ? {
                      href:
                        n.relatedEntityType === "challenge"
                          ? `/challenges/${n.relatedEntityId}`
                          : `/teams/${n.relatedEntityId}`,
                      label:
                        n.relatedEntityType === "challenge"
                          ? "View challenge"
                          : "View team",
                    }
                  : null;
              const context = getContextLabel(
                n.relatedEntityType,
                n.relatedEntityId
              );
              const secondary = [formatRelativeTime(n.createdAt), context]
                .filter(Boolean)
                .join(" · ");

            return (
              <NotificationListItem
                key={n.id}
                n={n}
                link={link}
                config={config}
                secondary={secondary}
                onItemClick={() => handleItemClick(n, link)}
                onMarkRead={() => markRead(n.id)}
              />
            );
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      {notifications != null && notifications.length > 0 && (
        <div className="flex justify-center border-t border-border py-3">
          <Link
            href="/account/notifications"
            className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            View all
          </Link>
        </div>
      )}
    </div>
  );
}
