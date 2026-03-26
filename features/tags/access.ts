import type { StaffSession } from "@/features/auth/types";
import { hasAnyPermission, hasPermission } from "@/features/rbac/access";
import { PERMISSIONS } from "@/features/rbac/permissions";

export function canAccessTags(session: StaffSession): boolean {
  return hasAnyPermission(session, [
    PERMISSIONS.TAGS_VIEW_ALL,
    PERMISSIONS.TAGS_VIEW_OWN,
    PERMISSIONS.TAGS_CREATE,
    PERMISSIONS.TAGS_UPDATE_ALL,
    PERMISSIONS.TAGS_UPDATE_BELOW_ROLE,
    PERMISSIONS.TAGS_UPDATE_OWN,
    PERMISSIONS.TAGS_DELETE_ALL,
    PERMISSIONS.TAGS_DELETE_BELOW_ROLE,
    PERMISSIONS.TAGS_DELETE_OWN,
  ]);
}

export function canCreateTags(session: StaffSession): boolean {
  return hasPermission(session, PERMISSIONS.TAGS_CREATE);
}

export function canManageTags(session: StaffSession): boolean {
  return hasAnyPermission(session, [
    PERMISSIONS.TAGS_UPDATE_ALL,
    PERMISSIONS.TAGS_UPDATE_BELOW_ROLE,
    PERMISSIONS.TAGS_UPDATE_OWN,
    PERMISSIONS.TAGS_DELETE_ALL,
    PERMISSIONS.TAGS_DELETE_BELOW_ROLE,
    PERMISSIONS.TAGS_DELETE_OWN,
  ]);
}
