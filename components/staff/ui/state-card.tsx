import type { ReactNode } from "react";
import { ShieldAlert, CircleAlert, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";

type Variant = "error" | "forbidden";

const iconByVariant: Record<Variant, LucideIcon> = {
  error: CircleAlert,
  forbidden: ShieldAlert,
};

export default function StaffStateCard({
  variant = "error",
  title,
  description,
  actionHref,
  actionLabel,
  children,
}: {
  variant?: Variant;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  children?: ReactNode;
}) {
  const Icon = iconByVariant[variant];

  return (
    <Card className="mx-auto max-w-md rounded-2xl border border-slate-300 bg-white shadow-sm">
      <CardContent className="space-y-4 p-6">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-cobam-dark-blue">
          <Icon className="h-5 w-5" />
        </div>

        <div className="space-y-2">
          <h1 className="text-lg font-semibold text-cobam-dark-blue">{title}</h1>
          <p className="text-sm text-slate-600">{description}</p>
        </div>

        {children}

        {actionHref && actionLabel ? (
          <AnimatedUIButton
            href={actionHref}
            variant="primary"
            icon="arrow-left"
            iconPosition="left"
            className="w-fit"
          >
            {actionLabel}
          </AnimatedUIButton>
        ) : null}
      </CardContent>
    </Card>
  );
}
