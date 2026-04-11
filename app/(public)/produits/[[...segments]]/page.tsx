import { notFound, redirect } from "next/navigation";
import PublicProductGrid from "@/components/public/products/public-product-grid";
import PublicProductInspectorView from "@/components/public/products/public-product-inspector";
import PublicSubcategoriesGrid from "@/components/public/products/public-subcategories-grid";
import PageHeader from "@/components/ui/custom/PageHeader";
import {
  findPublicProductSubcategoryBySlugs,
  findPublicRootProductCategoryBySlug,
  listPublicProductSubcategoryCardsByCategorySlug,
} from "@/features/product-categories/public";
import { resolvePublicProductBreadcrumb } from "@/features/products/public-breadcrumb";
import {
  findPublicSingleProductBySlug,
  listPublicProductsBySubcategory,
  PUBLIC_PRODUCTS_PAGE_SIZE,
} from "@/features/products/public";
import { withThemeAlpha } from "@/lib/theme-color";

export const dynamic = "force-dynamic";

type RouteParams = {
  segments?: string[];
};

type RouteSearchParams = {
  originPath?: string | string[];
};

export default async function ProductsCatchAllPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>;
  searchParams: Promise<RouteSearchParams>;
}) {
  const { segments = [] } = await params;
  const resolvedSearchParams = await searchParams;
  const originPath = Array.isArray(resolvedSearchParams.originPath)
    ? resolvedSearchParams.originPath[0]
    : resolvedSearchParams.originPath;

  if (segments.length === 0) {
    notFound();
  }

  if (segments.length === 3) {
    const [categorySlug, subcategorySlug, familySlug] = segments;

    redirect(
      `/produits/familles/${familySlug}?originPath=${encodeURIComponent(
        `${categorySlug}/${subcategorySlug}`,
      )}`,
    );
  }

  if (segments.length === 2) {
    const [categorySlug, subcategorySlug] = segments;
    const [subcategoryData, initialProducts] = await Promise.all([
      findPublicProductSubcategoryBySlugs({
        categorySlug,
        subcategorySlug,
      }),
      listPublicProductsBySubcategory({
        categorySlug,
        subcategorySlug,
        page: 1,
        pageSize: PUBLIC_PRODUCTS_PAGE_SIZE,
      }),
    ]);

    if (!subcategoryData) {
      notFound();
    }

    return (
      <main className="min-h-screen bg-cobam-light-bg text-cobam-dark-blue">
        <PageHeader
          subtitle={subcategoryData.parentName ?? "Produits"}
          title={subcategoryData.name}
          description={
            subcategoryData.descriptionSEO ||
            "Decouvrez cette sous-categorie de produits COBAM GROUP."
          }
          themeColor={subcategoryData.themeColor}
        />

        <section className="py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <PublicProductGrid
              categorySlug={categorySlug}
              subcategorySlug={subcategorySlug}
              initialResult={initialProducts}
              themeColor={subcategoryData.themeColor}
            />
          </div>
        </section>
      </main>
    );
  }

  const [singleSegment] = segments;
  const categoryData = await findPublicRootProductCategoryBySlug(singleSegment);

  if (categoryData) {
    const subcategories =
      await listPublicProductSubcategoryCardsByCategorySlug(singleSegment);

    return (
      <main className="min-h-screen bg-cobam-light-bg text-cobam-dark-blue">
        <PageHeader
          subtitle="Categorie"
          title={categoryData.name}
          description={
            categoryData.descriptionSEO ||
            "Decouvrez cette categorie de produits COBAM GROUP."
          }
          themeColor={categoryData.themeColor}
        />

        <section className="py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 space-y-2">
              <p
                className="text-sm font-semibold uppercase tracking-[0.24em]"
                style={{ color: categoryData.themeColor ?? undefined }}
              >
                Navigation produits
              </p>
              <h2
                className="text-3xl font-bold text-cobam-dark-blue"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Toutes les sous-categories
              </h2>
            </div>

            <div
              className="rounded-[32px] border p-6 sm:p-8"
              style={{
                borderColor: withThemeAlpha(categoryData.themeColor, 0.16),
                backgroundColor: withThemeAlpha(categoryData.themeColor, 0.04),
              }}
            >
              <PublicSubcategoriesGrid
                subcategories={subcategories}
                themeColor={categoryData.themeColor}
              />
            </div>
          </div>
        </section>
      </main>
    );
  }

  const productData = await findPublicSingleProductBySlug(singleSegment);

  if (!productData) {
    notFound();
  }

  const breadcrumb = await resolvePublicProductBreadcrumb({
    originPath,
    fallbackSubcategories: productData.subcategories,
  });

  return (
    <main className="min-h-screen bg-slate-50 text-cobam-dark-blue">
      <section className="py-10 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-[92rem] px-4 sm:px-6 lg:px-8">
          <PublicProductInspectorView
            product={productData}
            breadcrumb={breadcrumb}
          />
        </div>
      </section>
    </main>
  );
}
