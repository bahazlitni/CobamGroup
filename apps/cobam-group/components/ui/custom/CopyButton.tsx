"use client";

import CopyButton from "@/components/ui/custom/CopyButtonBase";
import { AnimatedUISize } from "@/components/ui/custom/animated-ui.shared";
import type { ButtonVariant } from "@/components/ui/custom/AnimatedUIButton";
import { toast } from "sonner";

interface AnimatedUICopyButtonProps {
  errorText?: string;
  successText?: string;
  onCopy?: (copiedText: string) => void;
  value: string;
  size?: AnimatedUISize;
  variant?: ButtonVariant;
  className?: string;
  ariaLabel?: string;
}

export default function AnimatedUICopyButton({
  successText = "Texte copie.",
  errorText = "Impossible de copier le texte.",
  onCopy,
  value,
  size = "xs",
  variant = "light",
  className,
  ariaLabel = "Copier",
}: AnimatedUICopyButtonProps) {
  return (
    <CopyButton
      value={value}
      size={size}
      variant={variant}
      className={className}
      ariaLabel={ariaLabel}
      onCopy={(copiedText) => {
        toast.success(successText);
        onCopy?.(copiedText);
      }}
      onError={() => {
        toast.error(errorText);
      }}
    />
  );
}
