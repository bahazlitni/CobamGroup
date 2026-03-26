import type { StaffSession } from "@/features/auth/types";
import { hasAnyPermission } from "@/features/rbac/access";
import { PERMISSIONS } from "@/features/rbac/permissions";

export function canAccessUsers(session: StaffSession): boolean {
  return hasAnyPermission(session, [
    PERMISSIONS.USERS_VIEW_NON_BANNED_ALL,
    PERMISSIONS.USERS_VIEW_NON_BANNED_BELOW_ROLE,
    PERMISSIONS.USERS_VIEW_BANNED_ALL,
    PERMISSIONS.USERS_VIEW_BANNED_BELOW_ROLE,
  ]);
}
