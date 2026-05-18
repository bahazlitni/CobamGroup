import * as React from "react";

import { cn } from "@/lib/cn";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-ec-line text-ec-ink placeholder:text-ec-muted/70 focus:border-ec-blue focus:ring-ec-blue/10 disabled:bg-ec-paper disabled:text-ec-muted h-12 w-full min-w-0 rounded-2xl border bg-white px-4 text-sm font-semibold transition outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-80",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
