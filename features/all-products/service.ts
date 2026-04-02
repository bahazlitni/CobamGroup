import type { StaffSession } from "@/features/auth/types";
import { canAccessProducts } from "@/features/products/access";
import { mapAllProductToListItemDto } from "./mappers";
import { countAllProducts, listAllProducts } from "./list-repository";
import type { AllProductListQuery, AllProductListResult } from "./types";

export class AllProductServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function listAllProductsService(
  session: StaffSession,
  query: AllProductListQuery,
): Promise<AllProductListResult> {
  if (!canAccessProducts(session)) {
    throw new AllProductServiceError("Acces refuse.", 403);
  }

  const [items, total] = await Promise.all([
    listAllProducts(query),
    countAllProducts(query),
  ]);

  return {
    items: items.map(mapAllProductToListItemDto),
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
}
