import type {
  ProductCommercialMode,
  ProductKind,
  ProductLifecycle,
  ProductStockUnit,
} from "@prisma/client";

export type AllProductsListItemDto = {
  id: number;
  kind: ProductKind;
  sku: string;
  slug: string;
  name: string;
  description: string | null;
  brand: string | null;
  basePriceAmount: string | null;
  vatRate: number | null;
  stock: string | null;
  stockUnit: ProductStockUnit | null;
  hasImage: boolean;
  hasDatasheet: boolean;
  subcategories: {
    id: number;
    name: string;
    slug: string;
    categorySlug: string;
  }[];
  visibility: boolean | null;
  priceVisibility: boolean | null;
  stockVisibility: boolean | null;
  lifecycle: ProductLifecycle | null;
  commercialMode: ProductCommercialMode | null;
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
