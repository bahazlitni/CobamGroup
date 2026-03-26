import type { StaffSession } from "@/features/auth/types";
import { hasAnyPermission, hasPermission } from "@/features/rbac/access";
import { PERMISSIONS } from "@/features/rbac/permissions";

export function canAccessPersonalDetails(session: StaffSession): boolean {
  return hasAnyPermission(session, [
    PERMISSIONS.ACCOUNT_READ_SELF,
    PERMISSIONS.ACCOUNT_UPDATE_SELF,
  ]);
}

export function canAccessSecuritySettings(session: StaffSession): boolean {
  return hasAnyPermission(session, [
    PERMISSIONS.ACCOUNT_READ_SELF,
    PERMISSIONS.ACCOUNT_CREDENTIALS_UPDATE_SELF,
  ]);
}

export function canUpdatePersonalDetails(session: StaffSession): boolean {
  return hasPermission(session, PERMISSIONS.ACCOUNT_UPDATE_SELF);
}

export function canUpdateSecuritySettings(session: StaffSession): boolean {
  return hasPermission(session, PERMISSIONS.ACCOUNT_CREDENTIALS_UPDATE_SELF);
}
