import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Compte client",
  description: "Espace compte e-cobam.",
};

export default function AccountPage() {
  return (
    <main className="commerce-container py-14">
      <section className="mx-auto max-w-2xl rounded-[2rem] border border-ec-line bg-white p-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ec-blue">
          Compte client
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-ec-ink">
          L’espace compte arrive ensuite.
        </h1>
        <p className="mt-4 text-sm leading-7 text-ec-muted">
          Cette page réserve l’entrée UX pour les futures fonctionnalités de connexion, commandes,
          adresses et factures sans inventer de modèle client côté base de données.
        </p>
        <ButtonLink href="/catalogue" className="mt-7" variant="secondary">
          Retour au catalogue
        </ButtonLink>
      </section>
    </main>
  );
}
