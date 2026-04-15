import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StructuredData from "@/components/seo/StructuredData";
import PublicProductInspectorView from "@/components/public/products/public-product-inspector";
import { resolvePublicProductBreadcrumb } from "@/features/products/public-breadcrumb";
import { findPublicFamilyBySlug } from "@/features/products/public";
import {
  buildBreadcrumbStructuredData,
  buildFamilyMetadata,
  buildFamilyStructuredData,
} from "@/features/products/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const family = await findPublicFamilyBySlug(slug);

  if (!family) {
    return {
      title: "Produit introuvable | COBAM GROUP",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return buildFamilyMetadata(family);
}

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
  const path = `/produits/familles/${family.slug}`;

  return (
    <main className="min-h-screen bg-white text-cobam-dark-blue">
      <StructuredData
        data={[
          buildBreadcrumbStructuredData({
            breadcrumb,
            currentLabel: family.name,
            currentPath: path,
          }),
          buildFamilyStructuredData(family),
        ]}
      />
      <section className="py-10 sm:py-12 lg:py-20 border-t border-cobam-quill-grey/30">
        <div className="mx-auto max-w-[92rem] px-4 sm:px-6 lg:px-8">
          <PublicProductInspectorView product={family} breadcrumb={breadcrumb} />
        </div>
      </section>
    </main>
  );
}
