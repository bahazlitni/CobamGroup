import type { Metadata } from "next";
import StructuredData from "@/components/seo/StructuredData";
import PageHeader from "@/components/ui/custom/PageHeader";
import PublicProductsIndex from "@/components/public/products/public-products-index";
import {
  listPublicProductsIndex,
  PUBLIC_PRODUCTS_INDEX_PAGE_SIZE,
} from "@/features/products/public";
import {
  buildAllProductsMetadata,
  buildCollectionPageStructuredData,
} from "@/features/products/seo";

export const dynamic = "force-dynamic";

type RouteSearchParams = {
  search?: string | string[];
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
  return buildAllProductsMetadata(search);
}

export default async function ProductsIndexPage({
  searchParams,
}: {
  searchParams: Promise<RouteSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const search = resolveSearchParam(resolvedSearchParams.search)?.trim() ?? null;

  const initialResult = await listPublicProductsIndex({
    page: 1,
    pageSize: PUBLIC_PRODUCTS_INDEX_PAGE_SIZE,
    q: search,
  });

  return (
    <main className="min-h-screen bg-cobam-light-bg text-cobam-dark-blue">
      <StructuredData
        data={buildCollectionPageStructuredData({
          name: search ? `Recherche produits : ${search}` : "Tous les produits",
          path: "/produits",
          description: search
            ? `Resultats de recherche pour ${search} dans le catalogue COBAM GROUP.`
            : "Catalogue complet des produits COBAM GROUP.",
        })}
      />
      <PageHeader
        subtitle="Catalogue"
        title="Tous les produits"
        description="Explorez tous nos produits."
      />

      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <PublicProductsIndex initialResult={initialResult} initialSearch={search} />
        </div>
      </section>
    </main>
  );
}
