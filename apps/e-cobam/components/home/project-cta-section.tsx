import Link from "next/link";
import { getMailtoHref } from "@cobam/shared";
import { ArrowRight, ClipboardList } from "lucide-react";

export function ProjectCtaSection() {
  return (
    <section className="bg-ec-paper py-14 sm:py-18 lg:py-24">
      <div className="commerce-container">
        <div className="border-ec-line grid gap-8 rounded-[2rem] border bg-white p-6 shadow-[0_22px_70px_rgba(16,32,47,0.08)] sm:p-8 lg:grid-cols-[1.2fr_auto] lg:items-center lg:p-10">
          <div>
            <p className="text-ec-blue text-sm font-semibold tracking-[0.24em] uppercase">
              Projet à préparer
            </p>
            <h2 className="text-ec-ink mt-4 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
              Besoin de préparer un panier cohérent pour un chantier, une salle de bain ou une
              finition ?
            </h2>
            <p className="text-ec-muted mt-5 max-w-2xl text-sm leading-7">
              Envoyez votre besoin au service COBAM. Le site sert de base de sélection, le devis
              permet ensuite de confirmer les références, quantités et disponibilités.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              href={getMailtoHref({ subject: "Demande de devis e-cobam" })}
              className="bg-ec-ink hover:bg-ec-blue inline-flex h-14 items-center justify-center gap-2 rounded-full px-6 text-base font-semibold text-white transition"
            >
              Demander un devis
              <ClipboardList className="size-5" />
            </Link>
            <Link
              href="/catalogue"
              className="border-ec-line text-ec-ink hover:border-ec-blue/40 hover:bg-ec-blue/5 inline-flex h-14 items-center justify-center gap-2 rounded-full border bg-white px-6 text-base font-semibold transition"
            >
              Continuer le catalogue
              <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
