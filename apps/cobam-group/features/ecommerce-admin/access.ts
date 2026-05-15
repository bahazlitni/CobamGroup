import type { StaffSession } from "@/features/auth/types";
import { hasAnyPermission, hasPermission } from "@/features/rbac/access";
import { PERMISSIONS } from "@/features/rbac/permissions";

const ECOMMERCE_ORDER_ACCESS_PERMISSION_KEYS = [
  PERMISSIONS.ECOMMERCE_ORDERS_VIEW,
  PERMISSIONS.ECOMMERCE_ORDERS_MANAGE,
] as const;

const ECOMMERCE_CUSTOMER_ACCESS_PERMISSION_KEYS = [
  PERMISSIONS.ECOMMERCE_CUSTOMERS_VIEW,
  PERMISSIONS.ECOMMERCE_CUSTOMERS_MANAGE,
] as const;

const ECOMMERCE_PROMOTION_ACCESS_PERMISSION_KEYS = [
  PERMISSIONS.ECOMMERCE_PROMOTIONS_VIEW,
  PERMISSIONS.ECOMMERCE_PROMOTIONS_MANAGE,
] as const;

const ECOMMERCE_PAYMENT_ACCESS_PERMISSION_KEYS = [
  PERMISSIONS.ECOMMERCE_PAYMENTS_VIEW,
  PERMISSIONS.ECOMMERCE_PAYMENTS_MANAGE,
] as const;

const ECOMMERCE_FULFILLMENT_ACCESS_PERMISSION_KEYS = [
  PERMISSIONS.ECOMMERCE_FULFILLMENTS_VIEW,
  PERMISSIONS.ECOMMERCE_FULFILLMENTS_MANAGE,
] as const;

export function canAccessEcommerceOrders(session: StaffSession): boolean {
  return hasAnyPermission(session, ECOMMERCE_ORDER_ACCESS_PERMISSION_KEYS);
}

export function canManageEcommerceOrders(session: StaffSession): boolean {
  return hasPermission(session, PERMISSIONS.ECOMMERCE_ORDERS_MANAGE);
}

export function canAccessEcommerceCustomers(session: StaffSession): boolean {
  return hasAnyPermission(session, ECOMMERCE_CUSTOMER_ACCESS_PERMISSION_KEYS);
}

export function canManageEcommerceCustomers(session: StaffSession): boolean {
  return hasPermission(session, PERMISSIONS.ECOMMERCE_CUSTOMERS_MANAGE);
}

export function canAccessEcommercePromotions(session: StaffSession): boolean {
  return hasAnyPermission(session, ECOMMERCE_PROMOTION_ACCESS_PERMISSION_KEYS);
}

export function canManageEcommercePromotions(session: StaffSession): boolean {
  return hasPermission(session, PERMISSIONS.ECOMMERCE_PROMOTIONS_MANAGE);
}

export function canAccessEcommercePayments(session: StaffSession): boolean {
  return hasAnyPermission(session, ECOMMERCE_PAYMENT_ACCESS_PERMISSION_KEYS);
}

export function canManageEcommercePayments(session: StaffSession): boolean {
  return hasPermission(session, PERMISSIONS.ECOMMERCE_PAYMENTS_MANAGE);
}

export function canAccessEcommerceFulfillments(session: StaffSession): boolean {
  return hasAnyPermission(session, ECOMMERCE_FULFILLMENT_ACCESS_PERMISSION_KEYS);
}

export function canManageEcommerceFulfillments(session: StaffSession): boolean {
  return hasPermission(session, PERMISSIONS.ECOMMERCE_FULFILLMENTS_MANAGE);
}
