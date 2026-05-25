"use client";

import { Copy } from "lucide-react";
import { cn } from "@/lib/cn";

type CopyButtonSize = "xs" | "sm" | "md" | "lg";

const sizeClasses: Record<CopyButtonSize, string> = {
  xs: "size-7",
  sm: "size-8",
  md: "size-9",
  lg: "size-10",
};

const iconClasses: Record<CopyButtonSize, string> = {
  xs: "size-3.5",
  sm: "size-4",
  md: "size-4",
  lg: "size-4.5",
};

export async function copyTextToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
}

export function CopyButton({
  value,
  ariaLabel = "Copier",
  size = "xs",
  className,
  onCopy,
  onError,
}: {
  value: string;
  ariaLabel?: string;
  size?: CopyButtonSize;
  className?: string;
  onCopy?: (copiedText: string) => void;
  onError?: (error: unknown) => void;
}) {
  async function handleCopy() {
    try {
      await copyTextToClipboard(value);
      onCopy?.(value);
    } catch (error) {
      onError?.(error);
    }
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={handleCopy}
      className={cn(
        "inline-grid place-items-center border border-ec-line bg-white text-ec-muted transition hover:border-ec-ink hover:text-ec-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-blue",
        sizeClasses[size],
        className,
      )}
    >
      <Copy className={iconClasses[size]} aria-hidden="true" />
    </button>
  );
}

export default CopyButton;
