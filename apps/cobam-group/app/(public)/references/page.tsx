import type { Metadata } from "next";
import PageHeader from "@/components/ui/custom/PageHeader";
import { listPublicReferenceOrganizations } from "@/features/organizations/public";
import BrandsViews from "@/layout/BrandsViews";
import { buildSeoMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildSeoMetadata({
  title: "Références",
  description:
    "Explorez les références et collaborations mises en avant par COBAM GROUP sur l'espace public.",
  path: "/references",
});

export const dynamic = "force-dynamic";

export default async function ReferencesPage() {
  const references = await listPublicReferenceOrganizations();

  return (
    <main className="bg-cobam-light-bg text-cobam-dark-blue min-h-screen">
      <PageHeader
        title="Des realisations et collaborations qui parlent pour nous."
        subtitle="Nos References"
        description="Découvrez les marques et références mises en avant par COBAM GROUP sur l'espace public."
      />

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
          <BrandsViews brands={references} />
        </div>
      </section>
    </main>
  );
}
