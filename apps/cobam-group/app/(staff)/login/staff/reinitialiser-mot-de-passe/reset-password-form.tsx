"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";

export default function StaffResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!token) {
      setError("Lien de reinitialisation manquant.");
      return;
    }

    if (newPassword !== confirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/staff/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        throw new Error(data?.message || "Lien invalide ou expire.");
      }

      setMessage("Mot de passe mis à jour. Redirection vers la connexion...");
      setNewPassword("");
      setConfirmation("");
      window.setTimeout(() => router.replace("/login/staff"), 900);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lien invalide ou expire.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FDFDFD] px-6 py-12">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_70px_rgba(7,31,52,0.10)] sm:p-10"
      >
        <p className="text-cobam-water-blue mb-3 text-xs font-bold tracking-[0.22em] uppercase">
          Espace Team
        </p>
        <h1 className="text-cobam-dark-blue text-3xl font-bold">Nouveau mot de passe</h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="new-password"
              className="text-cobam-dark-blue ml-1 flex items-center gap-2 text-xs font-bold tracking-[0.1em] uppercase"
            >
              <Lock size={14} className="text-cobam-water-blue" />
              Nouveau mot de passe
            </label>
            <input
              id="new-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              disabled={isSubmitting}
              className="text-cobam-dark-blue focus:border-cobam-water-blue focus:ring-cobam-water-blue/40 w-full rounded-lg border border-gray-200 bg-[#F8F9FA] px-5 py-4 text-sm transition-all focus:bg-white focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Minimum 8 caracteres"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirm-password"
              className="text-cobam-dark-blue ml-1 flex items-center gap-2 text-xs font-bold tracking-[0.1em] uppercase"
            >
              <Lock size={14} className="text-cobam-water-blue" />
              Confirmation
            </label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              disabled={isSubmitting}
              className="text-cobam-dark-blue focus:border-cobam-water-blue focus:ring-cobam-water-blue/40 w-full rounded-lg border border-gray-200 bg-[#F8F9FA] px-5 py-4 text-sm transition-all focus:bg-white focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Confirmez le mot de passe"
            />
          </div>

          {message ? (
            <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {message}
            </p>
          ) : null}

          {error ? (
            <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Link
              href="/login/staff"
              className="text-cobam-carbon-grey hover:text-cobam-water-blue text-sm font-semibold transition"
            >
              Retour
            </Link>

            <AnimatedUIButton
              type="submit"
              variant="primary"
              icon="arrow-right"
              iconPosition="left"
              disabled={isSubmitting || !token}
              loading={isSubmitting}
              loadingText="Mise à jour..."
            >
              Mettre à jour
            </AnimatedUIButton>
          </div>
        </form>
      </motion.section>
    </main>
  );
}
