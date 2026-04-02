import type {
  ProductCommercialMode,
  ProductLifecycleStatus,
  ProductPriceUnit,
  ProductPriceVisibility,
  ProductVisibility,
} from "@/features/products/types";

export const ALL_PRODUCT_PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
export type AllProductPageSize = (typeof ALL_PRODUCT_PAGE_SIZE_OPTIONS)[number];

export const ALL_PRODUCT_SOURCE_TYPE_OPTIONS = ["VARIANT", "PACK"] as const;
export type AllProductSourceType = (typeof ALL_PRODUCT_SOURCE_TYPE_OPTIONS)[number];

export type AllProductListQuery = {
  page: number;
  pageSize: AllProductPageSize;
  q?: string;
  sourceType?: AllProductSourceType;
};

export type AllProductListItemDto = {
  id: number;
  sourceType: AllProductSourceType;
  sourceId: number;
  productFamilyId: number | null;
  productPackId: number | null;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  descriptionSeo: string | null;
  lifecycleStatus: ProductLifecycleStatus;
  visibility: ProductVisibility;
  commercialMode: ProductCommercialMode;
  priceVisibility: ProductPriceVisibility;
  basePriceAmount: string | null;
  priceUnit: ProductPriceUnit;
  vatRate: number;
  brandIds: number[];
  tags: string[];
  subcategoryIds: number[];
  coverMediaId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type AllProductListResult = {
  items: AllProductListItemDto[];
  total: number;
  page: number;
  pageSize: number;
};
