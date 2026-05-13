export const ARTICLE_CATEGORY_PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
export type ArticleCategoryPageSize =
  (typeof ARTICLE_CATEGORY_PAGE_SIZE_OPTIONS)[number];

export type ArticleCategoryListQuery = {
  page: number;
  pageSize: ArticleCategoryPageSize;
  q?: string;
};

export type ArticleCategoryMutationInput = {
  name: string;
  slug: string;
  color: string;
};

export type ArticleCategoryDeleteOptions = {
  force?: boolean;
};

export type ArticleCategoryAbilitiesDto = {
  canDelete: boolean;
  canForceRemove: boolean;
  canEdit: boolean;
};

export type ArticleCategoryListItemDto = {
  id: number;
  name: string;
  slug: string;
  color: string;
  articleCount: number;
  createdByUserId: string | null;
  createdByLabel: string | null;
  createdAt: string;
  updatedAt: string;
  abilities: ArticleCategoryAbilitiesDto;
};

export type ArticleCategoryDetailDto = ArticleCategoryListItemDto;

export type ArticleCategoryOptionDto = {
  id: number;
  name: string;
  color: string;
};

export type ArticleCategoryDeleteResult = {
  detachedArticlesCount: number;
};

export type ArticleCategoryListResult = {
  items: ArticleCategoryListItemDto[];
  total: number;
  page: number;
  pageSize: number;
};
