import { notFound } from "next/navigation";
import PublicProductInspectorView from "@/components/public/products/public-product-inspector";
import { resolvePublicProductBreadcrumb } from "@/features/products/public-breadcrumb";
import { findPublicFamilyBySlug } from "@/features/products/public";

export const dynamic = "force-dynamic";

export default async function PublicFamilyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ originPath?: string | string[] }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const originPath = Array.isArray(resolvedSearchParams.originPath)
    ? resolvedSearchParams.originPath[0]
    : resolvedSearchParams.originPath;
  const family = await findPublicFamilyBySlug(slug);

  if (!family) {
    notFound();
  }

  const breadcrumb = await resolvePublicProductBreadcrumb({
    originPath,
    fallbackSubcategories: family.subcategories,
  });

  return (
    <main className="min-h-screen bg-white text-cobam-dark-blue">
      <section className="py-10 sm:py-12 lg:py-20 border-t border-cobam-quill-grey/30">
        <div className="mx-auto max-w-[92rem] px-4 sm:px-6 lg:px-8">
          <PublicProductInspectorView product={family} breadcrumb={breadcrumb} />
        </div>
      </section>
    </main>
  );
}
