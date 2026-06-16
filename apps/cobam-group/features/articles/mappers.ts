import type { Article } from "@prisma/client";
import { resolveAccessFromAssignments } from "@/features/rbac/user-access";
import { parseOwnedTagString } from "@/features/tags/owned";
import { slugify } from "@/lib/slugify";
import type {
  ArticleAbilitiesDto,
  ArticleCategoryAssignmentDto,
  ArticleCTABannerDto,
  ArticleAssignableAuthorDto,
  ArticleAuthorDto,
  ArticleDetailDto,
  ArticleListItemDto,
  ArticleTagDto,
} from "./types";

function toIsoString(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

type ArticleAuthorRecord = {
  id: string;
  email: string;
  powerType: string;
  status: string;
  profile: { firstName: string | null; lastName: string | null } | null;
  receivedRoleAssignments: Array<{
    role: {
      id: bigint;
      key: string;
      name: string;
      color: string;
      priorityIndex: number;
      description: string | null;
      isActive: boolean;
      createdAt?: Date;
      updatedAt?: Date;
      permissionLinks?: Array<{
        allowed: boolean;
        permission: { key: string };
      }>;
    };
  }>;
};

function getAuthorName(author: {
  email: string;
  profile: { firstName: string | null; lastName: string | null } | null;
}) {
  const nameParts = [
    author.profile?.firstName?.trim() ?? "",
    author.profile?.lastName?.trim() ?? "",
  ].filter(Boolean);

  return nameParts.length > 0 ? nameParts.join(" ") : null;
}

export function mapAuthorRecordToDto(
  author: ArticleAuthorRecord,
  isOriginalAuthor: boolean,
): ArticleAuthorDto {
  const access = resolveAccessFromAssignments({
    powerType: author.powerType as "ROOT" | "ADMIN" | "USER",
    status: author.status,
    assignments: author.receivedRoleAssignments,
  });

  return {
    id: author.id,
    email: author.email,
    name: getAuthorName(author),
    status: author.status,
    powerType: author.powerType,
    roleLabel: access.roleLabel,
    roleColor: access.roleColor,
    isOriginalAuthor,
  };
}

export function mapAuthorRecordToAssignableDto(
  author: ArticleAuthorRecord,
): ArticleAssignableAuthorDto {
  const access = resolveAccessFromAssignments({
    powerType: author.powerType as "ROOT" | "ADMIN" | "USER",
    status: author.status,
    assignments: author.receivedRoleAssignments,
  });

  return {
    id: author.id,
    email: author.email,
    name: getAuthorName(author),
    status: author.status,
    powerType: author.powerType,
    roleLabel: access.roleLabel,
    roleColor: access.roleColor,
  };
}

function mapArticleAuthors(article: {
  author: ArticleAuthorRecord;
  authorLinks: Array<{
    userId: string;
    user: ArticleAuthorRecord;
  }>;
}) {
  const authors = [
    mapAuthorRecordToDto(article.author, true),
    ...article.authorLinks.map((link) => mapAuthorRecordToDto(link.user, false)),
  ];

  const seenIds = new Set<string>();

  return authors.filter((author) => {
    if (seenIds.has(author.id)) {
      return false;
    }

    seenIds.add(author.id);
    return true;
  });
}

function mapArticleCategories(article: {
  categoryLinks: Array<{
    categoryId: bigint;
    score: number;
    category: {
      id: bigint;
      name: string;
      color: string;
    };
  }>;
}): ArticleCategoryAssignmentDto[] {
  return article.categoryLinks.map((link) => ({
    categoryId: Number(link.categoryId),
    name: link.category.name,
    color: link.category.color,
    score: link.score,
  }));
}

function mapArticleTags(article: {
  tags: string;
}): ArticleTagDto[] {
  return parseOwnedTagString(article.tags).map((name) => ({
    name,
    slug: slugify(name),
  }));
}

function mapArticleCtaBanners(article: {
  ctaBanners?: Array<{
    id: bigint;
    title: string;
    description: string | null;
    imageId: bigint | null;
    backgroundColor: string;
    horizontalAspectRatio: ArticleCTABannerDto["horizontalAspectRatio"];
    approxPositionPercentage: number;
    href: string | null;
    buttons: Array<{
      id: bigint;
      text: string | null;
      iconCode: string | null;
      sortOrder: number;
      href: string | null;
    }>;
  }>;
}): ArticleCTABannerDto[] {
  return (article.ctaBanners ?? []).map((banner) => ({
    id: Number(banner.id),
    title: banner.title,
    description: banner.description,
    imageId: banner.imageId != null ? Number(banner.imageId) : null,
    backgroundColor: banner.backgroundColor,
    horizontalAspectRatio: banner.horizontalAspectRatio,
    approxPositionPercentage: banner.approxPositionPercentage,
    href: banner.href,
    buttons: banner.buttons.map((button) => ({
      id: Number(button.id),
      text: button.text,
      iconCode: button.iconCode,
      sortOrder: button.sortOrder,
      href: button.href,
    })),
  }));
}

export function mapArticleToDetailDto(
  article: {
    id: bigint;
    authorId: string;
    title: string;
    displayTitle: string | null;
    slug: string;
    excerpt: string | null;
    content: string;
    descriptionSeo: string | null;
    tags: string;
    status: Article["status"];
    publishedAt: Date | null;
    scheduledPublishAt: Date | null;
    scheduledByUserId: string | null;
    coverMediaId: bigint | null;
    createdAt: Date;
    updatedAt: Date;
    ogTitle: string | null;
    ogDescription: string | null;
    ogImageMediaId: bigint | null;
    noIndex: boolean;
    noFollow: boolean;
    schemaType: string | null;
    author: ArticleAuthorRecord;
    authorLinks: Array<{
      userId: string;
      user: ArticleAuthorRecord;
    }>;
    categoryLinks: Array<{
      categoryId: bigint;
      score: number;
      category: {
        id: bigint;
        name: string;
        color: string;
      };
    }>;
    ctaBanners?: Array<{
      id: bigint;
      title: string;
      description: string | null;
      imageId: bigint | null;
      backgroundColor: string;
      horizontalAspectRatio: ArticleCTABannerDto["horizontalAspectRatio"];
      approxPositionPercentage: number;
      href: string | null;
      buttons: Array<{
        id: bigint;
        text: string | null;
        iconCode: string | null;
        sortOrder: number;
        href: string | null;
      }>;
    }>;
  },
  abilities: ArticleAbilitiesDto,
): ArticleDetailDto {
  return {
    id: Number(article.id),
    authorId: article.authorId,
    authors: mapArticleAuthors(article),
    categories: mapArticleCategories(article),
    tags: mapArticleTags(article),
    title: article.title,
    displayTitle: article.displayTitle,
    slug: article.slug,
    excerpt: article.excerpt,
    content: article.content,
    descriptionSeo: article.descriptionSeo,
    status: article.status,
    publishedAt: toIsoString(article.publishedAt),
    scheduledPublishAt: toIsoString(article.scheduledPublishAt),
    scheduledByUserId: article.scheduledByUserId,
    coverMediaId: article.coverMediaId != null ? Number(article.coverMediaId) : null,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
    ogTitle: article.ogTitle,
    ogDescription: article.ogDescription,
    ogImageMediaId:
      article.ogImageMediaId != null ? Number(article.ogImageMediaId) : null,
    noIndex: article.noIndex,
    noFollow: article.noFollow,
    schemaType: article.schemaType,
    ctaBanners: mapArticleCtaBanners(article),
    abilities,
  };
}

export function mapArticleToListItemDto(article: {
  id: bigint;
  title: string;
  slug: string;
  status: Article["status"];
  publishedAt: Date | null;
  scheduledPublishAt: Date | null;
  scheduledByUserId: string | null;
  updatedAt: Date;
  author: ArticleAuthorRecord;
  authorLinks: Array<{
    userId: string;
    user: ArticleAuthorRecord;
  }>;
  categoryLinks: Array<{
    categoryId: bigint;
    score: number;
    category: {
      id: bigint;
      name: string;
      color: string;
    };
  }>;
  tags: string;
}): ArticleListItemDto {
  const authors = mapArticleAuthors(article);
  const primaryAuthor = authors[0];

  return {
    id: Number(article.id),
    title: article.title,
    slug: article.slug,
    status: article.status,
    publishedAt: toIsoString(article.publishedAt),
    scheduledPublishAt: toIsoString(article.scheduledPublishAt),
    scheduledByUserId: article.scheduledByUserId,
    updatedAt: article.updatedAt.toISOString(),
    author: {
      id: primaryAuthor?.id ?? article.author.id,
      email: primaryAuthor?.email ?? article.author.email,
      name: primaryAuthor?.name ?? getAuthorName(article.author),
    },
    authors,
    categories: mapArticleCategories(article),
  };
}

