import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import StructuredData from "@/components/seo/StructuredData";
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
import {
  buildBreadcrumbStructuredData,
  buildCategoryMetadata,
  buildCollectionPageStructuredData,
  buildSimpleProductMetadata,
  buildSimpleProductStructuredData,
} from "@/features/products/seo";
import StaticHighway from "@/components/ui/custom/StaticHighway";

export const dynamic = "force-dynamic";

type RouteParams = {
  segments?: string[];
};

type RouteSearchParams = {
  originPath?: string | string[];
};

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { segments = [] } = await params;

  if (segments.length === 0) {
    return {
      title: "Produits | COBAM GROUP",
      robots: { index: false, follow: false },
    };
  }

  if (segments.length === 2) {
    const [categorySlug, subcategorySlug] = segments;
    const subcategory = await findPublicProductSubcategoryBySlugs({
      categorySlug,
      subcategorySlug,
    });

    if (!subcategory) {
      return {
        title: "Sous-categorie introuvable | COBAM GROUP",
        robots: { index: false, follow: false },
      };
    }

    return buildCategoryMetadata(subcategory);
  }

  const [singleSegment] = segments;
  const category = await findPublicRootProductCategoryBySlug(singleSegment);
  if (category) {
    return buildCategoryMetadata(category);
  }

  const product = await findPublicSingleProductBySlug(singleSegment);
  if (product) {
    return buildSimpleProductMetadata(product);
  }

  return {
    title: "Produit introuvable | COBAM GROUP",
    robots: { index: false, follow: false },
  };
}

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

    const path = `/produits/${categorySlug}/${subcategorySlug}`;

    return (
      <main className="min-h-screen bg-cobam-light-bg text-cobam-dark-blue">
        <StructuredData
          data={[
            buildBreadcrumbStructuredData({
              breadcrumb: {
                categoryName: subcategoryData.parentName ?? "Produits",
                categorySlug,
                subcategoryName: subcategoryData.name,
                subcategorySlug,
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
    const path = `/produits/${singleSegment}`;

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
                Explorez les sous-catégories
              </p>
              <h2
                className="text-3xl font-light text-cobam-dark-blue sm:text-4xl"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Toutes les sous-catégories
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

  const productData = await findPublicSingleProductBySlug(singleSegment);

  if (!productData) {
    notFound();
  }

  const breadcrumb = await resolvePublicProductBreadcrumb({
    originPath,
    fallbackSubcategories: productData.subcategories,
  });
  const path = `/produits/${productData.slug}`;

  return (
    <main className="relative min-h-screen bg-white text-cobam-dark-blue">
      <StructuredData
        data={[
          buildBreadcrumbStructuredData({
            breadcrumb,
            currentLabel: productData.name,
            currentPath: path,
          }),
          buildSimpleProductStructuredData(productData),
        ]}
      />
      <StaticHighway direction="left" />
      <section className="py-10 sm:py-12 lg:py-20 border-t border-cobam-quill-grey/30">
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
