"use client";

import * as React from "react";
import { CheckIcon, MinusIcon } from "lucide-react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-cobam-dark-blue shadow-xs transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobam-water-blue/25",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:border-cobam-dark-blue data-[state=checked]:bg-cobam-dark-blue data-[state=checked]:text-white",
        "data-[state=indeterminate]:border-cobam-dark-blue data-[state=indeterminate]:bg-cobam-dark-blue data-[state=indeterminate]:text-white",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center">
        {props.checked === "indeterminate" ? (
          <MinusIcon className="h-3.5 w-3.5" />
        ) : (
          <CheckIcon className="h-3.5 w-3.5" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
