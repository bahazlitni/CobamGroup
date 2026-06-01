"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion, type Transition, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Mail, UserPlus } from "lucide-react";

import {
  loginCustomerAction,
  registerCustomerAction,
  requestCustomerPasswordResetAction,
  verifyCustomerOtpAction,
} from "@/app/(login)/connexion/actions";
import { OtpInput } from "@/components/auth/otp-input";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";

type AuthMode = "login" | "register" | "forgot" | "forgot-sent" | "otp";

const MODE_ORDER: Record<AuthMode, number> = {
  login: 0,
  register: 1,
  forgot: 1,
  "forgot-sent": 2,
  otp: 1,
};

type CustomerAuthPanelProps = {
  mode: AuthMode;
  next: string;
  error?: string | null;
  otpEmail?: string | null;
  otpLength?: number;
  resetSuccess?: boolean;
};

const inputClass =
  "border-ec-line text-ec-ink placeholder:text-ec-muted/70 focus:border-ec-ink focus:ring-ec-ink/10 h-12 w-full border bg-white px-4 font-sans text-sm font-semibold outline-none transition focus:ring-4";
const labelClass = "text-ec-muted text-xs font-black uppercase tracking-[0.22em]";

function authHref(mode: AuthMode, next: string) {
  const params = new URLSearchParams({ mode });
  if (next !== "/compte/profil") {
    params.set("next", next);
  }
  return `/connexion?${params.toString()}`;
}

export function CustomerAuthPanel({
  mode,
  next,
  error,
  otpEmail,
  otpLength = 6,
  resetSuccess = false,
}: CustomerAuthPanelProps) {
  const reducedMotion = useReducedMotion();
  const transition: Transition = reducedMotion
    ? { duration: 0 }
    : { type: "spring", stiffness: 260, damping: 28 };
  const previousModeIndex = useRef(MODE_ORDER[mode]);
  const direction = MODE_ORDER[mode] >= previousModeIndex.current ? 1 : -1;

  useEffect(() => {
    previousModeIndex.current = MODE_ORDER[mode];
  }, [mode]);

  return (
    <div className="bg-white p-0">
      <div className="mb-8">
        <h2 className="text-ec-ink mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          {mode === "register"
            ? "Créer un accès"
            : mode === "forgot" || mode === "forgot-sent"
              ? "Réinitialiser"
              : mode === "otp"
                ? "Code de sécurité"
                : "Se connecter"}
        </h2>
      </div>

      {(error || resetSuccess) && mode !== "forgot-sent" && mode !== "otp" ? (
        <p
          className={`mb-5 border px-4 py-3 text-sm font-semibold leading-6 ${
            resetSuccess
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {resetSuccess ? "Votre mot de passe a été modifié. Vous pouvez vous connecter." : error}
        </p>
      ) : null}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          initial={{ opacity: 0, x: 32 * direction }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -32 * direction }}
          transition={transition}
        >
          {mode === "register" ? (
            <form action={registerCustomerAction} className="space-y-4">
              <input type="hidden" name="next" value={next} />
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className={labelClass}>Prénom</span>
                  <input name="firstName" autoComplete="given-name" required className={inputClass} />
                </label>
                <label className="space-y-2">
                  <span className={labelClass}>Nom</span>
                  <input name="lastName" autoComplete="family-name" required className={inputClass} />
                </label>
              </div>
              <label className="block space-y-2">
                <span className={labelClass}>Société</span>
                <input name="companyName" autoComplete="organization" className={inputClass} />
              </label>
              <label className="block space-y-2">
                <span className={labelClass}>Email</span>
                <input name="email" type="email" autoComplete="email" required className={inputClass} />
              </label>
              <label className="block space-y-2">
                <span className={labelClass}>Téléphone</span>
                <input name="phone" type="tel" autoComplete="tel" required className={inputClass} />
              </label>
              <label className="block space-y-2">
                <span className={labelClass}>Mot de passe</span>
                <PasswordInput name="password" autoComplete="new-password" required minLength={8} />
              </label>
              <Button type="submit" className="w-full" icon={<UserPlus className="size-4" />}>
                Créer mon compte
              </Button>
              <AuthSwitch href={authHref("login", next)}>J’ai déjà un compte</AuthSwitch>
            </form>
          ) : null}

          {mode === "login" ? (
            <form action={loginCustomerAction} className="space-y-4">
              <input type="hidden" name="next" value={next} />
              <label className="block space-y-2">
                <span className={labelClass}>Email</span>
                <input name="email" type="email" autoComplete="email" required className={inputClass} />
              </label>
              <label className="block space-y-2">
                <span className={labelClass}>Mot de passe</span>
                <PasswordInput name="password" autoComplete="current-password" required />
              </label>
              <div className="flex items-center justify-between gap-4">
                <Link href={authHref("forgot", next)} className="text-ec-muted hover:text-ec-ink text-sm font-semibold">
                  Mot de passe oublié ?
                </Link>
                <Link href={authHref("register", next)} className="text-ec-blue text-sm font-black">
                  Créer un compte
                </Link>
              </div>
              <Button type="submit" className="w-full" icon={<ArrowRight className="size-4" />}>
                Se connecter
              </Button>
            </form>
          ) : null}

          {mode === "forgot" ? (
            <form action={requestCustomerPasswordResetAction} className="space-y-5">
              <input type="hidden" name="next" value={next} />
              <p className="text-ec-muted text-sm leading-7">
                Saisissez l’email associé à votre compte. Nous vous envoyons un lien magique pour choisir un nouveau
                mot de passe.
              </p>
              <label className="block space-y-2">
                <span className={labelClass}>Email</span>
                <input name="email" type="email" autoComplete="email" required className={inputClass} />
              </label>
              <div className="grid gap-3 sm:grid-cols-[0.75fr_1.25fr]">
                <AuthSwitch href={authHref("login", next)} icon={<ArrowLeft className="size-4" />}>
                  Retour
                </AuthSwitch>
                <Button type="submit" className="w-full" icon={<Mail className="size-4" />}>
                  Envoyer le lien magique
                </Button>
              </div>
            </form>
          ) : null}

          {mode === "forgot-sent" ? (
            <div className="space-y-5">
              <div className="border-ec-line bg-ec-stone p-5">
                <Mail className="text-ec-blue size-6" />
                <p className="text-ec-ink mt-4 text-lg font-black">Vérifiez votre boîte mail.</p>
                <p className="text-ec-muted mt-2 text-sm leading-7">
                  Si votre email est correct, nous vous avons envoyé un lien magique.
                </p>
              </div>
              <Link
                href={authHref("login", next)}
                className="bg-ec-ink inline-flex h-12 w-full items-center justify-center border border-transparent px-5 text-sm font-semibold text-white transition hover:bg-ec-blue"
              >
                Continuer
              </Link>
            </div>
          ) : null}

          {mode === "otp" ? (
            <form action={verifyCustomerOtpAction} className="space-y-5">
              <input type="hidden" name="next" value={next} />
              {otpEmail ? <input type="hidden" name="email" value={otpEmail} /> : null}
              <p className="text-ec-muted text-sm leading-7">
                Nous avons envoyé un code de sécurité à {otpLength} chiffres à{" "}
                <strong className="text-ec-ink font-black">{otpEmail ?? "votre adresse email"}</strong>.
              </p>
              <OtpInput />
              <AuthSwitch href={authHref("login", next)} icon={<ArrowLeft className="size-4" />}>
                Retour
              </AuthSwitch>
            </form>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function AuthSwitch({
  href,
  children,
  icon,
}: {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="border-ec-line text-ec-ink hover:border-ec-ink hover:bg-ec-ink inline-flex h-12 w-full items-center justify-center gap-2 border bg-white px-5 text-sm font-black transition hover:text-white"
    >
      {icon}
      {children}
    </Link>
  );
}
