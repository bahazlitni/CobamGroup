import { NextResponse } from "next/server";
import {
  listPublicProductsIndex,
  PUBLIC_PRODUCTS_INDEX_PAGE_SIZE,
} from "@/features/products/public";

class PublicAllProductsValidationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsedValue = value == null ? fallback : Number(value);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
}

function parseOptionalSlug(value: string | null) {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : null;
}

function parseOptionalSearchQuery(value: string | null) {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : null;
}

export async function GET(req: Request) {
  try {
    const searchParams = new URL(req.url).searchParams;
    const categorySlug = parseOptionalSlug(searchParams.get("category"));
    const subcategorySlug = parseOptionalSlug(searchParams.get("subcategory"));
    const page = parsePositiveInteger(searchParams.get("page"), 1);
    const pageSize = parsePositiveInteger(
      searchParams.get("pageSize"),
      PUBLIC_PRODUCTS_INDEX_PAGE_SIZE,
    );
    const q =
      parseOptionalSearchQuery(searchParams.get("search")) ??
      parseOptionalSearchQuery(searchParams.get("q"));

    const result = await listPublicProductsIndex({
      categorySlug,
      subcategorySlug,
      page,
      pageSize,
      q,
    });

    return NextResponse.json(
      {
        ok: true,
        items: result.items,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    if (error instanceof PublicAllProductsValidationError) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: error.status },
      );
    }

    console.error("PUBLIC_ALL_PRODUCTS_LIST_ERROR:", error);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
