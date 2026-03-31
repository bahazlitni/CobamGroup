export const PRODUCT_PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
export type ProductPageSize = (typeof PRODUCT_PAGE_SIZE_OPTIONS)[number];
export const PRODUCT_LIFECYCLE_STATUS_OPTIONS = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;
export type ProductLifecycleStatus = (typeof PRODUCT_LIFECYCLE_STATUS_OPTIONS)[number];

export const PRODUCT_VISIBILITY_OPTIONS = ["HIDDEN", "PUBLIC"] as const;
export type ProductVisibility = (typeof PRODUCT_VISIBILITY_OPTIONS)[number];
export const PRODUCT_COMMERCIAL_MODE_OPTIONS = [
  "REFERENCE_ONLY",
  "QUOTE_ONLY",
  "SELLABLE",
] as const;
export type ProductCommercialMode = (typeof PRODUCT_COMMERCIAL_MODE_OPTIONS)[number];

export const PRODUCT_PRICE_VISIBILITY_OPTIONS = ["HIDDEN", "VISIBLE"] as const;
export type ProductPriceVisibility = (typeof PRODUCT_PRICE_VISIBILITY_OPTIONS)[number];
export const PRODUCT_PRICE_UNIT_OPTIONS = [
  "ITEM",
  "MILLIGRAM",
  "GRAM",
  "KILOGRAM",
  "MILLILITER",
  "CENTILITER",
  "LITER",
  "CUBIC_METER",
  "MILLIMETER",
  "CENTIMETER",
  "METER",
  "SQUARE_METER",
] as const;
export type ProductPriceUnit = (typeof PRODUCT_PRICE_UNIT_OPTIONS)[number];
export const PRODUCT_ATTRIBUTE_DATA_TYPE_OPTIONS = ["TEXT", "NUMBER", "BOOLEAN"] as const;
export type ProductAttributeDataType = (typeof PRODUCT_ATTRIBUTE_DATA_TYPE_OPTIONS)[number];

export type ProductListQuery = {
  page: number;
  pageSize: ProductPageSize;
  q?: string;
  brandId?: number;
  productSubcategoryId?: number;
};

export type ProductCreateInput = {
  brandId: number | null;
  productSubcategoryIds: number[];
  mainImageMediaId: number | null;
  name: string;
  subtitle: string | null;
  description: string | null;
  descriptionSeo: string | null;
  priceUnit: ProductPriceUnit;
  vatRate: number;
  tagNames: string[];
  attributes: ProductAttributeInput[];
  variants: ProductVariantInput[];
};

export type ProductUpdateInput = ProductCreateInput;

export type ProductVariantInput = {
  id?: number | null;
  sku: string;
  name: string;
  description: string;
  descriptionSeo: string;
  lifecycleStatus: ProductLifecycleStatus | null;
  visibility: ProductVisibility | null;
  commercialMode: ProductCommercialMode | null;
  priceVisibility: ProductPriceVisibility | null;
  basePriceAmount: string | null;
  sortOrder: number;
  mediaIds: number[];
  attributeValues: ProductVariantAttributeValueInput[];
};

export type ProductAttributeInput = {
  tempKey: string;
  id?: number | null;
  name: string;
  dataType: ProductAttributeDataType;
  unit: string | null;
  sortOrder: number;
};

export type ProductVariantAttributeValueInput = {
  attributeId?: number | null;
  attributeTempKey?: string | null;
  value: string | null;
};

export type ProductBrandOptionDto = {
  id: number;
  name: string;
  slug: string;
};

export type ProductSubcategoryOptionDto = {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
};

export type ProductTagOptionDto = {
  id: number;
  name: string;
  slug: string;
};

export type ProductMediaDto = {
  id: number;
  kind: "IMAGE" | "VIDEO" | "DOCUMENT";
  title: string | null;
  originalFilename: string | null;
  altText: string | null;
  mimeType: string | null;
  extension: string | null;
  widthPx: number | null;
  heightPx: number | null;
  sizeBytes: number | null;
};

export type ProductFormOptionsDto = {
  brands: ProductBrandOptionDto[];
  productSubcategories: ProductSubcategoryOptionDto[];
};

export const EMPTY_PRODUCT_FORM_OPTIONS: ProductFormOptionsDto = {
  brands: [],
  productSubcategories: [],
};

export type ProductListItemDto = {
  id: number;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  lifecycleStatus: ProductLifecycleStatus;
  visibility: ProductVisibility;
  commercialMode: ProductCommercialMode;
  priceVisibility: ProductPriceVisibility;
  priceUnit: ProductPriceUnit;
  vatRate: number;
  basePriceAmount: string | null;
  effectivePriceAmount: string | null;
  brand: ProductBrandOptionDto | null;
  productSubcategories: ProductSubcategoryOptionDto[];
  tagCount: number;
  variantCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductDetailDto = ProductListItemDto & {
  descriptionSeo: string | null;
  mainImage: ProductMediaDto | null;
  tags: ProductTagOptionDto[];
  attributes: ProductAttributeDto[];
  defaultVariantId: number | null;
  variants: ProductVariantDto[];
};

export type ProductAttributeDto = {
  id: number;
  name: string;
  slug: string;
  key: string;
  dataType: ProductAttributeDataType;
  unit: string | null;
  sortOrder: number;
};

export type ProductVariantDto = {
  id: number;
  sku: string;
  slug: string | null;
  name: string | null;
  description: string | null;
  descriptionSeo: string | null;
  lifecycleStatus: ProductLifecycleStatus | null;
  visibility: ProductVisibility | null;
  commercialMode: ProductCommercialMode | null;
  priceVisibility: ProductPriceVisibility | null;
  basePriceAmount: string | null;
  effectiveLifecycleStatus: ProductLifecycleStatus;
  effectiveVisibility: ProductVisibility;
  effectiveCommercialMode: ProductCommercialMode;
  effectivePriceVisibility: ProductPriceVisibility;
  effectiveBasePriceAmount: string | null;
  effectivePriceAmount: string | null;
  sortOrder: number;
  media: ProductMediaDto[];
  attributeValues: ProductVariantAttributeValueDto[];
  createdAt: string;
  updatedAt: string;
};

export type ProductVariantAttributeValueDto = {
  attributeId: number;
  value: string | null;
};

export type ProductListResult = {
  items: ProductListItemDto[];
  total: number;
  page: number;
  pageSize: number;
};
