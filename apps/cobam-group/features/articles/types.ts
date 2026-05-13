export type { ArticleStatus } from "@prisma/client";
import type { ArticleStatus } from "@prisma/client";

export const ARTICLE_PAGE_SIZE_OPTIONS = [8, 12, 16, 20] as const;
export type ArticlePageSize = (typeof ARTICLE_PAGE_SIZE_OPTIONS)[number];

export type ArticleStatusType = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type ArticleListQuery = {
  page: number;
  pageSize: ArticlePageSize;
  status?: ArticleStatus;
  q?: string;
};

export type ArticleCreateInput = {
  title: string;
  displayTitle: string | null;
  slug: string;
  excerpt: string | null;
  content: string;
  descriptionSeo: string | null;
  categoryAssignments: ArticleCategoryAssignmentInput[];
  tagNames: string[];
  coverMediaId: number | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageMediaId: number | null;
  noIndex: boolean;
  noFollow: boolean;
  schemaType: string | null;
  authorIds: string[];
};

export type ArticleUpdateInput = ArticleCreateInput;

export type ArticleCategoryAssignmentInput = {
  categoryId: number;
  score: number;
};

export type ArticleCategoryAssignmentDto = {
  categoryId: number;
  name: string;
  color: string;
  score: number;
};

export type ArticleTagDto = {
  name: string;
  slug: string;
};

export type ArticleAuthorDto = {
  id: string;
  email: string;
  name: string | null;
  status: string;
  powerType: string;
  roleLabel: string;
  roleColor: string | null;
  isOriginalAuthor: boolean;
};

export type ArticleAssignableAuthorDto = {
  id: string;
  email: string;
  name: string | null;
  status: string;
  powerType: string;
  roleLabel: string;
  roleColor: string | null;
};

export type ArticleAbilitiesDto = {
  canEdit: boolean;
  canManageAuthors: boolean;
  canPublish: boolean;
  canDelete: boolean;
};

export type ArticleAuthorOptionsQuery = {
  articleId: number | null;
  q?: string;
};

export type ArticleListItemDto = {
  id: number;
  title: string;
  slug: string;
  status: ArticleStatus;
  publishedAt: string | null;
  updatedAt: string;
  author: {
    id: string;
    email: string;
    name: string | null;
  };
  authors: ArticleAuthorDto[];
  categories: ArticleCategoryAssignmentDto[];
};

export type ArticleDetailDto = {
  id: number;
  authorId: string;
  authors: ArticleAuthorDto[];
  categories: ArticleCategoryAssignmentDto[];
  tags: ArticleTagDto[];
  title: string;
  displayTitle: string | null;
  slug: string;
  excerpt: string | null;
  content: string;
  descriptionSeo: string | null;
  status: ArticleStatus;
  publishedAt: string | null;
  coverMediaId: number | null;
  createdAt: string;
  updatedAt: string;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageMediaId: number | null;
  noIndex: boolean;
  noFollow: boolean;
  schemaType: string | null;
  abilities: ArticleAbilitiesDto;
};

export type ArticleListResult = {
  items: ArticleListItemDto[];
  total: number;
  page: number;
  pageSize: number;
};

export type ArticleAuthorOptionsResult = {
  items: ArticleAssignableAuthorDto[];
};
