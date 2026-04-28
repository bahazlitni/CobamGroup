"use client";

import { useState } from "react";
import { toast } from "sonner";
import SecurityForm from "@/components/staff/ui/SecurityForm";
import { staffApiFetch } from "@/lib/api/auth/staff/api-fetch";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { StaffPageHeader } from "@/components/staff/ui";
import OTPInput from "@/components/ui/custom/OTPInput";
import Panel from "@/components/staff/ui/Panel";
import { useStaffSession } from "@/features/auth/client/use-staff-session";

type SecurityStep = "form" | "otp";
type OtpVisualState = "idle" | "error" | "success";

export default function SecurityPage() {
  const { session } = useStaffSession({ redirectToLogin: false });
  const [state, setState] = useState({
    currentPassword: "",
    newPassword: "",
    confirmation: "",
  });
  const [step, setStep] = useState<SecurityStep>("form");
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpVisualState, setOtpVisualState] =
    useState<OtpVisualState>("idle");
  const [otpStatusText, setOtpStatusText] = useState<string | null>(null);
  const [otpEmail, setOtpEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validatePasswordForm = () => {
    if (!state.currentPassword) {
      return "Le mot de passe actuel est requis.";
    }

    if (!state.newPassword || state.newPassword !== state.confirmation) {
      return "Les mots de passe ne correspondent pas.";
    }

    if (state.newPassword.length < 8) {
      return "Le nouveau mot de passe doit contenir au moins 8 caracteres.";
    }

    return null;
  };

  const requestPasswordOtp = async () => {
    setError(null);
    setOtpStatusText(null);
    setOtpVisualState("idle");

    const validationError = validatePasswordForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsRequestingOtp(true);

    try {
      const res = await staffApiFetch("/api/auth/staff/password/otp", {
        method: "POST",
        auth: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: state.currentPassword,
          newPassword: state.newPassword,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        throw new Error(data?.message || "Erreur lors de l'envoi du code OTP");
      }

      setOtpEmail(
        typeof data.email === "string" && data.email
          ? data.email
          : session?.email ?? null,
      );
      setStep("otp");
      setOtpStatusText("Code OTP envoye. Consultez votre boite e-mail.");
      toast.success("Code OTP envoye");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de l'envoi du code OTP";
      setError(message);
      toast.error("Erreur lors de l'envoi du code OTP", {
        description: message,
      });
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const handleOtpVerify = async (code: string) => {
    setError(null);
    setOtpVisualState("idle");
    setOtpStatusText("Verification en cours...");
    setIsVerifyingOtp(true);

    try {
      const res = await staffApiFetch("/api/auth/staff/password", {
        method: "POST",
        auth: true,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: state.currentPassword,
          newPassword: state.newPassword,
          code,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        throw new Error(data?.message || "Code OTP incorrect.");
      }

      setOtpVisualState("success");
      setOtpStatusText("Mot de passe mis a jour.");
      toast.success("Mot de passe mis a jour");
      setState({ currentPassword: "", newPassword: "", confirmation: "" });
      setTimeout(() => {
        setStep("form");
        setOtpStatusText(null);
        setOtpVisualState("idle");
        setOtpEmail(null);
      }, 700);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur lors de la verification";
      setOtpVisualState("error");
      setOtpStatusText(message);
      setError(message);
      toast.error("Verification impossible", {
        description: message,
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="space-y-5">
      <StaffPageHeader eyebrow="Securite" title="Mot de passe">
        {step === "form" ? (
          <AnimatedUIButton
            type="button"
            onClick={requestPasswordOtp}
            disabled={isRequestingOtp}
            loading={isRequestingOtp}
            loadingText="Envoi du code..."
            icon="shield"
            variant="secondary"
          >
            Envoyer le code OTP
          </AnimatedUIButton>
        ) : null}
      </StaffPageHeader>

      {step === "form" ? (
        <SecurityForm
          state={state}
          onChange={(patch) => setState((prev) => ({ ...prev, ...patch }))}
        />
      ) : (
        <Panel
          pretitle="Verification"
          title="Confirmer le changement"
          description={`Un code de confirmation a ete envoye a ${
            otpEmail ?? session?.email ?? "votre adresse e-mail"
          }.`}
        >
          <OTPInput
            email={otpEmail ?? session?.email ?? ""}
            length={6}
            loading={isVerifyingOtp}
            visualState={otpVisualState}
            statusText={otpStatusText}
            onVerify={handleOtpVerify}
            onBack={() => {
              setStep("form");
              setOtpVisualState("idle");
              setOtpStatusText(null);
              setError(null);
            }}
            onResend={requestPasswordOtp}
            resending={isRequestingOtp}
          />
        </Panel>
      )}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </div>
  );
}
