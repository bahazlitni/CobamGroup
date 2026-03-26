import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

export default function StaffField({
  id,
  label,
  hint,
  children,
}: {
  id?: string;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
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
