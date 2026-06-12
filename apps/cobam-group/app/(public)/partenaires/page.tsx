import type { Metadata } from "next";
import PageHeader from "@/components/ui/custom/PageHeader";
import { listPublicPartnerOrganizations } from "@/features/organizations/public";
import BrandsViews from "@/layout/BrandsViews";
import { buildSeoMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildSeoMetadata({
  title: "Partenaires",
  description:
    "Découvrez les partenaires de COBAM GROUP et les marques de référence distribuées pour vos projets.",
  path: "/partenaires",
});

export const dynamic = "force-dynamic";

export default async function PartnersPage() {
  const partners = await listPublicPartnerOrganizations();

  return (
    <main className="bg-cobam-light-bg text-cobam-dark-blue min-h-screen">
      <PageHeader
        title="Des marques d'exception, au coeur de chaque projet."
        subtitle="Nos Partenaires"
        description="COBAM GROUP s'entoure de partenaires internationaux pour garantir des gammes completes, fiables et esthetiques, du gros oeuvre aux finitions decoratives."
      />

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
          <BrandsViews brands={partners} />
        </div>
      </section>
    </main>
  );
}
