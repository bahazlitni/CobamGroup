import type {
  MediaKind,
  ProductCommercialMode,
  ProductLifecycle,
  ProductStockUnit,
} from "@prisma/client";

export type ProductMediaDto = {
  id: number;
  kind: MediaKind;
  title: string | null;
  originalFilename: string | null;
  mimeType: string | null;
  altText: string | null;
  widthPx: number | null;
  heightPx: number | null;
  durationSeconds: string | null;
  sizeBytes: string | null;
  url: string;
  thumbnailUrl: string | null;
};

export type ProductSubcategoryOptionDto = {
  id: number;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  name: string;
  slug: string;
};

export type ProductAttributeInputDto = {
  kind: string;
  value: string;
};

export type ProductVariantInputDto = {
  id?: number;
  sku: string;
  slug: string;
  name: string;
  description: string | null;
  descriptionSeo: string | null;
  brandCode: string | null;
  basePriceAmount: string | null;
  vatRate: number | null;
  stock: string | null;
  stockUnit: ProductStockUnit | null;
  visibility: boolean;
  priceVisibility: boolean;
  stockVisibility: boolean;
  lifecycle: ProductLifecycle;
  commercialMode: ProductCommercialMode;
  tags: string;
  subcategoryIds: number[];
  datasheet: ProductMediaDto | null;
  media: ProductMediaDto[];
  attributes: ProductAttributeInputDto[];
};

export type ProductFamilyUpsertInput = {
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  descriptionSeo: string | null;
  mainImageMediaId: number | null;
  defaultVariantIndex: number;
  variants: ProductVariantInputDto[];
};

export type ProductFamilyListItemDto = {
  id: number;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  mainImageUrl: string | null;
  variantCount: number;
  defaultVariantSku: string | null;
  brandCode: string | null;
  basePriceAmount: string | null;
  stock: string | null;
  stockUnit: ProductStockUnit | null;
  subcategories: ProductSubcategoryOptionDto[];
  updatedAt: string;
};

export type ProductFamilyDetailDto = {
  id: number;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  descriptionSeo: string | null;
  mainImageMediaId: number | null;
  defaultVariantIndex: number;
  variants: ProductVariantInputDto[];
  createdAt: string;
  updatedAt: string;
};

export type ProductFamilyListResult = {
  items: ProductFamilyListItemDto[];
  total: number;
  page: number;
  pageSize: number;
};

export type ProductFormOptionsDto = {
  productSubcategories: ProductSubcategoryOptionDto[];
};

export type PublicProductEntityType = "FAMILY" | "PACK" | "SINGLE";

export type PublicProductSubcategoryLink = {
  id: number;
  name: string;
  slug: string;
  categorySlug: string;
  categoryName: string;
};

export type PublicProductSummary = {
  id: number;
  entityType: PublicProductEntityType;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  brandName: string | null;
  imageUrl: string | null;
  imageThumbnailUrl: string | null;
  imageAlt: string | null;
  price: string | null;
};

export type PublicProductListResult = {
  items: PublicProductSummary[];
  total: number;
  page: number;
  pageSize: number;
};

export type PublicProductInspectorMedia = {
  id: number;
  kind: MediaKind;
  url: string;
  thumbnailUrl: string | null;
  altText: string | null;
  title: string | null;
  mimeType: string | null;
};

export type PublicProductColorReference = {
  key: string;
  label: string;
  hexValue: string | null;
};

export type PublicProductFinishReference = {
  key: string;
  name: string;
  colorHex: string | null;
  mediaUrl: string | null;
  mediaThumbnailUrl: string | null;
};

export type PublicProductInspectorAttribute = {
  attributeId: string;
  kind: string;
  name: string;
  value: string;
  unit: string | null;
  specialType: "COLOR" | "FINISH" | null;
};

export type PublicProductInspectorVariant = {
  id: number;
  sku: string;
  slug: string;
  name: string;
  description: string | null;
  basePriceAmount: string | null;
  priceVisibility: boolean;
  commercialMode: ProductCommercialMode | null;
  media: PublicProductInspectorMedia[];
  attributes: PublicProductInspectorAttribute[];
};

export type PublicProductInspector = {
  id: number;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  descriptionSeo: string | null;
  brandName: string | null;
  coverMedia: PublicProductInspectorMedia | null;
  defaultVariantId: number | null;
  variants: PublicProductInspectorVariant[];
  subcategories: PublicProductSubcategoryLink[];
  colorReferences: PublicProductColorReference[];
  finishReferences: PublicProductFinishReference[];
};

export type PublicSimpleProductInspector = {
  id: number;
  kind: "PACK" | "SINGLE";
  sku: string;
  slug: string;
  name: string;
  description: string | null;
  descriptionSeo: string | null;
  brandNames: string[];
  media: PublicProductInspectorMedia[];
  basePriceAmount: string | null;
  priceVisibility: boolean;
  commercialMode: ProductCommercialMode | null;
  subcategories: PublicProductSubcategoryLink[];
  attributes: PublicProductInspectorAttribute[];
  colorReferences: PublicProductColorReference[];
  finishReferences: PublicProductFinishReference[];
};
