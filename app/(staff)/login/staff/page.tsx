// /app/login/staff/page.tsx

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, HelpCircle } from "lucide-react";
import { staffApiFetch } from "@/lib/api/auth/staff/api-fetch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";


export default function StaffLoginPage() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
          router.replace("/espace/staff/accueil/tableau-de-bord");
          return;
        }
      } catch {
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkExistingSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);

      const email = String(formData.get("username") ?? "").trim();
      const password = String(formData.get("password") ?? "");

      const res = await fetch("/api/auth/staff/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Erreur de connexion");
      }

      localStorage.setItem("staff_access_token", data.accessToken);
      localStorage.setItem("staff_auth_user", JSON.stringify(data.user));

      router.replace("/espace/staff//accueil/tableau-de-bord");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <main className="min-h-screen bg-[#FDFDFD] flex flex-col lg:flex-row">
      {/* Left Side: Full Image */}
      <div className="hidden lg:block relative w-full lg:w-1/2 lg:fixed lg:inset-y-0 lg:left-0 min-h-[40vh] lg:min-h-screen bg-cobam-dark-blue flex flex-col justify-end overflow-hidden">
        
        {/* Go Back Button */}
        <div className="absolute top-6 left-6 lg:top-10 lg:left-10 z-50">
          <AnimatedUIButton
            href="/"
            variant="secondary"
            icon="arrow-left"
          >
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

        <div className="relative z-10 p-8 sm:p-12 lg:p-16 xl:p-24 flex flex-col justify-end h-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <p className="text-xs sm:text-sm font-bold tracking-[0.25em] uppercase text-cobam-water-blue mb-4">
              Portail privé
            </p>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Espace Team
            </h1>
            <p className="text-sm sm:text-base text-white/80 max-w-lg leading-relaxed font-light">
              Gérez le contenu du site, les produits et les marques depuis une
              interface dédiée aux équipes COBAM GROUP.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side: Form and FAQ */}
      <div className="w-full lg:w-1/2 lg:ml-auto min-h-screen flex flex-col py-12 px-6 sm:px-12 lg:px-16 xl:px-24 bg-white justify-center">
        <div className="max-w-md w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            className="mb-12"
          >
            <div className="mb-10">
              <h2
                className="text-3xl sm:text-4xl font-bold text-cobam-dark-blue mb-4"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Connexion
              </h2>
              <p className="text-sm text-cobam-carbon-grey leading-relaxed">
                Veuillez saisir vos identifiants professionnels pour accéder à
                votre tableau de bord.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="text-xs font-bold tracking-[0.1em] uppercase text-cobam-dark-blue flex items-center gap-2 ml-1"
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
                  className="w-full rounded-2xl border border-gray-200 bg-[#F8F9FA] px-5 py-4 text-sm text-cobam-dark-blue focus:outline-none focus:ring-2 focus:ring-cobam-water-blue/40 focus:border-cobam-water-blue focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                  placeholder="votre.nom@cobamgroup.com"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-xs font-bold tracking-[0.1em] uppercase text-cobam-dark-blue flex items-center gap-2 ml-1"
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
                  className="w-full rounded-2xl border border-gray-200 bg-[#F8F9FA] px-5 py-4 text-sm text-cobam-dark-blue focus:outline-none focus:ring-2 focus:ring-cobam-water-blue/40 focus:border-cobam-water-blue focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3"
                >
                  <p className="text-xs text-red-600 font-medium text-center">
                    {error}
                  </p>
                </motion.div>
              )}

              <div className="pt-4 flex justify-end">
                <AnimatedUIButton
                  type="submit"
                  disabled={isCheckingSession || isSubmitting}
                  variant="primary"
                  loading={isCheckingSession || isSubmitting}
                  icon="arrow-right"
                  loadingText={isCheckingSession ? "Vérification..." : "Connexion..."}
                >
                  {isCheckingSession ? "Vérification..." : isSubmitting ? "Connexion..." : "Se connecter"}
                </AnimatedUIButton>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
