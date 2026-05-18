import type {
  MediaKind,
  ProductMediaRole,
  ProductLifecycle,
  ProductTypeAttributeInputType,
  StockUnit,
} from "@prisma/client";
import type { ProductEditFieldsDto } from "./product-edit-fields";

export type ProductMediaDto = {
  id: number;
  role: ProductMediaRole;
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
  id?: number;
  attributeDefId?: number | null;
  attributeGroupId?: number | null;
  kind: string;
  name?: string;
  label?: string;
  value: string;
  unit?: string | null;
  inputType?: ProductTypeAttributeInputType;
  selectOptions?: string[];
  isRequired?: boolean;
  isFilterable?: boolean;
  groupName?: string | null;
  groupSortOrder?: number;
  sortOrder?: number;
};

export type ProductVariantInputDto = ProductEditFieldsDto & {
  id?: number;
  productTypeId?: number | null;
  sku: string;
  slug: string;
  name: string;
  description: string | null;
  descriptionSeo: string | null;
  brand: string | null;
  lifecycle: ProductLifecycle;
  tags: string;
  subcategoryIds: number[];
  datasheet: ProductMediaDto | null;
  certificate: ProductMediaDto | null;
  media: ProductMediaDto[];
  attributes: ProductAttributeInputDto[];
};

export type ProductTypeAttributeOptionDto = {
  id: number;
  attributeDefinitionId: number;
  groupId: number | null;
  name: string;
  label: string;
  unit: string | null;
  inputType: ProductTypeAttributeInputType;
  selectOptions: string[];
  isRequired: boolean;
  isFilterable: boolean;
  groupName: string | null;
  groupSortOrder: number;
  sortOrder: number;
};

export type ProductTypeOptionDto = {
  id: number;
  groupId: number | null;
  groupName: string | null;
  groupSlug: string | null;
  name: string;
  displayName: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  hasColor?: boolean;
  hasFinish?: boolean;
  presetTags: string;
  presetSubcategoryIds: number[];
  presetStockUnit: StockUnit | null;
  presetVatRate: string | null;
  presetGuaranteeMonths: number | null;
  attributes: ProductTypeAttributeOptionDto[];
};

export type ProductTypeGroupOptionDto = {
  id: number | null;
  name: string;
  slug: string;
  sortOrder: number;
  productTypes: ProductTypeOptionDto[];
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
  brand: string | null;
  lifecycle: ProductLifecycle | null;
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
  productBrandOptions: string[];
  total: number;
  page: number;
  pageSize: number;
};

export type ProductFormOptionsDto = {
  productSubcategories: ProductSubcategoryOptionDto[];
  productTypeGroups: ProductTypeGroupOptionDto[];
  productBrandOptions: string[];
};

export type PublicProductEntityType = "FAMILY" | "SINGLE" | "VARIANT";

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
};

export type PublicProductListResult = {
  items: PublicProductSummary[];
  total: number;
  page: number;
  pageSize: number;
};

export type PublicProductIndexCategory = {
  id: number;
  name: string;
  slug: string;
  subtitle: string | null;
  themeColor: string | null;
  sortOrder: number;
  isPromoted: boolean;
};

export type PublicProductIndexSubcategory = {
  id: number;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  sortOrder: number;
  categoryId: number;
  categorySlug: string;
};

export type PublicProductIndexItem = {
  product: PublicProductSummary;
  category: PublicProductIndexCategory;
  subcategory: PublicProductIndexSubcategory;
};

export type PublicProductIndexResult = {
  items: PublicProductIndexItem[];
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
  imageUrl: string | null;
};

export type PublicProductBrand = {
  name: string;
  description: string | null;
};

export type PublicProductInspectorAttribute = {
  attributeId: string;
  kind: string;
  name: string;
  value: string;
  inputType: ProductTypeAttributeInputType;
  unit: string | null;
  groupName: string | null;
  groupSortOrder: number;
  sortOrder: number;
  specialType: "COLOR" | "FINISH" | null;
};

export type PublicProductInspectorVariant = {
  id: number;
  sku: string;
  slug: string;
  name: string;
  displayName: string;
  description: string | null;
  datasheet: PublicProductInspectorMedia | null;
  certificate: PublicProductInspectorMedia | null;
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
  brand: PublicProductBrand | null;
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
  kind: "SINGLE" | "VARIANT";
  sku: string;
  slug: string;
  name: string;
  displayName: string;
  description: string | null;
  descriptionSeo: string | null;
  brand: PublicProductBrand | null;
  brandNames: string[];
  media: PublicProductInspectorMedia[];
  datasheet: PublicProductInspectorMedia | null;
  certificate: PublicProductInspectorMedia | null;
  subcategories: PublicProductSubcategoryLink[];
  attributes: PublicProductInspectorAttribute[];
  colorReferences: PublicProductColorReference[];
  finishReferences: PublicProductFinishReference[];
};
