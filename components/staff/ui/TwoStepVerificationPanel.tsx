"use client";

import Panel from "@/components/staff/ui/Panel";
import BooleanButton from "@/components/staff/ui/BooleanButton";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";

type TwoStepVerificationPanelProps = {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  onSubmit?: () => void | Promise<void>;
  isSubmitting?: boolean;
  disabled?: boolean;
  submitDisabled?: boolean;
  pretitle?: string;
  title?: string;
  description?: string;
  submitLabel?: string;
};

export default function TwoStepVerificationPanel({
  enabled,
  onEnabledChange,
  onSubmit,
  isSubmitting = false,
  disabled = false,
  submitDisabled = false,
  pretitle = "Sécurité",
  title = "Vérification en deux étapes",
  description = "Contrôlez si un code OTP est demandé après le mot de passe.",
  submitLabel = "Enregistrer la vérification",
}: TwoStepVerificationPanelProps) {
  const isLocked = disabled || isSubmitting;
  const isSubmitLocked = isLocked || submitDisabled;

  return (
    <Panel pretitle={pretitle} title={title} description={description}>
      <div className="flex items-start justify-between gap-4 rounded-lg border border-slate-300 bg-slate-50/80 px-4 py-4">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-cobam-dark-blue">
            Activer la vérification OTP à la connexion
          </p>
          <p className="text-sm leading-6 text-slate-500">
            {enabled
              ? "Le compte devra valider un code OTP après son mot de passe."
              : "Le compte se connectera avec son mot de passe uniquement."}
          </p>
        </div>

        <BooleanButton
          id="two-step-verification-enabled"
          checked={enabled}
          disabled={isLocked}
          onClick={onEnabledChange}
        />
      </div>

      {disabled ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Vous n&apos;avez pas la permission de modifier cette option.
        </p>
      ) : null}

      {onSubmit ? (
        <AnimatedUIButton
          type="button"
          onClick={() => void onSubmit()}
          disabled={isSubmitLocked}
          loading={isSubmitting}
          loadingText="Enregistrement..."
          variant="primary"
          icon="shield"
          iconPosition="left"
          className="w-full"
        >
          {submitLabel}
        </AnimatedUIButton>
      ) : null}
    </Panel>
  );
}