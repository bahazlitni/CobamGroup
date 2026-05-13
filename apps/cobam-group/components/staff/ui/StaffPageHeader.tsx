"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { useRouter } from "next/navigation";

export default function StaffPageHeader({
  eyebrow,
  title,
  icon: Icon,
  actions,
  status,
  children,
}: {
  eyebrow: string;
  title: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  status?: ReactNode;
  backHref?: string;
  children?: ReactNode;
}) {
  const router = useRouter()

  const goBack = () => router.back()

  return (
    <div className="flex flex-col items-center justify-center text-center lg:text-left lg:flex-row lg:items-start lg:justify-between gap-4">
      <div className="flex items-center gap-6 sm:flex-row">
        <AnimatedUIButton icon="arrow-left" iconPosition="left" onClick={goBack}/>
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {Icon ? <Icon className="h-4 w-4" /> : null}
            <span>{eyebrow}</span>
          </div>
          <h1 className="text-xl font-semibold text-cobam-dark-blue sm:text-2xl">
            {title}
          </h1>
        </div>
      </div>

      {actions || status || children ? (
        <div className="flex flex-col items-start gap-3 lg:items-end">
          {status}
          {children}
          {actions}
        </div>
      ) : null}
    </div>
  );
}
