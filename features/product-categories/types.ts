export const PRODUCT_CATEGORY_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export type ProductCategoryPageSize =
  (typeof PRODUCT_CATEGORY_PAGE_SIZE_OPTIONS)[number];

export type ProductCategoryListQuery = {
  page: number;
  pageSize: ProductCategoryPageSize;
  q?: string;
  tree?: boolean;
};

export type ProductCategoryCreateInput = {
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  descriptionSeo: string | null;
  imageMediaId: number | null;
  sortOrder: number;
  isActive: boolean;
  parentId: number | null;
};

export type ProductCategoryUpdateInput = ProductCategoryCreateInput;

export type ProductCategoryListItemDto = {
  id: number;
  name: string;
  subtitle: string | null;
  slug: string;
  description: string | null;
  descriptionSeo: string | null;
  imageMediaId: number | null;
  sortOrder: number;
  isActive: boolean;
  parentId: number | null;
  parentName: string | null;
  parentSlug: string | null;
  childCount: number;
  productModelCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductCategoryDetailDto = ProductCategoryListItemDto;

export type ProductCategoryParentOptionDto = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
};

export type ProductCategoryListResult = {
  items: ProductCategoryListItemDto[];
  total: number;
  page: number;
  pageSize: number;
};
