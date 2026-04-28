import { resolveAccessFromAssignments } from "@/features/rbac/user-access";
import type {
  ArticleCategoryAbilitiesDto,
  ArticleCategoryDetailDto,
  ArticleCategoryListItemDto,
} from "./types";

type CreatorRecord = {
  id: string;
  email: string;
  powerType: "ROOT" | "ADMIN" | "STAFF";
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
} | null;

function getCreatorLabel(creator: CreatorRecord) {
  if (!creator) {
    return null;
  }

  const nameParts = [
    creator.profile?.firstName?.trim() ?? "",
    creator.profile?.lastName?.trim() ?? "",
  ].filter(Boolean);

  return nameParts.length > 0 ? nameParts.join(" ") : creator.email;
}

export function mapArticleCategoryToListItemDto(
  category: {
    id: bigint;
    name: string;
    slug: string;
    color: string;
    createdByUserId: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: { articleLinks: number };
    createdByUser: CreatorRecord;
  },
  abilities: ArticleCategoryAbilitiesDto,
): ArticleCategoryListItemDto {
  return {
    id: Number(category.id),
    name: category.name,
    slug: category.slug,
    color: category.color,
    articleCount: category._count.articleLinks,
    createdByUserId: category.createdByUserId,
    createdByLabel: getCreatorLabel(category.createdByUser),
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
    abilities,
  };
}

export function mapArticleCategoryToDetailDto(
  category: Parameters<typeof mapArticleCategoryToListItemDto>[0],
  abilities: ArticleCategoryAbilitiesDto,
): ArticleCategoryDetailDto {
  return mapArticleCategoryToListItemDto(category, abilities);
}

export function resolveArticleCategoryCreatorAccess(creator: CreatorRecord) {
  if (!creator) {
    return null;
  }

  return resolveAccessFromAssignments({
    powerType: creator.powerType,
    status: creator.status,
    assignments: creator.receivedRoleAssignments,
  });
}

