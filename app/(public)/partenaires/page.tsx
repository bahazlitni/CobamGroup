import type { Metadata } from "next";
import PageHeader from "@/components/ui/custom/PageHeader";
import BrandsViews from "@/layout/BrandsViews";
import { PARTNER_BRANDS } from "@/lib/static_tables/brands";

export const metadata: Metadata = {
  title: "Partenaires",
  description:
    "Decouvrez les partenaires de COBAM GROUP et les marques de reference distribuees pour vos projets.",
  alternates: {
    canonical: "/partenaires",
  },
};

export const dynamic = "force-dynamic";

export default async function PartnersPage() {
  return (
    <main className="min-h-screen bg-cobam-light-bg text-cobam-dark-blue">
      <PageHeader
        title="Des marques d'exception, au coeur de chaque projet."
        subtitle="Nos Partenaires"
        description="COBAM GROUP s'entoure de partenaires internationaux pour garantir des gammes completes, fiables et esthetiques, du gros oeuvre aux finitions decoratives."
      />

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
          <BrandsViews brands={PARTNER_BRANDS} />
        </div>
      </section>
    </main>
  );
}
