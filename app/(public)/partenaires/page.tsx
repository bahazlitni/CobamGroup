import PageHeader from "@/components/ui/custom/PageHeader";
import { listPublicBrandsByPlacement } from "@/features/brands/public";
import BrandsViews from "@/layout/BrandsViews";

export const dynamic = "force-dynamic";

export default async function PartnersPage() {
  const brands = await listPublicBrandsByPlacement("PARTNER");

  return (
    <main className="min-h-screen bg-cobam-light-bg text-cobam-dark-blue">
      <PageHeader
        title="Des marques d’exception, au cœur de chaque projet."
        subtitle="Nos Partenaires"
        description="COBAM GROUP s'entoure de partenaires internationaux pour garantir des gammes complètes, fiables et esthétiques, du gros œuvre aux finitions décoratives."
      />

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
          <BrandsViews brands={brands} />
        </div>
      </section>
    </main>
  );
}
