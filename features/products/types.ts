export const PRODUCT_PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
export type ProductPageSize = (typeof PRODUCT_PAGE_SIZE_OPTIONS)[number];

export type ProductListQuery = {
  page: number;
  pageSize: ProductPageSize;
  q?: string;
  brandId?: number;
  productCategoryId?: number;
};

export type ProductCreateInput = {
  brandId: number;
  productCategoryId: number;
  baseName: string;
  baseSlug: string;
  description: string | null;
  descriptionSeo: string | null;
  isActive: boolean;
  tagNames: string[];
};

export type ProductUpdateInput = ProductCreateInput;

export type ProductBrandOptionDto = {
  id: number;
  name: string;
  slug: string;
};

export type ProductCategoryOptionDto = {
  id: number;
  name: string;
  slug: string;
};

export type ProductTagOptionDto = {
  id: number;
  name: string;
  slug: string;
};

export type ProductFormOptionsDto = {
  brands: ProductBrandOptionDto[];
  productCategories: ProductCategoryOptionDto[];
};

export const EMPTY_PRODUCT_FORM_OPTIONS: ProductFormOptionsDto = {
  brands: [],
  productCategories: [],
};

export type ProductListItemDto = {
  id: number;
  baseName: string;
  baseSlug: string;
  description: string | null;
  isActive: boolean;
  brand: ProductBrandOptionDto;
  productCategory: ProductCategoryOptionDto;
  tagCount: number;
  variantCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductDetailDto = ProductListItemDto & {
  descriptionSeo: string | null;
  tags: ProductTagOptionDto[];
};

export type ProductListResult = {
  items: ProductListItemDto[];
  total: number;
  page: number;
  pageSize: number;
};
