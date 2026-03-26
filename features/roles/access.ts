import type { StaffSession } from "@/features/auth/types";
import { hasAnyPermission } from "@/features/rbac/access";
import { PERMISSIONS } from "@/features/rbac/permissions";

export function canAccessRoles(session: StaffSession): boolean {
  return hasAnyPermission(session, [
    PERMISSIONS.ROLES_VIEW_ALL,
    PERMISSIONS.ROLES_VIEW_BELOW_ROLE,
    PERMISSIONS.ROLES_ASSIGN_BELOW_ROLE,
    PERMISSIONS.USERS_CREATE_BELOW_ROLE,
  ]);
}
