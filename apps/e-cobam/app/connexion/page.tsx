import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, LockKeyhole, ShoppingBag, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCustomerSession } from "@/lib/customer-auth";
import { normalizeSearchParam } from "@/lib/format";
import { loginCustomerAction, registerCustomerAction } from "./actions";
import { redirect } from "next/navigation";

type LoginSearchParams = {
  mode?: string | string[];
  next?: string | string[];
  error?: string | string[];
};

type LoginPageProps = {
  searchParams: Promise<LoginSearchParams>;
};

export const metadata: Metadata = {
  title: "Connexion client",
  description: "Connectez-vous a votre espace client e-cobam.",
};

const inputClass =
  "h-12 w-full rounded-2xl border border-ec-line bg-white px-4 text-sm font-semibold text-ec-ink outline-none transition focus:border-ec-blue";
const labelClass = "text-xs font-bold uppercase tracking-[0.18em] text-ec-muted";

function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/compte";
}

function errorMessage(error: string | null) {
  if (error === "missing") {
    return "Completez les champs requis. Le mot de passe doit contenir au moins 8 caracteres.";
  }

  if (error === "exists") {
    return "Un compte existe deja avec cette adresse email.";
  }

  if (error === "invalid") {
    return "Email ou mot de passe invalide.";
  }

  return null;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getCustomerSession();
  const params = await searchParams;
  const mode = normalizeSearchParam(params.mode) === "register" ? "register" : "login";
  const next = safeNext(normalizeSearchParam(params.next));
  const error = errorMessage(normalizeSearchParam(params.error));

  if (session) {
    redirect(next);
  }

  return (
    <main className="commerce-container py-8 sm:py-12">
      <section className="overflow-hidden rounded-[2rem] bg-ec-ink text-white">
        <div className="grid min-h-[34rem] gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_480px] lg:p-10">
          <div className="flex flex-col justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-ec-blue">
                <LockKeyhole className="size-4" />
                Espace client
              </p>
              <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
                Votre espace prive COBAM.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/65">
                Connectez-vous pour retrouver vos commandes, adresses, informations de profil et
                preferences de paiement.
              </p>
            </div>
            <div className="mt-8 grid gap-3 text-sm font-semibold text-white/70 sm:grid-cols-3">
              <span className="rounded-2xl border border-white/10 p-4">Historique commandes</span>
              <span className="rounded-2xl border border-white/10 p-4">Adresses chantier</span>
              <span className="rounded-2xl border border-white/10 p-4">Paiements</span>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-white p-5 text-ec-ink shadow-2xl shadow-black/20">
            <div className="mb-5 grid grid-cols-2 rounded-full bg-ec-paper p-1 text-sm font-black">
              <Link
                href={`/connexion?mode=login${next !== "/compte" ? `&next=${encodeURIComponent(next)}` : ""}`}
                className={`rounded-full px-4 py-3 text-center transition ${
                  mode === "login" ? "bg-ec-ink text-white" : "text-ec-muted hover:text-ec-ink"
                }`}
              >
                Connexion
              </Link>
              <Link
                href={`/connexion?mode=register${next !== "/compte" ? `&next=${encodeURIComponent(next)}` : ""}`}
                className={`rounded-full px-4 py-3 text-center transition ${
                  mode === "register" ? "bg-ec-ink text-white" : "text-ec-muted hover:text-ec-ink"
                }`}
              >
                Création
              </Link>
            </div>

            {error ? (
              <p className="mb-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold leading-6 text-rose-700">
                {error}
              </p>
            ) : null}

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
                  <input
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className={inputClass}
                  />
                </label>
                <Button type="submit" className="w-full" icon={<UserPlus className="size-4" />}>
                  Creer mon compte
                </Button>
              </form>
            ) : (
              <form action={loginCustomerAction} className="space-y-4">
                <input type="hidden" name="next" value={next} />
                <label className="block space-y-2">
                  <span className={labelClass}>Email</span>
                  <input name="email" type="email" autoComplete="email" required className={inputClass} />
                </label>
                <label className="block space-y-2">
                  <span className={labelClass}>Mot de passe</span>
                  <input
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className={inputClass}
                  />
                </label>
                <Button type="submit" className="w-full" icon={<ArrowRight className="size-4" />}>
                  Se connecter
                </Button>
              </form>
            )}

            <Link
              href="/catalogue"
              className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-ec-muted hover:text-ec-ink"
            >
              <ShoppingBag className="size-4" />
              Continuer sans compte
            </Link>
            <Link
              href="/suivi-commande"
              className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-ec-muted hover:text-ec-ink"
            >
              Suivre une commande invite
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
