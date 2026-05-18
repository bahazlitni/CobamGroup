import type { Metadata } from "next";
import { CatalogBrowser } from "@/components/commerce/catalog-browser";
import { listCommerceProducts } from "@/lib/commerce";
import {
  type CatalogSearchParams,
  resolveCatalogFilters,
} from "@/lib/catalog-query";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catalogue",
  description: "Explorez le catalogue e-commerce COBAM GROUP.",
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  const filters = resolveCatalogFilters(await searchParams);
  const result = await listCommerceProducts({
    category: filters.category,
    brand: filters.brand,
    search: filters.search,
    sort: filters.sort,
    availability: filters.availability,
    promotedOnly: filters.promotedOnly,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    page: filters.page,
  });

  return (
    <main className="commerce-container py-8 sm:py-10 lg:py-14">
      <CatalogBrowser initialResult={result} initialFilters={filters} />
    </main>
  );
}
