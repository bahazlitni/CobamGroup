import type { StaffSession } from "@/features/auth/types";
import { hasAnyPermission, hasPermission } from "@/features/rbac/access";
import { PERMISSIONS } from "@/features/rbac/permissions";

export function canAccessProductCategories(session: StaffSession): boolean {
  return hasAnyPermission(session, [
    PERMISSIONS.PRODUCT_CATEGORIES_VIEW_ALL,
    PERMISSIONS.PRODUCT_CATEGORIES_VIEW_OWN,
    PERMISSIONS.PRODUCT_CATEGORIES_CREATE,
    PERMISSIONS.PRODUCT_CATEGORIES_UPDATE_ALL,
    PERMISSIONS.PRODUCT_CATEGORIES_UPDATE_BELOW_ROLE,
    PERMISSIONS.PRODUCT_CATEGORIES_UPDATE_OWN,
    PERMISSIONS.PRODUCT_CATEGORIES_DELETE_ALL,
    PERMISSIONS.PRODUCT_CATEGORIES_DELETE_BELOW_ROLE,
    PERMISSIONS.PRODUCT_CATEGORIES_DELETE_OWN,
  ]);
}

export function canCreateProductCategories(session: StaffSession): boolean {
  return hasPermission(session, PERMISSIONS.PRODUCT_CATEGORIES_CREATE);
}

export function canManageProductCategories(session: StaffSession): boolean {
  return hasAnyPermission(session, [
    PERMISSIONS.PRODUCT_CATEGORIES_UPDATE_ALL,
    PERMISSIONS.PRODUCT_CATEGORIES_UPDATE_BELOW_ROLE,
    PERMISSIONS.PRODUCT_CATEGORIES_UPDATE_OWN,
    PERMISSIONS.PRODUCT_CATEGORIES_DELETE_ALL,
    PERMISSIONS.PRODUCT_CATEGORIES_DELETE_BELOW_ROLE,
    PERMISSIONS.PRODUCT_CATEGORIES_DELETE_OWN,
  ]);
}
