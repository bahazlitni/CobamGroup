import type { Metadata } from "next";
import StructuredData from "@/components/seo/StructuredData";
import PageHeader from "@/components/ui/custom/PageHeader";
import PublicProductsIndex from "@/components/public/products/public-products-index";
import {
  listPublicProductsIndex,
  PUBLIC_PRODUCTS_INDEX_PAGE_SIZE,
} from "@/features/products/public";
import { findPublicPromotionSummaryBySlug } from "@/features/promotions/public";
import {
  buildAllProductsMetadata,
  buildCollectionPageStructuredData,
} from "@/features/products/seo";

export const dynamic = "force-dynamic";

type RouteSearchParams = {
  search?: string | string[];
  promo?: string | string[];
};

function resolveSearchParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<RouteSearchParams>;
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const search = resolveSearchParam(resolvedSearchParams.search)?.trim() ?? null;
  const promoSlug = resolveSearchParam(resolvedSearchParams.promo)?.trim() ?? null;
  const promotion = promoSlug ? await findPublicPromotionSummaryBySlug(promoSlug) : null;

  return buildAllProductsMetadata({
    search,
    promoSlug,
    promotion,
  });
}

export default async function ProductsIndexPage({
  searchParams,
}: {
  searchParams: Promise<RouteSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const search = resolveSearchParam(resolvedSearchParams.search)?.trim() ?? null;
  const promoSlug = resolveSearchParam(resolvedSearchParams.promo)?.trim() ?? null;
  const promotion = promoSlug ? await findPublicPromotionSummaryBySlug(promoSlug) : null;

  const initialResult = await listPublicProductsIndex({
    page: 1,
    pageSize: PUBLIC_PRODUCTS_INDEX_PAGE_SIZE,
    q: search,
    promoSlug,
  });

  const pageTitle = promotion
    ? `Produits en promotion : ${promotion.displayName}`
    : "Tous les produits";

  return (
    <main className="bg-cobam-light-bg text-cobam-dark-blue min-h-screen">
      <StructuredData
        data={buildCollectionPageStructuredData({
          name: search ? `Recherche produits : ${search}` : pageTitle,
          path:
            promoSlug && !search ? `/produits?promo=${encodeURIComponent(promoSlug)}` : "/produits",
          description: search
            ? `Résultats de recherche pour ${search} dans le catalogue COBAM GROUP.`
            : promotion
              ? `Produits concernés par la promotion ${promotion.displayName}.`
              : "Catalogue complet des produits COBAM GROUP.",
        })}
      />
      <PageHeader
        subtitle={promotion ? "Promotion" : "Catalogue"}
        title={pageTitle}
        description={
          promotion
            ? "Explorez les produits concernés par cette offre COBAM Group."
            : "Explorez tous nos produits."
        }
      />

      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <PublicProductsIndex
            initialResult={initialResult}
            initialSearch={search}
            promoSlug={promoSlug}
          />
        </div>
      </section>
    </main>
  );
}
