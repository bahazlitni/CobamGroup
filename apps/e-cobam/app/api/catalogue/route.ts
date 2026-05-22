import { NextResponse } from "next/server";
import { listCommerceProducts } from "@/lib/commerce";
import { resolveCatalogFiltersFromSearchParams } from "@/lib/catalog-query";

export const runtime = "nodejs";

function parseOptionalPositiveInteger(value: string | null) {
  if (value == null) {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : null;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const filters = resolveCatalogFiltersFromSearchParams(url.searchParams);
    const searchLimit = parseOptionalPositiveInteger(
      url.searchParams.get("cap") ?? url.searchParams.get("limit"),
    );
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
      searchLimit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("ECOMMERCE_CATALOG_API_ERROR:", error);
    return NextResponse.json({ message: "Le catalogue n'a pas pu se charger." }, { status: 500 });
  }
}
