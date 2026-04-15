import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StructuredData from "@/components/seo/StructuredData";
import PublicProductInspectorView from "@/components/public/products/public-product-inspector";
import { resolvePublicProductBreadcrumb } from "@/features/products/public-breadcrumb";
import { findPublicPackBySlug } from "@/features/products/public";
import {
  buildBreadcrumbStructuredData,
  buildSimpleProductMetadata,
  buildSimpleProductStructuredData,
} from "@/features/products/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pack = await findPublicPackBySlug(slug);

  if (!pack) {
    return {
      title: "Pack introuvable | COBAM GROUP",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return buildSimpleProductMetadata(pack);
}

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
  const path = `/produits/packs/${pack.slug}`;

  return (
    <main className="min-h-screen bg-slate-50 text-cobam-dark-blue">
      <StructuredData
        data={[
          buildBreadcrumbStructuredData({
            breadcrumb,
            currentLabel: pack.name,
            currentPath: path,
          }),
          buildSimpleProductStructuredData(pack),
        ]}
      />
      <section className="py-10 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-[92rem] px-4 sm:px-6 lg:px-8">
          <PublicProductInspectorView product={pack} breadcrumb={breadcrumb} />
        </div>
      </section>
    </main>
  );
}
