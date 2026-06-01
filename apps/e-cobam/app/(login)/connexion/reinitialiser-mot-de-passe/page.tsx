import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, KeyRound } from "lucide-react";

import { resetCustomerPasswordAction } from "@/app/(login)/connexion/actions";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { normalizeSearchParam } from "@/lib/format";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string | string[];
    error?: string | string[];
  }>;
};

export const metadata: Metadata = {
  title: "Nouveau mot de passe",
  description: "Choisissez un nouveau mot de passe.",
};

const labelClass = "text-ec-muted text-xs font-black uppercase tracking-[0.22em]";

function resetError(error: string | null) {
  if (error === "expired") {
    return "Ce lien n’est plus valide. Demandez un nouveau lien magique.";
  }
  if (error === "invalid") {
    return "Le mot de passe doit contenir au moins 8 caractères et correspondre à la confirmation.";
  }
  return null;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = normalizeSearchParam(params.token) ?? "";
  const error = resetError(normalizeSearchParam(params.error));

  return (
    <main className="min-h-screen bg-white text-ec-ink">
      <section className="grid min-h-screen bg-white lg:grid-cols-2">
        <div className="relative hidden overflow-hidden bg-ec-ink text-white lg:block">
          <Image
            src="/images/login/index.jpg"
            alt="Selection de produits COBAM pour l'espace client"
            fill
            priority
            sizes="50vw"
            className="object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ec-ink via-ec-ink/38 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-14 xl:p-20">
            <h1 className="max-w-2xl font-serif text-5xl font-semibold leading-[0.98] tracking-tight xl:text-7xl">
              Espace Client
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/72">
              Retrouvez vos commandes, vos favoris, vos adresses et vos achats récurrents dans un espace pensé pour les
              projets exigeants.
            </p>
          </div>
        </div>

        <div className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:px-16 xl:px-24">
          <form action={resetCustomerPasswordAction} className="w-full max-w-[520px]">
            <input type="hidden" name="token" value={token} />
            <h2 className="text-ec-ink font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Nouveau mot de passe
            </h2>
            {error ? (
              <p className="mt-5 border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold leading-6 text-rose-700">
                {error}
              </p>
            ) : null}
            <div className="mt-8 space-y-4">
              <label className="block space-y-2">
                <span className={labelClass}>Mot de passe</span>
                <PasswordInput name="password" autoComplete="new-password" required minLength={8} />
              </label>
              <label className="block space-y-2">
                <span className={labelClass}>Confirmation</span>
                <PasswordInput name="confirmation" autoComplete="new-password" required minLength={8} />
              </label>
            </div>
            <Button type="submit" className="mt-6 w-full" icon={<KeyRound className="size-4" />}>
              Modifier le mot de passe
            </Button>
            <Link
              href="/connexion"
              className="border-ec-line text-ec-ink hover:border-ec-ink hover:bg-ec-ink mt-3 inline-flex h-12 w-full items-center justify-center gap-2 border bg-white px-5 text-sm font-black transition hover:text-white"
            >
              <ArrowLeft className="size-4" />
              Retour connexion
            </Link>
          </form>
        </div>
      </section>
    </main>
  );
}
