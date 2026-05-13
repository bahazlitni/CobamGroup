import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function StaffField({
  id,
  label,
  hint,
  children,
  fullWidth = false,
  className = "",
}: {
  id?: string;
  label: string;
  hint?: string;
  children: ReactNode;
  fullWidth?: boolean
  className?: string
}) {
  return (
    <div className={cn("space-y-2", className, fullWidth ? "w-full" : "")}>
      <Label
        htmlFor={id}
        className="text-[15px] font-semibold text-cobam-dark-blue"
      >
        {label}
      </Label>
      {children}
      {hint ? <p className="text-sm leading-6 text-slate-400">{hint}</p> : null}
    </div>
  );
}
