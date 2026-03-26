import type { StaffSession } from "@/features/auth/types";
import { hasAnyPermission, hasPermission } from "@/features/rbac/access";
import { PERMISSIONS } from "@/features/rbac/permissions";

export function canAccessBrands(session: StaffSession): boolean {
  return hasAnyPermission(session, [
    PERMISSIONS.BRANDS_VIEW_ALL,
    PERMISSIONS.BRANDS_VIEW_OWN,
    PERMISSIONS.BRANDS_CREATE,
    PERMISSIONS.BRANDS_UPDATE_ALL,
    PERMISSIONS.BRANDS_UPDATE_BELOW_ROLE,
    PERMISSIONS.BRANDS_UPDATE_OWN,
    PERMISSIONS.BRANDS_DELETE_ALL,
    PERMISSIONS.BRANDS_DELETE_BELOW_ROLE,
    PERMISSIONS.BRANDS_DELETE_OWN,
  ]);
}

export function canCreateBrands(session: StaffSession): boolean {
  return hasPermission(session, PERMISSIONS.BRANDS_CREATE);
}

export function canManageAnyBrands(session: StaffSession): boolean {
  return hasAnyPermission(session, [
    PERMISSIONS.BRANDS_UPDATE_ALL,
    PERMISSIONS.BRANDS_UPDATE_BELOW_ROLE,
    PERMISSIONS.BRANDS_DELETE_ALL,
    PERMISSIONS.BRANDS_DELETE_BELOW_ROLE,
  ]);
}

export function canManageOwnBrands(session: StaffSession): boolean {
  return hasAnyPermission(session, [
    PERMISSIONS.BRANDS_UPDATE_OWN,
    PERMISSIONS.BRANDS_DELETE_OWN,
  ]);
}
