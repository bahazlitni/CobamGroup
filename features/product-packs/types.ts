import type {
  ProductCommercialMode,
  ProductLifecycleStatus,
  ProductMediaDto,
  ProductPriceVisibility,
  ProductSubcategoryOptionDto,
  ProductVisibility,
} from "@/features/products/types";

export const PRODUCT_PACK_PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
export type ProductPackPageSize = (typeof PRODUCT_PACK_PAGE_SIZE_OPTIONS)[number];

export const PRODUCT_PACK_OVERRIDE_MODE_OPTIONS = ["AUTO", "MANUAL"] as const;
export type ProductPackOverrideMode = (typeof PRODUCT_PACK_OVERRIDE_MODE_OPTIONS)[number];

export type ProductPackListQuery = {
  page: number;
  pageSize: ProductPackPageSize;
  q?: string;
};

export type ProductPackLineInput = {
  variantId: number;
  quantity: number;
  sortOrder: number;
};

export type ProductPackCreateInput = {
  name: string;
  sku: string;
  description: string | null;
  descriptionSeo: string | null;
  productSubcategoryIds: number[];
  commercialMode: ProductCommercialMode;
  lifecycleStatusMode: ProductPackOverrideMode;
  manualLifecycleStatus: ProductLifecycleStatus | null;
  visibilityMode: ProductPackOverrideMode;
  manualVisibility: ProductVisibility | null;
  priceVisibilityMode: ProductPackOverrideMode;
  manualPriceVisibility: ProductPriceVisibility | null;
  mainImageMediaId: number | null;
  mediaIds: number[];
  lines: ProductPackLineInput[];
};

export type ProductPackUpdateInput = ProductPackCreateInput;

export type ProductPackLineDto = {
  variantId: number;
  familyId: number;
  name: string;
  slug: string | null;
  sku: string;
  quantity: number;
  sortOrder: number;
};

export type ProductPackListItemDto = {
  id: number;
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
  priceUnit: "ITEM";
  vatRate: number;
  brandIds: number[];
  tags: string[];
  productSubcategories: ProductSubcategoryOptionDto[];
  lineCount: number;
  coverMediaId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductPackDetailDto = ProductPackListItemDto & {
  lifecycleStatusMode: ProductPackOverrideMode;
  manualLifecycleStatus: ProductLifecycleStatus | null;
  visibilityMode: ProductPackOverrideMode;
  manualVisibility: ProductVisibility | null;
  priceVisibilityMode: ProductPackOverrideMode;
  manualPriceVisibility: ProductPriceVisibility | null;
  mainImage: ProductMediaDto | null;
  media: ProductMediaDto[];
  lines: ProductPackLineDto[];
};

export type ProductPackListResult = {
  items: ProductPackListItemDto[];
  total: number;
  page: number;
  pageSize: number;
};
