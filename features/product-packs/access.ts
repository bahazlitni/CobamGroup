import type { StaffSession } from "@/features/auth/types";
import {
  canAccessProducts,
  canCreateProducts,
  canManageProducts,
} from "@/features/products/access";

export function canAccessProductPacks(session: StaffSession) {
  return canAccessProducts(session);
}

export function canCreateProductPacks(session: StaffSession) {
  return canCreateProducts(session);
}

export function canManageProductPacks(session: StaffSession) {
  return canManageProducts(session);
}
