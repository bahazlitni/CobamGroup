import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StructuredData from "@/components/seo/StructuredData";
import PublicSubcategoriesGrid from "@/components/public/products/public-subcategories-grid";
import PageHeader from "@/components/ui/custom/PageHeader";
import {
  findPublicRootProductCategoryBySlug,
  listPublicProductSubcategoryCardsByCategorySlug,
} from "@/features/product-categories/public";
import {
  buildCategoryMetadata,
  buildCollectionPageStructuredData,
} from "@/features/products/seo";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryData = await findPublicRootProductCategoryBySlug(category);

  if (!categoryData) {
    return {
      title: "Categorie introuvable | COBAM GROUP",
      robots: { index: false, follow: false },
    };
  }

  return buildCategoryMetadata(categoryData);
}

export default async function ProductCategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryData = await findPublicRootProductCategoryBySlug(category);

  if (!categoryData) {
    notFound();
  }

  const subcategories =
    await listPublicProductSubcategoryCardsByCategorySlug(category);
  const path = `/produits/${category}`;

  return (
    <main className="min-h-screen bg-cobam-light-bg text-cobam-dark-blue">
      <StructuredData
        data={buildCollectionPageStructuredData({
          name: categoryData.name,
          path,
          description:
            categoryData.descriptionSEO ||
            "Decouvrez cette categorie de produits COBAM GROUP.",
        })}
      />
      <PageHeader
        subtitle="Categorie"
        title={categoryData.name}
        description={
          categoryData.descriptionSEO ||
          "Decouvrez cette categorie de produits COBAM GROUP."
        }
        themeColor={categoryData.themeColor}
      />

      <section className="py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="mb-12 space-y-4">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.4em]"
              style={{ color: categoryData.themeColor ?? undefined }}
            >
              Explorez les sous-categories
            </p>
            <h2
              className="text-3xl font-light text-cobam-dark-blue sm:text-4xl"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Toutes les sous-categories
            </h2>
            <div
              className="h-[1px] w-16"
              style={{ backgroundColor: categoryData.themeColor ?? "#0a8dc1" }}
            />
          </div>

          <PublicSubcategoriesGrid
            subcategories={subcategories}
            themeColor={categoryData.themeColor}
          />
        </div>
      </section>
    </main>
  );
}
