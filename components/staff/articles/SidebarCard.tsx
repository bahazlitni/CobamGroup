// components/staff/articles/SidebarCard.tsx

"use client";

import { cn } from "@/lib/utils";

interface SidebarCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function SidebarCard({ title, children, className }: SidebarCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}>
      <div className="px-4 py-3 border-b">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}