"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail } from "lucide-react";
import { staffApiFetch } from "@/lib/api/auth/staff/api-fetch";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import OTPInput from "@/components/ui/custom/OTPInput";

type LoginStep = "password" | "otp" | "forgot-password" | "forgot-password-info";
type OtpVisualState = "idle" | "error" | "success";

const DEFAULT_STAFF_LOGIN_REDIRECT = "/espace/staff/accueil/tableau-de-bord";

function resolveStaffLoginRedirect(value: string | null) {
  if (!value) {
    return DEFAULT_STAFF_LOGIN_REDIRECT;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return DEFAULT_STAFF_LOGIN_REDIRECT;
  }

  const redirectPath = trimmedValue.startsWith("/") ? trimmedValue : `/${trimmedValue}`;

  if (redirectPath === "/annuaire" || redirectPath.startsWith("/espace/staff/")) {
    return redirectPath;
  }

  return DEFAULT_STAFF_LOGIN_REDIRECT;
}

function getRedirectAfterLogin() {
  if (typeof window === "undefined") {
    return DEFAULT_STAFF_LOGIN_REDIRECT;
  }

  return resolveStaffLoginRedirect(new URLSearchParams(window.location.search).get("redirect"));
}

export default function StaffLoginPage() {
  const router = useRouter();

  const [step, setStep] = useState<LoginStep>("password");
  const [email, setEmail] = useState("");
  const [pendingPassword, setPendingPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [isRequestingPasswordReset, setIsRequestingPasswordReset] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState(
    "Si votre email est correct, nous vous avons envoyé un lien magique.",
  );
  const [otpStatusText, setOtpStatusText] = useState<string | null>(null);
  const [otpVisualState, setOtpVisualState] = useState<OtpVisualState>("idle");

  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const accessToken = localStorage.getItem("staff_access_token");

        if (!accessToken) {
          setIsCheckingSession(false);
          return;
        }

        const res = await staffApiFetch("/api/staff/me", {
          method: "GET",
          auth: true,
        });

        const data = await res.json();

        if (res.ok && data?.ok && data?.user?.portal === "STAFF") {
          router.replace(getRedirectAfterLogin());
          return;
        }
      } catch {
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkExistingSession();
  }, [router]);

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);

      const nextEmail = String(formData.get("username") ?? "")
        .trim()
        .toLowerCase();

      const password = String(formData.get("password") ?? "");

      const res = await fetch("/api/auth/staff/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: nextEmail,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Erreur de connexion");
      }

      if (!data.requiresOtp && data.accessToken && data.user) {
        localStorage.setItem("staff_access_token", data.accessToken);
        localStorage.setItem("staff_auth_user", JSON.stringify(data.user));
        setPendingPassword("");
        router.replace(getRedirectAfterLogin());
        return;
      }

      if (!data.requiresOtp) {
        throw new Error("Réponse invalide. Vérification OTP manquante.");
      }

      setEmail(nextEmail);
      setPendingPassword(password);
      setStep("otp");
      setOtpVisualState("idle");
      setOtpStatusText(typeof data.message === "string" ? data.message : null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpVerify = async (code: string) => {
    setError(null);
    setOtpVisualState("idle");
    setOtpStatusText("Vérification en cours...");
    setIsVerifyingOtp(true);

    try {
      const res = await fetch("/api/auth/staff/login/otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setOtpVisualState("error");
        setOtpStatusText(data.message);
        throw new Error(data.message);
      }

      setOtpVisualState("success");
      setOtpStatusText("Le code OTP est correct.");
      setIsAuthenticating(true);
      setOtpStatusText("Authentification en cours...");

      localStorage.setItem("staff_access_token", data.accessToken);
      localStorage.setItem("staff_auth_user", JSON.stringify(data.user));
      setPendingPassword("");

      router.replace(getRedirectAfterLogin());
    } catch (err: unknown) {
      if (otpVisualState !== "error") {
        setOtpVisualState("error");
        setOtpStatusText("Le code OTP est incorrect.");
      }

      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleOtpResend = async () => {
    if (!email || !pendingPassword) {
      setStep("password");
      setError("Veuillez saisir vos identifiants a nouveau.");
      return;
    }

    setError(null);
    setOtpStatusText(null);
    setOtpVisualState("idle");
    setIsResendingOtp(true);

    try {
      const res = await fetch("/api/auth/staff/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: pendingPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok || !data.requiresOtp) {
        throw new Error(data.message || "Erreur lors du renvoi du code OTP.");
      }

      setOtpStatusText(
        typeof data.message === "string" ? data.message : "Nouveau Code OTP envoyé.",
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors du renvoi du code OTP.";
      setOtpVisualState("error");
      setOtpStatusText(message);
      setError(message);
    } finally {
      setIsResendingOtp(false);
    }
  };

  const openForgotPasswordFlow = () => {
    setError(null);
    setForgotPasswordMessage("Si votre email est correct, nous vous avons envoyé un lien magique.");
    setStep("forgot-password");
  };

  const returnToPasswordStep = () => {
    setStep("password");
    setError(null);
    setForgotPasswordEmail("");
    setForgotPasswordMessage("Si votre email est correct, nous vous avons envoyé un lien magique.");
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsRequestingPasswordReset(true);

    try {
      const formData = new FormData(e.currentTarget);
      const resetEmail = String(formData.get("forgot-email") ?? "")
        .trim()
        .toLowerCase();

      setForgotPasswordEmail(resetEmail);

      const res = await fetch("/api/auth/staff/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json().catch(() => null);

      setForgotPasswordMessage(
        typeof data?.message === "string"
          ? data.message
          : "Si votre email est correct, nous vous avons envoyé un lien magique.",
      );

      if (!res.ok) {
        console.error("FORGOT_PASSWORD_REQUEST_ERROR:", data);
      }

      setStep("forgot-password-info");
    } catch (err) {
      console.error("FORGOT_PASSWORD_REQUEST_ERROR:", err);
      setForgotPasswordMessage(
        "Si votre email est correct, nous vous avons envoyé un lien magique.",
      );
      setStep("forgot-password-info");
    } finally {
      setIsRequestingPasswordReset(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#FDFDFD] lg:flex-row">
      <div className="bg-cobam-dark-blue relative hidden min-h-[40vh] w-full flex-col justify-end overflow-hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:min-h-screen lg:w-1/2">
        <div className="absolute top-6 left-6 z-50 lg:top-10 lg:left-10">
          <AnimatedUIButton href="/" variant="secondary" icon="arrow-left">
            Retour
          </AnimatedUIButton>
        </div>

        <motion.div
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <Image
            src="/images/login/staff/staff-login.png"
            alt="Espace professionnel COBAM"
            fill
            className="object-cover opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
        </motion.div>

        <div className="relative z-10 flex h-full flex-col justify-end p-8 sm:p-12 lg:p-16 xl:p-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <p className="text-cobam-water-blue mb-4 text-xs font-bold tracking-[0.25em] uppercase sm:text-sm">
              Portail privé
            </p>

            <h2
              className="mb-6 text-4xl leading-tight font-bold text-white sm:text-5xl lg:text-6xl"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Espace Team
            </h2>

            <p className="max-w-lg text-sm leading-relaxed font-light text-white/80 sm:text-base">
              Gérez le contenu du site, les produits et les marques depuis une interface dédiée aux
              équipes COBAM GROUP.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="flex min-h-screen w-full flex-col justify-center bg-white px-6 py-12 sm:px-12 lg:ml-auto lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <AnimatePresence mode="wait">
            {step === "password" ? (
              <motion.div
                key="password-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="mb-12"
              >
                <h1
                  className="text-cobam-dark-blue mb-4 mb-10 text-3xl font-bold sm:text-4xl"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  Connexion
                </h1>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="username"
                      className="text-cobam-dark-blue ml-1 flex items-center gap-2 text-xs font-bold tracking-[0.1em] uppercase"
                    >
                      <Mail size={14} className="text-cobam-water-blue" />
                      Adresse e-mail
                    </label>

                    <input
                      id="username"
                      name="username"
                      type="email"
                      autoComplete="username"
                      required
                      disabled={isCheckingSession || isSubmitting}
                      className="text-cobam-dark-blue focus:border-cobam-water-blue focus:ring-cobam-water-blue/40 w-full rounded-lg border border-gray-200 bg-[#F8F9FA] px-5 py-4 text-sm shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all focus:bg-white focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="votre.nom@cobamgroup.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="text-cobam-dark-blue ml-1 flex items-center gap-2 text-xs font-bold tracking-[0.1em] uppercase"
                    >
                      <Lock size={14} className="text-cobam-water-blue" />
                      Mot de passe
                    </label>

                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      disabled={isCheckingSession || isSubmitting}
                      className="text-cobam-dark-blue focus:border-cobam-water-blue focus:ring-cobam-water-blue/40 w-full rounded-lg border border-gray-200 bg-[#F8F9FA] px-5 py-4 text-sm shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all focus:bg-white focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="••••••••"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={openForgotPasswordFlow}
                        disabled={isCheckingSession || isSubmitting}
                        className="text-cobam-water-blue hover:text-cobam-dark-blue text-xs font-semibold transition"
                      >
                        Mot de passe oublié ?
                      </button>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg border border-red-100 bg-red-50 px-4 py-3"
                    >
                      <p className="text-center text-xs font-medium text-red-600">{error}</p>
                    </motion.div>
                  )}

                  <div className="flex justify-end pt-4">
                    <AnimatedUIButton
                      type="submit"
                      disabled={isCheckingSession || isSubmitting}
                      variant="primary"
                      loading={isCheckingSession || isSubmitting}
                      icon="arrow-right"
                      loadingText={isCheckingSession ? "Vérification..." : "Connexion..."}
                    >
                      {isCheckingSession
                        ? "Vérification..."
                        : isSubmitting
                          ? "Connexion..."
                          : "Se connecter"}
                    </AnimatedUIButton>
                  </div>
                </form>
              </motion.div>
            ) : step === "forgot-password" ? (
              <motion.div
                key="forgot-password-step"
                initial={{ opacity: 0, x: 34 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -34 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="mb-12"
              >
                <div className="mb-10">
                  <AnimatedUIButton
                    type="button"
                    variant="secondary"
                    icon="arrow-left"
                    onClick={returnToPasswordStep}
                    disabled={isRequestingPasswordReset}
                  >
                    Retour
                  </AnimatedUIButton>

                  <h1
                    className="mt-8 text-cobam-dark-blue mb-4 text-3xl font-bold sm:text-4xl"
                    style={{ fontFamily: "var(--font-playfair), serif" }}
                  >
                    Mot de passe oublié
                  </h1>
                </div>

                <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="forgot-email"
                      className="text-cobam-dark-blue ml-1 flex items-center gap-2 text-xs font-bold tracking-[0.1em] uppercase"
                    >
                      <Mail size={14} className="text-cobam-water-blue" />
                      Adresse e-mail
                    </label>

                    <input
                      id="forgot-email"
                      name="forgot-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={forgotPasswordEmail}
                      onChange={(event) => setForgotPasswordEmail(event.target.value)}
                      disabled={isRequestingPasswordReset}
                      className="text-cobam-dark-blue focus:border-cobam-water-blue focus:ring-cobam-water-blue/40 w-full rounded-lg border border-gray-200 bg-[#F8F9FA] px-5 py-4 text-sm shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all focus:bg-white focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="votre.nom@cobamgroup.com"
                    />
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg border border-red-100 bg-red-50 px-4 py-3"
                    >
                      <p className="text-center text-xs font-medium text-red-600">{error}</p>
                    </motion.div>
                  )}

                  <div className="flex justify-end pt-4">
                    <AnimatedUIButton
                      type="submit"
                      disabled={isRequestingPasswordReset}
                      variant="primary"
                      loading={isRequestingPasswordReset}
                      icon="paper-plane"
                      loadingText="Envoi..."
                    >
                      Envoyer le lien
                    </AnimatedUIButton>
                  </div>
                </form>
              </motion.div>
            ) : step === "forgot-password-info" ? (
              <motion.div
                key="forgot-password-info-step"
                initial={{ opacity: 0, x: 34 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -34 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="mb-12"
              >
                <div className="mb-10">
                  <AnimatedUIButton
                    type="button"
                    variant="secondary"
                    icon="arrow-left"
                    onClick={returnToPasswordStep}
                  >
                    Retour
                  </AnimatedUIButton>

                  <div className="mt-8">
                    <h1
                      className="text-cobam-dark-blue mb-4 text-3xl font-bold sm:text-4xl"
                      style={{ fontFamily: "var(--font-playfair), serif" }}
                    >
                      Vérifiez votre boîte mail
                    </h1>

                    <p className="text-cobam-carbon-grey text-sm leading-relaxed">
                      {forgotPasswordMessage}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <AnimatedUIButton
                    type="button"
                    variant="primary"
                    icon="arrow-right"
                    onClick={returnToPasswordStep}
                  >
                    Continuer
                  </AnimatedUIButton>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="otp-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="mb-12"
              >
                <OTPInput
                  email={email}
                  length={6}
                  disabled={isAuthenticating}
                  loading={isVerifyingOtp || isAuthenticating}
                  visualState={otpVisualState}
                  statusText={isAuthenticating ? "Authentification en cours..." : otpStatusText}
                  onVerify={handleOtpVerify}
                  onBack={() => {
                    setStep("password");
                    setPendingPassword("");
                    setError(null);
                    setOtpStatusText(null);
                    setOtpVisualState("idle");
                  }}
                  onResend={handleOtpResend}
                  resending={isResendingOtp}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
