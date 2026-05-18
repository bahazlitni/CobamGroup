import type { ReactNode } from "react";

import { AccountNav } from "@/components/account/account-nav";

type AccountPageHeaderProps = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
};

export function AccountPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: AccountPageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-ec-blue text-sm font-semibold tracking-[0.24em] uppercase">{eyebrow}</p>
        <h1 className="text-ec-ink mt-3 text-4xl font-black tracking-tight sm:text-6xl">{title}</h1>
        {description ? (
          <p className="text-ec-muted mt-4 max-w-2xl text-sm leading-7">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

export function AccountPageShell({ active, children }: { active: string; children: ReactNode }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <AccountNav active={active} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
