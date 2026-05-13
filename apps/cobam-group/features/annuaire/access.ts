import type { StaffSession } from "@/features/auth/types";
import { hasAnyPermission, hasPermission } from "@/features/rbac/access";
import {
  ANNUAIRE_ACCESS_PERMISSION_KEYS,
  PERMISSIONS,
} from "@/features/rbac/permissions";

export function canAccessAnnuaire(session: StaffSession): boolean {
  return hasAnyPermission(session, ANNUAIRE_ACCESS_PERMISSION_KEYS);
}

export function canManageAnnuaire(session: StaffSession): boolean {
  return hasPermission(session, PERMISSIONS.ANNUAIRE_MANAGE);
}
