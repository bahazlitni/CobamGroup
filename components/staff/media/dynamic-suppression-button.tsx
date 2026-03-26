"use client";

import { AnimatedUIButton } from "@/components/ui/custom/Buttons";

export default function DynamicSuppressionButton({
  buttonText,
  isForceMode,
  disabled,
  loading,
  onClick,
  className,
}: {
  buttonText?: {
    default: string;
    force: string;
  };
  isForceMode: boolean;
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <AnimatedUIButton
      type="button"
      variant={isForceMode ? "primary" : "light"}
      color="red"
      icon="delete"
      iconPosition="left"
      onClick={onClick}
      disabled={disabled}
      loading={loading}
      loadingText={isForceMode ? "Suppression forcee..." : "Suppression..."}
      className={className}
    >
      {isForceMode
        ? (buttonText?.force ?? "Forcer la suppression")
        : (buttonText?.default ?? "Supprimer")}
    </AnimatedUIButton>
  );
}
