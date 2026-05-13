import type { ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type NoticeVariant = "error" | "success" | "warning" | "info";

const variantMap: Record<
  NoticeVariant,
  {
    icon: LucideIcon;
    container: string;
    title: string;
    description: string;
  }
> = {
  error: {
    icon: AlertCircle,
    container: "border-red-200 bg-red-50 text-red-900",
    title: "text-red-900",
    description: "text-red-700",
  },
  success: {
    icon: CheckCircle2,
    container: "border-emerald-200 bg-emerald-50 text-emerald-900",
    title: "text-emerald-900",
    description: "text-emerald-700",
  },
  warning: {
    icon: TriangleAlert,
    container: "border-amber-200 bg-amber-50 text-amber-900",
    title: "text-amber-900",
    description: "text-amber-700",
  },
  info: {
    icon: Info,
    container: "border-sky-200 bg-sky-50 text-sky-900",
    title: "text-sky-900",
    description: "text-sky-700",
  },
};

export default function StaffNotice({
  variant = "info",
  title,
  children,
  className,
}: {
  variant?: NoticeVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const Icon = variantMap[variant].icon;

  return (
    <Alert
      className={cn(
        "rounded-lg border px-4 py-3 shadow-sm [&>svg]:mt-0.5",
        variantMap[variant].container,
        className,
      )}
    >
      <Icon className="h-4 w-4" />
      {title ? (
        <AlertTitle className={cn("font-semibold", variantMap[variant].title)}>
          {title}
        </AlertTitle>
      ) : null}
      <AlertDescription className={cn("text-sm", variantMap[variant].description)}>
        {children}
      </AlertDescription>
    </Alert>
  );
}
