import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-full border px-3 py-1 text-xs font-black leading-none transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-ec-ink text-white",
        blue: "border-transparent bg-ec-blue/10 text-ec-blue",
        secondary: "border-transparent bg-ec-stone text-ec-ink",
        outline: "border-ec-line bg-white text-ec-muted",
        success: "border-transparent bg-emerald-50 text-emerald-700",
        warning: "border-transparent bg-amber-50 text-amber-700",
        destructive: "border-transparent bg-rose-50 text-rose-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
