import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StructuredData from "@/components/seo/StructuredData";
import PublicProductInspectorView from "@/components/public/products/public-product-inspector";
import { findPublicProductSubcategoryBySlugs } from "@/features/product-categories/public";
import { findPublicFamilyBySlug } from "@/features/products/public";
import {
  buildBreadcrumbStructuredData,
  buildFamilyMetadata,
  buildFamilyStructuredData,
} from "@/features/products/seo";

export const dynamic = "force-dynamic";

type FamilyPageProps = {
  params: Promise<{ category: string; subcategory: string; slug: string }>;
};

export async function generateMetadata({
  params,
}: FamilyPageProps): Promise<Metadata> {
  const { category, subcategory, slug } = await params;
  const family = await findPublicFamilyBySlug(slug);

  if (!family) {
    return {
      title: "Famille introuvable | COBAM GROUP",
      robots: { index: false, follow: false },
    };
  }

  return buildFamilyMetadata(family, {
    path: `/produits/${category}/${subcategory}/famille/${slug}`,
  });
}

export default async function PublicFamilyPage({ params }: FamilyPageProps) {
  const { category, subcategory, slug } = await params;
  const [family, subcategoryData] = await Promise.all([
    findPublicFamilyBySlug(slug),
    findPublicProductSubcategoryBySlugs({
      categorySlug: category,
      subcategorySlug: subcategory,
    }),
  ]);

  if (!family || !subcategoryData) {
    notFound();
  }

  const breadcrumb = {
    categoryName: subcategoryData.parentName ?? "Produits",
    categorySlug: category,
    subcategoryName: subcategoryData.name,
    subcategorySlug: subcategory,
  };
  const path = `/produits/${category}/${subcategory}/famille/${family.slug}`;

  return (
    <main className="min-h-screen bg-white text-cobam-dark-blue">
      <StructuredData
        data={[
          buildBreadcrumbStructuredData({
            breadcrumb,
            currentLabel: family.name,
            currentPath: path,
          }),
          buildFamilyStructuredData(family, { path }),
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
