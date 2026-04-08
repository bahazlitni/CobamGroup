import type { ProductKind, ProductLifecycle } from "@prisma/client";

export type AllProductsListItemDto = {
  id: number;
  kind: ProductKind;
  sku: string;
  slug: string;
  name: string;
  description: string | null;
  brandCode: string | null;
  basePriceAmount: string | null;
  stock: string | null;
  stockUnit: string | null;
  hasImage: boolean;
  hasDatasheet: boolean;
  subcategories: {
    id: number;
    name: string;
    slug: string;
    categorySlug: string;
  }[];
  visibility: boolean | null;
  lifecycle: ProductLifecycle | null;
  updatedAt: string;
  family:
    | {
        id: number;
        name: string;
        slug: string;
      }
    | null;
};

export type AllProductsListResult = {
  items: AllProductsListItemDto[];
  total: number;
  page: number;
  pageSize: number;
};
