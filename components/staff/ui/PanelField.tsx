import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export default function PanelField({
  id,
  label,
  hint,
  children,
  className
}: {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string
}) {
  return (
    <div className={cn("space-y-1 w-full", className)}>
      <Label
        htmlFor={id}
        className="text-sm font-semibold text-cobam-dark-blue text-nowrap"
      >
        {label}
      </Label>
      {children}
      {hint ? <p className="text-xs leading-4 text-slate-400">{hint}</p> : null}
    </div>
  );
}