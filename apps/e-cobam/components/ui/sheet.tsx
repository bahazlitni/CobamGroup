"use client";

import * as React from "react";
import { Dialog as SheetPrimitive } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger(props: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose(props: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal(props: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-[90] bg-ec-ink/30 backdrop-blur-sm",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        className,
      )}
      {...props}
    />
  );
}

function isIgnoredOutsideInteraction(event: Event) {
  const originalEvent = (event as CustomEvent<{ originalEvent?: Event }>).detail?.originalEvent;
  const target = originalEvent?.target ?? event.target;

  return target instanceof Element && target.closest("[data-undo-toast]");
}

function SheetContent({
  className,
  children,
  side = "right",
  onInteractOutside,
  onPointerDownOutside,
  onFocusOutside,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
}) {
  const handleInteractOutside: React.ComponentProps<
    typeof SheetPrimitive.Content
  >["onInteractOutside"] = (event) => {
    if (isIgnoredOutsideInteraction(event)) {
      event.preventDefault();
      return;
    }

    onInteractOutside?.(event);
  };

  const handlePointerDownOutside: React.ComponentProps<
    typeof SheetPrimitive.Content
  >["onPointerDownOutside"] = (event) => {
    if (isIgnoredOutsideInteraction(event)) {
      event.preventDefault();
      return;
    }

    onPointerDownOutside?.(event);
  };

  const handleFocusOutside: React.ComponentProps<
    typeof SheetPrimitive.Content
  >["onFocusOutside"] = (event) => {
    if (isIgnoredOutsideInteraction(event)) {
      event.preventDefault();
      return;
    }

    onFocusOutside?.(event);
  };

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-[91] flex flex-col gap-0 bg-white shadow-[0_24px_90px_rgba(20,32,46,0.28)] outline-none",
          "data-[state=closed]:duration-200 data-[state=open]:duration-300",
          side === "right" &&
            "inset-y-0 right-0 h-full w-[min(29rem,calc(100vw-1rem))] rounded-l-[2rem] border-l border-ec-line data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
          side === "left" &&
            "inset-y-0 left-0 h-full w-[min(29rem,calc(100vw-1rem))] rounded-r-[2rem] border-r border-ec-line data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
          side === "top" &&
            "inset-x-0 top-0 max-h-[88vh] rounded-b-[2rem] border-b border-ec-line data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
          side === "bottom" &&
            "inset-x-0 bottom-0 max-h-[88vh] rounded-t-[2rem] border-t border-ec-line data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
          className,
        )}
        onInteractOutside={handleInteractOutside}
        onPointerDownOutside={handlePointerDownOutside}
        onFocusOutside={handleFocusOutside}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="absolute right-4 top-4 grid size-9 place-items-center rounded-full border border-ec-line bg-white text-ec-muted transition hover:border-ec-blue/35 hover:text-ec-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-blue">
          <X className="size-4" aria-hidden="true" />
          <span className="sr-only">Fermer</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("space-y-1.5 p-5 pr-14", className)} {...props} />;
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-xl font-black tracking-tight text-ec-ink", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm font-semibold text-ec-muted", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
};
