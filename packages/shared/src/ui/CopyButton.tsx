"use client";

import { AnimatedUIButton, type ButtonVariant } from "./AnimatedUIButton";
import type { AnimatedUISize } from "./animated-ui";
import { cn } from "./cn";

export type CopyButtonProps = {
  value: string;
  ariaLabel?: string;
  className?: string;
  size?: AnimatedUISize;
  variant?: ButtonVariant;
  onCopy?: (copiedText: string) => void;
  onError?: (error: unknown) => void;
};

const COPY_BUTTON_SIZE_CLASSES: Record<AnimatedUISize, string> = {
  xs: "h-8 min-h-8 w-8",
  sm: "h-9 min-h-9 w-9",
  md: "h-10 min-h-10 w-10",
  lg: "h-11 min-h-11 w-11",
  xl: "h-12 min-h-12 w-12",
  "2xl": "h-14 min-h-14 w-14",
  "3xl": "h-16 min-h-16 w-16",
};

export async function copyTextToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
}

export function CopyButton({
  value,
  ariaLabel = "Copier",
  className,
  size = "xs",
  variant = "light",
  onCopy,
  onError,
}: CopyButtonProps) {
  const handleCopy = async () => {
    try {
      await copyTextToClipboard(value);
      onCopy?.(value);
    } catch (error) {
      onError?.(error);
    }
  };

  return (
    <AnimatedUIButton
      type="button"
      size={size}
      variant={variant}
      className={cn(
        COPY_BUTTON_SIZE_CLASSES[size],
        "rounded-full border-[#cfd9e4] bg-[#f8fafc] px-0 py-0 text-[#5f6f84] shadow-none",
        "hover:border-[#9ecfe3] hover:bg-[#f0f8fc] active:bg-[#e8f4fa]",
        "focus-visible:ring-[#0a8dc1]/20",
        className,
      )}
      onClick={handleCopy}
      icon="copy"
      aria-label={ariaLabel}
    />
  );
}

export default CopyButton;
