"use client";

import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CheckCircle2,
  Info,
  Megaphone,
  Users,
  AlertCircle,
} from "lucide-react";
import { ReactNode, useLayoutEffect, useRef, useState } from "react";

const typeConfig = {
  info: {
    accent: "border-l-sky-500 bg-sky-500/5 dark:bg-sky-500/10",
    dot: "bg-sky-500",
    icon: Info,
    iconClass: "text-sky-600 dark:text-sky-400",
  },
  success: {
    accent: "border-l-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
    iconClass: "text-emerald-600 dark:text-emerald-400",
  },
  warning: {
    accent: "border-l-amber-500 bg-amber-500/5 dark:bg-amber-500/10",
    dot: "bg-amber-500",
    icon: AlertCircle,
    iconClass: "text-amber-600 dark:text-amber-400",
  },
  team: {
    accent: "border-l-orange-500 bg-orange-500/5 dark:bg-orange-500/10",
    dot: "bg-orange-500",
    icon: Users,
    iconClass: "text-orange-600 dark:text-orange-400",
  },
  announcement: {
    accent: "border-l-rose-500 bg-rose-500/5 dark:bg-rose-500/10",
    dot: "bg-rose-500",
    icon: Megaphone,
    iconClass: "text-rose-600 dark:text-rose-400",
  },
} as const;

export type NotificationVariant = keyof typeof typeConfig;

export interface NotificationCardProps {
  title: string;
  body?: string | null;
  createdAt: string;
  isRead?: boolean;
  link?: { href: string; label: string } | null;
  /** When provided, clicking the card marks as read and navigates. Called with href. */
  onNavigate?: (href: string) => void;
  /** When provided and notification is unread, shows a "Mark read" button. */
  onMarkAsRead?: () => void;
  actions?: React.ReactNode;
  className?: string;
  formattedDate?: string;
  icon?: ReactNode;
  type?: NotificationVariant;
}

export function NotificationCard({
  title,
  body,
  createdAt,
  isRead = false,
  link,
  onNavigate,
  onMarkAsRead,
  actions,
  className,
  formattedDate,
  type = "info",
}: NotificationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const dateDisplay = formattedDate ?? formatDateDefault(createdAt);
  const config = typeConfig[type] ?? typeConfig.info;
  const Icon = config.icon;

  const isClickable = link && onNavigate;
  const hasBody = Boolean(body);
  const likelyTruncated = (body?.length ?? 0) > 80;
  const needsClamp = hasBody && (isTruncated || likelyTruncated);
  const showSeeDetails = hasBody && (isTruncated || likelyTruncated || expanded);
  const useFixedHeight = needsClamp && !expanded;

  useLayoutEffect(() => {
    if (!body || expanded) {
      setIsTruncated(false);
      return;
    }
    const el = bodyRef.current;
    if (!el) return;
    setIsTruncated(el.scrollHeight > el.clientHeight);
  }, [body, expanded]);

  const handleCardClick = () => {
    if (isClickable) onNavigate(link!.href);
  };

  return (
    <div
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={handleCardClick}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onNavigate(link!.href);
              }
            }
          : undefined
      }
      className={cn(
        "group relative flex w-full shrink-0 overflow-hidden rounded-xl border border-border/60 border-l-4 transition-all duration-200",
        useFixedHeight && "h-[128px] min-h-[128px] max-h-[128px]",
        config.accent,
        "hover:border-border hover:shadow-sm",
        isClickable && "cursor-pointer text-left",
        className
      )}
    >
      <div className="flex min-h-full w-full items-start gap-3 p-4">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            isRead ? "bg-muted/80" : "bg-background/80 dark:bg-background/50"
          )}
        >
          <Icon
            className={cn("size-4", isRead ? "text-muted-foreground" : config.iconClass)}
          />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <p
              className={cn(
                "text-sm leading-snug",
                isRead ? "font-medium text-foreground" : "font-semibold text-foreground"
              )}
            >
              {title}
            </p>
            <span className="shrink-0 text-xs font-medium text-foreground tabular-nums">
              {dateDisplay}
            </span>
          </div>
          {body && (
            <p
              ref={bodyRef}
              className={cn(
                "text-sm text-foreground",
                expanded ? "whitespace-pre-wrap" : "line-clamp-2"
              )}
            >
              {body}
            </p>
          )}

          {(showSeeDetails || link || actions || (onMarkAsRead && !isRead)) && (
            <div
              className="flex flex-wrap items-center justify-between gap-2 pt-1"
              onClick={(e) => e.stopPropagation()}
            >
              {showSeeDetails && (
                <button
                  type="button"
                  onClick={() => setExpanded(!expanded)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 transition-colors hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                >
                  {expanded ? (
                    <>
                      See less
                      <ChevronUp className="size-3.5" />
                    </>
                  ) : (
                    <>
                      See details
                      <ChevronDown className="size-3.5" />
                    </>
                  )}
                </button>
              )}
              {link && !isClickable && (
                <a
                  href={link.href}
                  className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 transition-colors hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                >
                  {link.label}
                  <ChevronRight className="size-3.5" />
                </a>
              )}
              {link && isClickable && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400">
                  {link.label}
                  <ChevronRight className="size-3.5" />
                </span>
              )}
              {onMarkAsRead && !isRead && (
                <button
                  type="button"
                  onClick={onMarkAsRead}
                  className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Mark read
                </button>
              )}
              {actions && (
                <div className="flex items-center gap-1.5">{actions}</div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function formatDateDefault(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}