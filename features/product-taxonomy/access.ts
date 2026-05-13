import type { StaffSession } from "@/features/auth/types";
import { hasAnyPermission, hasPermission } from "@/features/rbac/access";
import { PERMISSIONS } from "@/features/rbac/permissions";

const PRODUCT_COLOR_ACCESS_PERMISSION_KEYS = [
  PERMISSIONS.PRODUCT_COLORS_VIEW,
  PERMISSIONS.PRODUCT_COLORS_MANAGE,
] as const;

const PRODUCT_FINISH_ACCESS_PERMISSION_KEYS = [
  PERMISSIONS.PRODUCT_FINISHES_VIEW,
  PERMISSIONS.PRODUCT_FINISHES_MANAGE,
] as const;

const PRODUCT_TEMPLATE_ACCESS_PERMISSION_KEYS = [
  PERMISSIONS.PRODUCT_TEMPLATES_VIEW,
  PERMISSIONS.PRODUCT_TEMPLATES_MANAGE,
] as const;

const PRODUCT_ATTRIBUTE_ACCESS_PERMISSION_KEYS = [
  PERMISSIONS.PRODUCT_ATTRIBUTES_VIEW,
  PERMISSIONS.PRODUCT_ATTRIBUTES_MANAGE,
] as const;

export function canAccessProductColors(session: StaffSession): boolean {
  return hasAnyPermission(session, PRODUCT_COLOR_ACCESS_PERMISSION_KEYS);
}

export function canManageProductColors(session: StaffSession): boolean {
  return hasPermission(session, PERMISSIONS.PRODUCT_COLORS_MANAGE);
}

export function canAccessProductFinishes(session: StaffSession): boolean {
  return hasAnyPermission(session, PRODUCT_FINISH_ACCESS_PERMISSION_KEYS);
}

export function canManageProductFinishes(session: StaffSession): boolean {
  return hasPermission(session, PERMISSIONS.PRODUCT_FINISHES_MANAGE);
}

export function canAccessProductTemplates(session: StaffSession): boolean {
  return hasAnyPermission(session, PRODUCT_TEMPLATE_ACCESS_PERMISSION_KEYS);
}

export function canManageProductTemplates(session: StaffSession): boolean {
  return hasPermission(session, PERMISSIONS.PRODUCT_TEMPLATES_MANAGE);
}

export function canAccessProductAttributes(session: StaffSession): boolean {
  return hasAnyPermission(session, PRODUCT_ATTRIBUTE_ACCESS_PERMISSION_KEYS);
}

export function canManageProductAttributes(session: StaffSession): boolean {
  return hasPermission(session, PERMISSIONS.PRODUCT_ATTRIBUTES_MANAGE);
}
