import {
  ALL_PRODUCT_PAGE_SIZE_OPTIONS,
  ALL_PRODUCT_SOURCE_TYPE_OPTIONS,
  type AllProductListQuery,
  type AllProductPageSize,
} from "./types";

export class AllProductValidationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function parseAllProductListQuery(
  searchParams: URLSearchParams,
): AllProductListQuery {
  const pageRaw = Number(searchParams.get("page") ?? "1");
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const pageSizeRaw = Number(searchParams.get("pageSize") ?? "20");
  const pageSize = (
    ALL_PRODUCT_PAGE_SIZE_OPTIONS.includes(pageSizeRaw as AllProductPageSize)
      ? pageSizeRaw
      : 20
  ) as AllProductPageSize;

  const qRaw = searchParams.get("q");
  const q = qRaw?.trim() ? qRaw.trim() : undefined;

  const sourceTypeRaw = searchParams.get("sourceType");
  const sourceType =
    sourceTypeRaw && ALL_PRODUCT_SOURCE_TYPE_OPTIONS.includes(sourceTypeRaw as "VARIANT" | "PACK")
      ? (sourceTypeRaw as "VARIANT" | "PACK")
      : undefined;

  return {
    page,
    pageSize,
    q,
    sourceType,
  };
}
