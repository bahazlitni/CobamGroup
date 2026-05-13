import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StructuredData from "@/components/seo/StructuredData";
import PublicProductGrid from "@/components/public/products/public-product-grid";
import PageHeader from "@/components/ui/custom/PageHeader";
import { findPublicProductSubcategoryBySlugs } from "@/features/product-categories/public";
import {
  listPublicProductsBySubcategory,
  PUBLIC_PRODUCTS_PAGE_SIZE,
} from "@/features/products/public";
import {
  buildBreadcrumbStructuredData,
  buildCategoryMetadata,
  buildCollectionPageStructuredData,
} from "@/features/products/seo";

export const dynamic = "force-dynamic";

type SubcategoryPageProps = {
  params: Promise<{ category: string; subcategory: string }>;
};

export async function generateMetadata({
  params,
}: SubcategoryPageProps): Promise<Metadata> {
  const { category, subcategory } = await params;
  const subcategoryData = await findPublicProductSubcategoryBySlugs({
    categorySlug: category,
    subcategorySlug: subcategory,
  });

  if (!subcategoryData) {
    return {
      title: "Sous-categorie introuvable | COBAM GROUP",
      robots: { index: false, follow: false },
    };
  }

  return buildCategoryMetadata(subcategoryData);
}

export default async function ProductSubcategoryPage({
  params,
}: SubcategoryPageProps) {
  const { category, subcategory } = await params;
  const [subcategoryData, initialProducts] = await Promise.all([
    findPublicProductSubcategoryBySlugs({
      categorySlug: category,
      subcategorySlug: subcategory,
    }),
    listPublicProductsBySubcategory({
      categorySlug: category,
      subcategorySlug: subcategory,
      page: 1,
      pageSize: PUBLIC_PRODUCTS_PAGE_SIZE,
    }),
  ]);

  if (!subcategoryData) {
    notFound();
  }

  const path = `/produits/${category}/${subcategory}`;

  return (
    <main className="min-h-screen bg-cobam-light-bg text-cobam-dark-blue">
      <StructuredData
        data={[
          buildBreadcrumbStructuredData({
            breadcrumb: {
              categoryName: subcategoryData.parentName ?? "Produits",
              categorySlug: category,
              subcategoryName: subcategoryData.name,
              subcategorySlug: subcategory,
            },
            currentLabel: subcategoryData.name,
            currentPath: path,
          }),
          buildCollectionPageStructuredData({
            name: subcategoryData.name,
            path,
            description:
              subcategoryData.descriptionSEO ||
              "Decouvrez cette sous-categorie de produits COBAM GROUP.",
          }),
        ]}
      />
      <PageHeader
        subtitle={subcategoryData.parentName ?? "Produits"}
        title={subcategoryData.name}
        description={
          subcategoryData.descriptionSEO ||
          "Decouvrez cette sous-categorie de produits COBAM GROUP."
        }
        themeColor={subcategoryData.themeColor}
      />

      <section className="py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <PublicProductGrid
            categorySlug={category}
            subcategorySlug={subcategory}
            initialResult={initialProducts}
            themeColor={subcategoryData.themeColor}
          />
        </div>
      </section>
    </main>
  );
}
