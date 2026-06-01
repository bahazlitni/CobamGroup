import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";

import { CustomerAuthPanel } from "@/components/auth/customer-auth-panel";
import { getCustomerSession } from "@/lib/customer-auth";
import { normalizeSearchParam } from "@/lib/format";

type LoginSearchParams = {
  mode?: string | string[];
  next?: string | string[];
  error?: string | string[];
  reset?: string | string[];
  email?: string | string[];
};

type LoginPageProps = {
  searchParams: Promise<LoginSearchParams>;
};

type AuthMode = "login" | "register" | "forgot" | "forgot-sent" | "otp";

export const metadata: Metadata = {
  title: "Connexion client",
  description: "Connectez-vous a votre espace client e-cobam.",
};

function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/compte/profil";
}

function parseMode(value: string | null): AuthMode {
  if (value === "register" || value === "forgot" || value === "forgot-sent" || value === "otp") {
    return value;
  }
  return "login";
}

function errorMessage(error: string | null) {
  if (error === "missing") {
    return "Complétez les champs requis. Le mot de passe doit contenir au moins 8 caractères.";
  }
  if (error === "exists") {
    return "Un compte existe déjà avec cette adresse email.";
  }
  if (error === "invalid") {
    return "Email ou mot de passe invalide.";
  }
  if (error === "otp-invalid") {
    return "Le code de sécurité est invalide.";
  }
  if (error === "otp-expired") {
    return "Le code de sécurité a expiré. Connectez-vous à nouveau.";
  }
  if (error === "email") {
    return "L’email n’a pas pu être envoyé. Vérifiez la configuration SMTP.";
  }
  return null;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getCustomerSession();
  const params = await searchParams;
  const mode = parseMode(normalizeSearchParam(params.mode));
  const next = safeNext(normalizeSearchParam(params.next));

  if (session && mode !== "forgot" && mode !== "forgot-sent") {
    redirect(next);
  }

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
          <div className="w-full max-w-[520px]">
            <div className="mb-10 lg:hidden">
              <p className="text-ec-blue text-xs font-black uppercase tracking-[0.28em]">Espace client</p>
              <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight tracking-tight">
                Connectez-vous pour commander.
              </h1>
            </div>
            <CustomerAuthPanel
              mode={mode}
              next={next}
              error={errorMessage(normalizeSearchParam(params.error))}
              otpEmail={normalizeSearchParam(params.email)}
              resetSuccess={normalizeSearchParam(params.reset) === "success"}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
