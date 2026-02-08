import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function DashboardHeader({ title, subtitle, className }: DashboardHeaderProps) {
  return (
    <header className={cn("space-y-1", className)}>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      {subtitle != null && <p className="text-muted-foreground">{subtitle}</p>}
    </header>
  );
}
