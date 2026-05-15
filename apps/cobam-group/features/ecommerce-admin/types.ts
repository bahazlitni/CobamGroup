export type EcommerceAdminStatusStat = {
  label: string;
  count: number;
};

export type EcommerceOrderAdminItem = {
  id: string;
  orderNumber: string;
  placedAt: string;
  customerLabel: string;
  contact: string | null;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  totalTtc: string;
  currency: string;
  itemCount: number;
  latestPaymentMethod: string | null;
  latestPaymentStatus: string | null;
  latestFulfillmentMethod: string | null;
  latestFulfillmentStatus: string | null;
};

export type EcommerceOrdersAdminDto = {
  stats: {
    total: number;
    placedThisMonth: number;
    revenueTtc: string;
    byStatus: EcommerceAdminStatusStat[];
  };
  items: EcommerceOrderAdminItem[];
};

export type EcommerceCustomerAdminItem = {
  id: string;
  type: string;
  label: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
  orderCount: number;
  addressCount: number;
  paymentMethodCount: number;
  totalSpentTtc: string;
  lastOrderNumber: string | null;
  lastOrderAt: string | null;
};

export type EcommerceCustomersAdminDto = {
  stats: {
    total: number;
    companies: number;
    individuals: number;
    withOrders: number;
  };
  items: EcommerceCustomerAdminItem[];
};

export type EcommercePromotionAdminItem = {
  id: string;
  name: string;
  status: string;
  discountType: string;
  discountValue: string;
  minimumSubtotalTtc: string | null;
  startsAt: string | null;
  endsAt: string | null;
  usageLimit: number | null;
  usageCount: number;
  productScopeIds: string[];
  categoryScopeIds: string[];
  brandScopeIds: string[];
  coupons: EcommerceCouponAdminItem[];
  couponCount: number;
  productScopeCount: number;
  categoryScopeCount: number;
  brandScopeCount: number;
};

export type EcommerceCouponAdminItem = {
  id: string;
  code: string;
  isActive: boolean;
  usageLimit: number | null;
  usageLimitPerCustomer: number | null;
  usageCount: number;
  startsAt: string | null;
  endsAt: string | null;
  customerIds: string[];
  customerCount: number;
};

export type EcommercePromotionScopeOption = {
  id: string;
  label: string;
  detail?: string | null;
};

export type EcommercePromotionsAdminDto = {
  stats: {
    total: number;
    active: number;
    paused: number;
    draft: number;
  };
  items: EcommercePromotionAdminItem[];
  options: {
    categories: EcommercePromotionScopeOption[];
    brands: EcommercePromotionScopeOption[];
    products: EcommercePromotionScopeOption[];
    customers: EcommercePromotionScopeOption[];
  };
};

export type EcommercePromotionInput = {
  name: string;
  status: string;
  discountType: string;
  discountValue: string;
  minimumSubtotalTtc?: string | null;
  usageLimit?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  productIds?: string[];
  categoryIds?: string[];
  brandIds?: string[];
};

export type EcommerceCouponInput = {
  code: string;
  isActive: boolean;
  usageLimit?: number | null;
  usageLimitPerCustomer?: number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  customerIds?: string[];
};

export type EcommercePaymentAdminItem = {
  id: string;
  orderNumber: string;
  customerLabel: string;
  provider: string;
  method: string;
  status: string;
  amount: string;
  currency: string;
  transactionReference: string | null;
  createdAt: string;
  paidAt: string | null;
  failedAt: string | null;
};

export type EcommercePaymentsAdminDto = {
  stats: {
    total: number;
    paid: number;
    pending: number;
    failed: number;
    collectedTtc: string;
  };
  items: EcommercePaymentAdminItem[];
};

export type EcommerceFulfillmentAdminItem = {
  id: string;
  orderNumber: string;
  customerLabel: string;
  method: string;
  status: string;
  pickupLocation: string | null;
  carrierName: string | null;
  trackingNumber: string | null;
  requestedDate: string | null;
  scheduledAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
};

export type EcommerceFulfillmentsAdminDto = {
  stats: {
    total: number;
    pending: number;
    inTransit: number;
    delivered: number;
  };
  items: EcommerceFulfillmentAdminItem[];
};

export type EcommerceOrderStatusInput = {
  status: string;
};

export type EcommercePaymentStatusInput = {
  status: string;
};

export type EcommerceFulfillmentStatusInput = {
  status: string;
};
