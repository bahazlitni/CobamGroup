import type {
  ProductBrandOptionDto,
  ProductCommercialMode,
  ProductLifecycleStatus,
  ProductMediaDto,
  ProductPageSize,
  ProductPriceVisibility,
  ProductSubcategoryOptionDto,
  ProductTagOptionDto,
  ProductVisibility,
} from "@/features/products/types";

export type ProductPackListQuery = {
  page: number;
  pageSize: ProductPageSize;
  q?: string;
};

export type ProductPackVariantSearchQuery = {
  q?: string;
  limit: number;
};

export type ProductPackLineInput = {
  productVariantId: number;
  quantity: number;
  sortOrder: number;
};

export type ProductPackCreateInput = {
  name: string;
  subtitle: string | null;
  description: string | null;
  descriptionSeo: string | null;
  mainImageMediaId: number | null;
  mediaIds: number[];
  lines: ProductPackLineInput[];
};

export type ProductPackUpdateInput = ProductPackCreateInput;

export type ProductPackVariantOptionDto = {
  id: number;
  familyId: number;
  familyName: string;
  familySlug: string;
  sku: string;
  slug: string | null;
  name: string | null;
  mainImage: ProductMediaDto | null;
  lifecycleStatus: ProductLifecycleStatus;
  visibility: ProductVisibility;
  commercialMode: ProductCommercialMode;
  priceVisibility: ProductPriceVisibility;
  basePriceAmount: string | null;
  vatRate: number;
  brand: ProductBrandOptionDto | null;
  productSubcategories: ProductSubcategoryOptionDto[];
  tags: ProductTagOptionDto[];
};

export type ProductPackComputedDto = {
  lifecycleStatus: ProductLifecycleStatus;
  visibility: ProductVisibility;
  commercialMode: ProductCommercialMode;
  priceVisibility: ProductPriceVisibility;
  priceUnit: "ITEM";
  basePriceAmount: string | null;
  vatRate: number;
  brands: ProductBrandOptionDto[];
  productSubcategories: ProductSubcategoryOptionDto[];
  tags: ProductTagOptionDto[];
  lineCount: number;
  totalQuantity: number;
};

export type ProductPackListItemDto = {
  id: number;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  mainImage: ProductMediaDto | null;
  computed: ProductPackComputedDto;
  createdAt: string;
  updatedAt: string;
};

export type ProductPackLineDto = {
  productVariantId: number;
  quantity: number;
  sortOrder: number;
  variant: ProductPackVariantOptionDto;
};

export type ProductPackDetailDto = ProductPackListItemDto & {
  descriptionSeo: string | null;
  media: ProductMediaDto[];
  lines: ProductPackLineDto[];
};

export type ProductPackListResult = {
  items: ProductPackListItemDto[];
  total: number;
  page: number;
  pageSize: number;
};
