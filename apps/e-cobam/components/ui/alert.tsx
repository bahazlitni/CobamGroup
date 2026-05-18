import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

const alertVariants = cva(
  "relative grid w-full gap-1 rounded-2xl border p-4 text-sm has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-3 [&>svg]:mt-0.5 [&>svg]:size-5",
  {
    variants: {
      variant: {
        default: "border-ec-line bg-white text-ec-ink",
        muted: "border-ec-line bg-ec-paper text-ec-muted",
        destructive: "border-rose-200 bg-rose-50 text-rose-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="alert-title" className={cn("font-black text-current", className)} {...props} />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-sm leading-6 text-current/75", className)}
      {...props}
    />
  );
}

export { Alert, AlertDescription, AlertTitle };
