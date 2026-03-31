import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

type StaffInputProps = ComponentProps<typeof Input> & {
  fullWidth?: boolean;
};

export default function StaffInput({
  fullWidth = false,
  className,
  ...props
}: StaffInputProps) {
  return (
    <Input
      className={cn(
        "h-10 rounded-md border border-slate-300 px-4 text-base",
        fullWidth ? "w-full" : "w-auto",
        className,
      )}
      {...props}
    />
  );
}
