import { notFound } from "next/navigation";
import PublicProductInspectorView from "@/components/public/products/public-product-inspector";
import { resolvePublicProductBreadcrumb } from "@/features/products/public-breadcrumb";
import { findPublicPackBySlug } from "@/features/products/public";

export const dynamic = "force-dynamic";

export default async function PublicPackPage({
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
  const pack = await findPublicPackBySlug(slug);

  if (!pack) {
    notFound();
  }

  const breadcrumb = await resolvePublicProductBreadcrumb({
    originPath,
    fallbackSubcategories: pack.subcategories,
  });

  return (
    <main className="min-h-screen bg-slate-50 text-cobam-dark-blue">
      <section className="py-10 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-[92rem] px-4 sm:px-6 lg:px-8">
          <PublicProductInspectorView product={pack} breadcrumb={breadcrumb} />
        </div>
      </section>
    </main>
  );
}
