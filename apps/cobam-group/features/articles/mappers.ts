import type { Article } from "@prisma/client";
import { resolveAccessFromAssignments } from "@/features/rbac/user-access";
import { getArticlePlainText } from "@/features/articles/document";
import { parseOwnedTagString } from "@/features/tags/owned";
import { slugify } from "@/lib/slugify";
import type {
  ArticleAbilitiesDto,
  ArticleAssignableAuthorDto,
  ArticleCategoryDto,
  ArticleCTABannerDto,
  ArticleDetailDto,
  ArticleFaqQuestionDto,
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

function mapArticleCategory(article: {
  category: {
    id: bigint;
    name: string;
    color: string;
  } | null;
}): ArticleCategoryDto | null {
  return article.category
    ? {
        id: Number(article.category.id),
        name: article.category.name,
        color: article.category.color,
      }
    : null;
}

function mapArticleTags(article: { tags: string }): ArticleTagDto[] {
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
    anchor: ArticleCTABannerDto["anchor"];
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
    anchor: banner.anchor,
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

function mapArticleFaqQuestions(article: {
  faqQuestions?: Array<{
    id: bigint;
    question: string;
    content: string;
    sortOrder: number;
  }>;
}): ArticleFaqQuestionDto[] {
  return (article.faqQuestions ?? []).map((item) => ({
    id: Number(item.id),
    question: item.question,
    content: getArticlePlainText(item.content),
    sortOrder: item.sortOrder,
  }));
}

export function mapArticleToDetailDto(
  article: {
    id: bigint;
    createdByUserId: string | null;
    title: string;
    slug: string;
    excerpt: string | null;
    introductionContent: string;
    bodyContent: string;
    conclusionContent: string;
    titleSeo: string | null;
    descriptionSeo: string | null;
    focusKeyword: string | null;
    tags: string;
    status: Article["status"];
    seoStatus: Article["seoStatus"];
    seoScore: number;
    publishedAt: Date | null;
    scheduledPublishAt: Date | null;
    category: {
      id: bigint;
      name: string;
      color: string;
    } | null;
    coverMediaId: bigint | null;
    createdAt: Date;
    updatedAt: Date;
    ogTitle: string | null;
    ogDescription: string | null;
    ogImageMediaId: bigint | null;
    noIndex: boolean;
    ctaBanners?: Array<{
      id: bigint;
      title: string;
      description: string | null;
      imageId: bigint | null;
      backgroundColor: string;
      horizontalAspectRatio: ArticleCTABannerDto["horizontalAspectRatio"];
      anchor: ArticleCTABannerDto["anchor"];
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
    faqQuestions?: Array<{
      id: bigint;
      question: string;
      content: string;
      sortOrder: number;
    }>;
  },
  abilities: ArticleAbilitiesDto,
): ArticleDetailDto {
  return {
    id: Number(article.id),
    createdByUserId: article.createdByUserId,
    category: mapArticleCategory(article),
    tags: mapArticleTags(article),
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    introductionContent: article.introductionContent,
    bodyContent: article.bodyContent,
    conclusionContent: article.conclusionContent,
    titleSeo: article.titleSeo,
    descriptionSeo: article.descriptionSeo,
    focusKeyword: article.focusKeyword,
    status: article.status,
    seoStatus: article.seoStatus,
    seoScore: article.seoScore,
    publishedAt: toIsoString(article.publishedAt),
    scheduledPublishAt: toIsoString(article.scheduledPublishAt),
    coverMediaId: article.coverMediaId != null ? Number(article.coverMediaId) : null,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
    ogTitle: article.ogTitle,
    ogDescription: article.ogDescription,
    ogImageMediaId: article.ogImageMediaId != null ? Number(article.ogImageMediaId) : null,
    noIndex: article.noIndex,
    ctaBanners: mapArticleCtaBanners(article),
    faqQuestions: mapArticleFaqQuestions(article),
    abilities,
  };
}

export function mapArticleToListItemDto(article: {
  id: bigint;
  title: string;
  slug: string;
  status: Article["status"];
  seoStatus: Article["seoStatus"];
  seoScore: number;
  publishedAt: Date | null;
  scheduledPublishAt: Date | null;
  updatedAt: Date;
  category: {
    id: bigint;
    name: string;
    color: string;
  } | null;
}): ArticleListItemDto {
  return {
    id: Number(article.id),
    title: article.title,
    slug: article.slug,
    status: article.status,
    seoStatus: article.seoStatus,
    seoScore: article.seoScore,
    publishedAt: toIsoString(article.publishedAt),
    scheduledPublishAt: toIsoString(article.scheduledPublishAt),
    updatedAt: article.updatedAt.toISOString(),
    category: mapArticleCategory(article),
  };
}
