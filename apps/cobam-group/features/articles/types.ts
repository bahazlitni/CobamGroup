export type {
  ArticleCTABannerAnchor,
  ArticleCTABannerHorizontalAspectRatio,
  ArticleStatus,
} from "@prisma/client";
import type {
  ArticleCTABannerAnchor,
  ArticleCTABannerHorizontalAspectRatio,
  ArticleStatus,
} from "@prisma/client";

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
  ctaBanners: ArticleCTABannerInput[];
};

export type ArticleUpdateInput = ArticleCreateInput;

export type ArticleCTABannerButtonInput = {
  text: string | null;
  iconCode: string | null;
  sortOrder: number;
  href: string | null;
};

export type ArticleCTABannerInput = {
  title: string;
  description: string | null;
  imageId: number | null;
  backgroundColor: string;
  horizontalAspectRatio: ArticleCTABannerHorizontalAspectRatio;
  anchor: ArticleCTABannerAnchor;
  approxPositionPercentage: number;
  href: string | null;
  buttons: ArticleCTABannerButtonInput[];
};

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

export type ArticleCTABannerButtonDto = ArticleCTABannerButtonInput & {
  id: number;
};

export type ArticleCTABannerDto = Omit<ArticleCTABannerInput, "buttons"> & {
  id: number;
  imageUrl?: string | null;
  imageThumbnailUrl?: string | null;
  imageAlt?: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
  buttons: ArticleCTABannerButtonDto[];
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
  scheduledPublishAt: string | null;
  scheduledByUserId: string | null;
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
  scheduledPublishAt: string | null;
  scheduledByUserId: string | null;
  coverMediaId: number | null;
  createdAt: string;
  updatedAt: string;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageMediaId: number | null;
  noIndex: boolean;
  noFollow: boolean;
  schemaType: string | null;
  ctaBanners: ArticleCTABannerDto[];
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
