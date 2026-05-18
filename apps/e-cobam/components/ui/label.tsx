"use client";

import * as React from "react";
import { Label as LabelPrimitive } from "radix-ui";

import { cn } from "@/lib/cn";

function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "text-ec-muted text-xs leading-none font-bold tracking-[0.18em] uppercase peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
