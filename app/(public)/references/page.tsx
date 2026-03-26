import PageHeader from "@/components/ui/custom/PageHeader";
import { listPublicBrandsByPlacement } from "@/features/brands/public";
import BrandsViews from "@/layout/BrandsViews";

export const dynamic = "force-dynamic";

export default async function ReferencesPage() {
  const brands = await listPublicBrandsByPlacement("REFERENCE");

  return (
    <main className="min-h-screen bg-cobam-light-bg text-cobam-dark-blue">
      <PageHeader
        title="Des réalisations et collaborations qui parlent pour nous."
        subtitle="Nos Références"
        description="Découvrez les marques et références mises en avant par COBAM GROUP sur l’espace public."
      />

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
          <BrandsViews brands={brands} />
        </div>
      </section>
    </main>
  );
}
