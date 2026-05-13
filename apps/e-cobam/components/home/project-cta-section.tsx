import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";

export function ProjectCtaSection() {
  return (
    <section className="bg-[#f6f2ea] py-14 sm:py-18 lg:py-24">
      <div className="commerce-container">
        <div className="grid gap-8 rounded-[2rem] border border-ec-line bg-white p-6 shadow-[0_22px_70px_rgba(16,32,47,0.08)] sm:p-8 lg:grid-cols-[1.2fr_auto] lg:items-center lg:p-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ec-blue">
              Projet à préparer
            </p>
            <h2 className="mt-4 max-w-3xl text-3xl font-black tracking-tight text-ec-ink sm:text-5xl">
              Besoin de préparer un panier cohérent pour un chantier, une salle de bain ou une finition ?
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-ec-muted">
              Envoyez votre besoin au service COBAM. Le site sert de base de sélection, le devis
              permet ensuite de confirmer les références, quantités et disponibilités.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              href="mailto:contact@cobamgroup.com?subject=Demande%20de%20devis%20e-cobam"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-ec-ink px-6 text-base font-semibold text-white transition hover:bg-ec-blue"
            >
              Demander un devis
              <ClipboardList className="size-5" />
            </Link>
            <Link
              href="/catalogue"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-ec-line bg-white px-6 text-base font-semibold text-ec-ink transition hover:border-ec-blue/40 hover:bg-ec-blue/5"
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
