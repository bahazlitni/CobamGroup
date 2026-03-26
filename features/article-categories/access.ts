import type { StaffSession } from "@/features/auth/types";
import { canAccessArticles } from "@/features/articles/access";
import { hasAnyPermission, hasPermission } from "@/features/rbac/access";
import { PERMISSIONS } from "@/features/rbac/permissions";

export function canAccessArticleCategories(session: StaffSession): boolean {
  return hasAnyPermission(session, [
    PERMISSIONS.ARTICLE_CATEGORIES_VIEW,
    PERMISSIONS.ARTICLE_CATEGORIES_CREATE,
    PERMISSIONS.ARTICLE_CATEGORIES_DELETE_ALL,
    PERMISSIONS.ARTICLE_CATEGORIES_DELETE_BELOW_ROLE,
    PERMISSIONS.ARTICLE_CATEGORIES_DELETE_OWN,
    PERMISSIONS.ARTICLE_CATEGORIES_FORCE_REMOVE_ALL,
    PERMISSIONS.ARTICLE_CATEGORIES_FORCE_REMOVE_BELOW_ROLE,
    PERMISSIONS.ARTICLE_CATEGORIES_FORCE_REMOVE_OWN,
  ]);
}

export function canCreateArticleCategories(session: StaffSession): boolean {
  return hasPermission(session, PERMISSIONS.ARTICLE_CATEGORIES_CREATE);
}

export function canViewAllArticleCategories(session: StaffSession): boolean {
  return hasAnyPermission(session, [
    PERMISSIONS.ARTICLE_CATEGORIES_VIEW,
    PERMISSIONS.ARTICLE_CATEGORIES_CREATE,
    PERMISSIONS.ARTICLE_CATEGORIES_DELETE_ALL,
    PERMISSIONS.ARTICLE_CATEGORIES_FORCE_REMOVE_ALL,
  ]);
}

export function canUseArticleCategoryOptions(session: StaffSession): boolean {
  return canAccessArticleCategories(session) || canAccessArticles(session);
}
