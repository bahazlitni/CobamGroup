import type {
  CommerceDiscountType,
  CommerceFulfillmentStatus,
  CommerceOrderStatus,
  CommercePaymentStatus,
  CommercePromotionStatus,
  Prisma,
} from "@prisma/client";
import type { StaffSession } from "@/features/auth/types";
import { prisma } from "@/lib/server/db/prisma";
import {
  canAccessEcommerceCustomers,
  canAccessEcommerceFulfillments,
  canAccessEcommerceOrders,
  canAccessEcommercePayments,
  canAccessEcommercePromotions,
  canManageEcommerceFulfillments,
  canManageEcommerceOrders,
  canManageEcommercePayments,
  canManageEcommercePromotions,
} from "./access";
import type {
  EcommerceCouponAdminItem,
  EcommerceCouponInput,
  EcommerceCustomerAdminItem,
  EcommerceCustomersAdminDto,
  EcommerceFulfillmentAdminItem,
  EcommerceFulfillmentStatusInput,
  EcommerceFulfillmentsAdminDto,
  EcommerceOrderAdminItem,
  EcommerceOrderStatusInput,
  EcommerceOrdersAdminDto,
  EcommercePaymentAdminItem,
  EcommercePaymentStatusInput,
  EcommercePaymentsAdminDto,
  EcommercePromotionAdminItem,
  EcommercePromotionInput,
  EcommercePromotionsAdminDto,
} from "./types";

export class EcommerceAdminServiceError extends Error {
  status: number;

  constructor(message = "Forbidden", status = 403) {
    super(message);
    this.status = status;
  }
}

const ISSUED_ORDER_WHERE = {
  status: {
    not: "DRAFT",
  },
} satisfies Prisma.CommerceOrderWhereInput;

const ISSUED_CUSTOMER_ORDER_WHERE = {
  status: {
    not: "DRAFT",
  },
  customerId: {
    not: null,
  },
} satisfies Prisma.CommerceOrderWhereInput;

const ISSUED_PAYMENT_WHERE = {
  order: ISSUED_ORDER_WHERE,
} satisfies Prisma.CommercePaymentWhereInput;

const ISSUED_FULFILLMENT_WHERE = {
  order: ISSUED_ORDER_WHERE,
} satisfies Prisma.CommerceFulfillmentWhereInput;

function assertAllowed(allowed: boolean) {
  if (!allowed) {
    throw new EcommerceAdminServiceError("Acces refuse.", 403);
  }
}

function assertManagePromotions(session: StaffSession) {
  assertAllowed(canManageEcommercePromotions(session));
}

function toId(value: bigint | number | string): string {
  return value.toString();
}

function toIso(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

function decimalToString(value: { toString(): string } | number | string | null | undefined) {
  return value == null ? "0" : value.toString();
}

function decimalToNumber(value: { toString(): string } | number | string | null | undefined) {
  const numberValue = Number(decimalToString(value));
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function parseObject(raw: unknown) {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new EcommerceAdminServiceError("Payload invalide.", 400);
  }

  return raw as Record<string, unknown>;
}

function parseStringField(
  record: Record<string, unknown>,
  key: string,
  options?: {
    required?: boolean;
    maxLength?: number;
  },
) {
  const value = record[key];

  if (value == null || value === "") {
    if (options?.required) {
      throw new EcommerceAdminServiceError("Champ obligatoire manquant.", 400);
    }

    return "";
  }

  if (typeof value !== "string") {
    throw new EcommerceAdminServiceError("Champ invalide.", 400);
  }

  const trimmed = value.trim();

  if (options?.required && !trimmed) {
    throw new EcommerceAdminServiceError("Champ obligatoire manquant.", 400);
  }

  if (options?.maxLength && trimmed.length > options.maxLength) {
    throw new EcommerceAdminServiceError("Champ trop long.", 400);
  }

  return trimmed;
}

function parseOptionalDateField(record: Record<string, unknown>, key: string) {
  const value = record[key];

  if (value == null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new EcommerceAdminServiceError("Date invalide.", 400);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new EcommerceAdminServiceError("Date invalide.", 400);
  }

  return date.toISOString();
}

function parseOptionalPositiveIntegerField(record: Record<string, unknown>, key: string) {
  const value = record[key];

  if (value == null || value === "") {
    return null;
  }

  const numberValue = typeof value === "number" ? value : Number(value);

  if (!Number.isInteger(numberValue) || numberValue < 0) {
    throw new EcommerceAdminServiceError("Nombre invalide.", 400);
  }

  return numberValue;
}

function parseDecimalField(
  record: Record<string, unknown>,
  key: string,
  options?: {
    required?: boolean;
  },
) {
  const value = record[key];

  if (value == null || value === "") {
    if (options?.required) {
      throw new EcommerceAdminServiceError("Montant obligatoire manquant.", 400);
    }

    return null;
  }

  const stringValue = String(value).trim().replace(",", ".");
  const numberValue = Number(stringValue);

  if (!Number.isFinite(numberValue) || numberValue < 0) {
    throw new EcommerceAdminServiceError("Montant invalide.", 400);
  }

  return stringValue;
}

function parseId(value: unknown, field = "id") {
  const stringValue = typeof value === "bigint" ? value.toString() : String(value ?? "");
  let id: bigint;

  try {
    id = BigInt(stringValue);
  } catch {
    throw new EcommerceAdminServiceError(`${field} invalide.`, 400);
  }

  if (id <= BigInt(0)) {
    throw new EcommerceAdminServiceError(`${field} invalide.`, 400);
  }

  return id;
}

function parseIdList(record: Record<string, unknown>, key: string) {
  const value = record[key];

  if (value == null) {
    return [] as string[];
  }

  if (!Array.isArray(value)) {
    throw new EcommerceAdminServiceError("Liste d'identifiants invalide.", 400);
  }

  return [...new Set(value.map((item) => parseId(item).toString()))];
}

const PROMOTION_STATUSES = new Set<CommercePromotionStatus>([
  "DRAFT",
  "ACTIVE",
  "PAUSED",
  "EXPIRED",
  "ARCHIVED",
]);

const DISCOUNT_TYPES = new Set<CommerceDiscountType>(["PERCENT", "FIXED_AMOUNT", "FREE_SHIPPING"]);

const ORDER_STATUSES = new Set<CommerceOrderStatus>([
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
]);

const PAYMENT_STATUSES = new Set<CommercePaymentStatus>([
  "PENDING",
  "AUTHORIZED",
  "PAID",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
]);

const FULFILLMENT_STATUSES = new Set<CommerceFulfillmentStatus>([
  "PENDING",
  "SCHEDULED",
  "PREPARING",
  "READY",
  "IN_TRANSIT",
  "DELIVERED",
  "FAILED",
  "CANCELLED",
]);

function parsePromotionStatus(value: string) {
  if (!PROMOTION_STATUSES.has(value as CommercePromotionStatus)) {
    throw new EcommerceAdminServiceError("Statut de promotion invalide.", 400);
  }

  return value as CommercePromotionStatus;
}

function parseDiscountType(value: string) {
  if (!DISCOUNT_TYPES.has(value as CommerceDiscountType)) {
    throw new EcommerceAdminServiceError("Type de remise invalide.", 400);
  }

  return value as CommerceDiscountType;
}

function parseOrderStatus(value: string) {
  if (!ORDER_STATUSES.has(value as CommerceOrderStatus)) {
    throw new EcommerceAdminServiceError("Statut de commande invalide.", 400);
  }

  return value as CommerceOrderStatus;
}

function parsePaymentStatus(value: string) {
  if (!PAYMENT_STATUSES.has(value as CommercePaymentStatus)) {
    throw new EcommerceAdminServiceError("Statut de paiement invalide.", 400);
  }

  return value as CommercePaymentStatus;
}

function parseFulfillmentStatus(value: string) {
  if (!FULFILLMENT_STATUSES.has(value as CommerceFulfillmentStatus)) {
    throw new EcommerceAdminServiceError("Statut de livraison invalide.", 400);
  }

  return value as CommerceFulfillmentStatus;
}

export function parseEcommercePromotionId(value: unknown) {
  return parseId(value, "Promotion");
}

export function parseEcommerceCouponId(value: unknown) {
  return parseId(value, "Coupon");
}

export function parseEcommerceOrderId(value: unknown) {
  return parseId(value, "Commande");
}

export function parseEcommercePaymentId(value: unknown) {
  return parseId(value, "Paiement");
}

export function parseEcommerceFulfillmentId(value: unknown) {
  return parseId(value, "Livraison");
}

export function parseEcommerceOrderStatusInput(raw: unknown): EcommerceOrderStatusInput {
  const record = parseObject(raw);

  return {
    status: parseOrderStatus(parseStringField(record, "status", { required: true })),
  };
}

export function parseEcommercePaymentStatusInput(raw: unknown): EcommercePaymentStatusInput {
  const record = parseObject(raw);

  return {
    status: parsePaymentStatus(parseStringField(record, "status", { required: true })),
  };
}

export function parseEcommerceFulfillmentStatusInput(
  raw: unknown,
): EcommerceFulfillmentStatusInput {
  const record = parseObject(raw);

  return {
    status: parseFulfillmentStatus(parseStringField(record, "status", { required: true })),
  };
}

export function parseEcommercePromotionInput(raw: unknown): EcommercePromotionInput {
  const record = parseObject(raw);
  const name = parseStringField(record, "name", { required: true, maxLength: 255 });
  const status = parsePromotionStatus(parseStringField(record, "status", { required: true }));
  const discountType = parseDiscountType(
    parseStringField(record, "discountType", { required: true }),
  );
  const discountValue =
    discountType === "FREE_SHIPPING"
      ? "0"
      : parseDecimalField(record, "discountValue", { required: true });
  const minimumSubtotalTtc = parseDecimalField(record, "minimumSubtotalTtc");
  const usageLimit = parseOptionalPositiveIntegerField(record, "usageLimit");
  const startsAt = parseOptionalDateField(record, "startsAt");
  const endsAt = parseOptionalDateField(record, "endsAt");

  if (startsAt && endsAt && new Date(startsAt).getTime() > new Date(endsAt).getTime()) {
    throw new EcommerceAdminServiceError("La date de debut doit preceder la date de fin.", 400);
  }

  return {
    name,
    status,
    discountType,
    discountValue: discountValue ?? "0",
    minimumSubtotalTtc,
    usageLimit,
    startsAt,
    endsAt,
    productIds: parseIdList(record, "productIds"),
    categoryIds: parseIdList(record, "categoryIds"),
    brandIds: parseIdList(record, "brandIds"),
  };
}

export function parseEcommerceCouponInput(raw: unknown): EcommerceCouponInput {
  const record = parseObject(raw);
  const code = parseStringField(record, "code", { required: true, maxLength: 80 })
    .toUpperCase()
    .replace(/\s+/g, "");
  const isActive = Boolean(record.isActive);
  const usageLimit = parseOptionalPositiveIntegerField(record, "usageLimit");
  const usageLimitPerCustomer = parseOptionalPositiveIntegerField(record, "usageLimitPerCustomer");
  const startsAt = parseOptionalDateField(record, "startsAt");
  const endsAt = parseOptionalDateField(record, "endsAt");

  if (!/^[A-Z0-9_-]{3,80}$/.test(code)) {
    throw new EcommerceAdminServiceError(
      "Le code coupon doit contenir 3 a 80 caracteres alphanumeriques.",
      400,
    );
  }

  if (startsAt && endsAt && new Date(startsAt).getTime() > new Date(endsAt).getTime()) {
    throw new EcommerceAdminServiceError("La date de debut doit preceder la date de fin.", 400);
  }

  return {
    code,
    isActive,
    usageLimit,
    usageLimitPerCustomer,
    startsAt,
    endsAt,
    customerIds: parseIdList(record, "customerIds"),
  };
}

type CustomerSummary = {
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  user: {
    email: string;
  };
};

function getCustomerLabel(
  customer: CustomerSummary | null | undefined,
  guestEmail?: string | null,
  guestPhone?: string | null,
): string {
  const profileName = [customer?.firstName, customer?.lastName].filter(Boolean).join(" ").trim();

  return (
    customer?.companyName ||
    profileName ||
    customer?.user.email ||
    guestEmail ||
    guestPhone ||
    "Client invite"
  );
}

function getContact(
  customer: { user: { email: string } } | null | undefined,
  guestEmail?: string | null,
  guestPhone?: string | null,
) {
  return customer?.user.email || guestEmail || guestPhone || null;
}

function getStartOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

const customerOrderStatusLabels: Record<string, string> = {
  PENDING: "en attente de confirmation",
  CONFIRMED: "confirmee",
  PREPARING: "en preparation",
  READY_FOR_PICKUP: "prete pour retrait",
  SHIPPED: "expediee",
  DELIVERED: "livree",
  CANCELLED: "annulee",
  REFUNDED: "remboursee",
};

const customerPaymentStatusLabels: Record<string, string> = {
  PENDING: "en attente",
  AUTHORIZED: "autorise",
  PAID: "paye",
  FAILED: "echoue",
  CANCELLED: "annule",
  REFUNDED: "rembourse",
  PARTIALLY_REFUNDED: "partiellement rembourse",
};

const customerFulfillmentStatusLabels: Record<string, string> = {
  PENDING: "en attente",
  SCHEDULED: "planifiee",
  PREPARING: "en preparation",
  READY: "prete",
  IN_TRANSIT: "en transit",
  DELIVERED: "livree",
  FAILED: "echouee",
  CANCELLED: "annulee",
};

function customerStatusLabel(labels: Record<string, string>, status: string) {
  return labels[status] ?? status.toLowerCase().replace(/_/g, " ");
}

async function createOrderCustomerNotification(
  tx: Prisma.TransactionClient,
  order: { id: bigint; orderNumber: string; customerId: bigint | null },
  input: {
    type: string;
    title: string;
    body: string;
  },
) {
  if (!order.customerId) {
    return;
  }

  await tx.customerNotification.create({
    data: {
      customerId: order.customerId,
      orderId: order.id,
      type: input.type,
      title: input.title,
      body: input.body,
      href: `/commande/${encodeURIComponent(order.orderNumber)}`,
    },
  });
}

export async function listEcommerceOrdersAdminService(
  session: StaffSession,
): Promise<EcommerceOrdersAdminDto> {
  assertAllowed(canAccessEcommerceOrders(session));

  const [items, total, placedThisMonth, revenue, byStatus] = await Promise.all([
    prisma.commerceOrder.findMany({
      where: ISSUED_ORDER_WHERE,
      orderBy: { placedAt: "desc" },
      take: 80,
      select: {
        id: true,
        orderNumber: true,
        guestEmail: true,
        guestPhone: true,
        status: true,
        paymentStatus: true,
        fulfillmentStatus: true,
        totalTtc: true,
        currency: true,
        placedAt: true,
        customer: {
          select: {
            firstName: true,
            lastName: true,
            companyName: true,
            user: { select: { email: true } },
          },
        },
        items: { select: { quantity: true } },
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            method: true,
            status: true,
          },
        },
        fulfillments: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            method: true,
            status: true,
          },
        },
      },
    }),
    prisma.commerceOrder.count({ where: ISSUED_ORDER_WHERE }),
    prisma.commerceOrder.count({
      where: {
        ...ISSUED_ORDER_WHERE,
        placedAt: { gte: getStartOfMonth() },
      },
    }),
    prisma.commerceOrder.aggregate({
      where: ISSUED_ORDER_WHERE,
      _sum: { totalTtc: true },
    }),
    prisma.commerceOrder.groupBy({
      by: ["status"],
      where: ISSUED_ORDER_WHERE,
      _count: { _all: true },
    }),
  ]);

  return {
    stats: {
      total,
      placedThisMonth,
      revenueTtc: decimalToString(revenue._sum.totalTtc),
      byStatus: byStatus.map((row) => ({
        label: row.status,
        count: row._count._all,
      })),
    },
    items: items.map<EcommerceOrderAdminItem>((order) => {
      const latestPayment = order.payments[0] ?? null;
      const latestFulfillment = order.fulfillments[0] ?? null;

      return {
        id: toId(order.id),
        orderNumber: order.orderNumber,
        placedAt: order.placedAt.toISOString(),
        customerLabel: getCustomerLabel(order.customer, order.guestEmail, order.guestPhone),
        contact: getContact(order.customer, order.guestEmail, order.guestPhone),
        status: order.status,
        paymentStatus: order.paymentStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        totalTtc: decimalToString(order.totalTtc),
        currency: order.currency,
        itemCount: order.items.reduce((sum, item) => sum + decimalToNumber(item.quantity), 0),
        latestPaymentMethod: latestPayment?.method ?? null,
        latestPaymentStatus: latestPayment?.status ?? null,
        latestFulfillmentMethod: latestFulfillment?.method ?? null,
        latestFulfillmentStatus: latestFulfillment?.status ?? null,
      };
    }),
  };
}

export async function updateEcommerceOrderStatusAdminService(
  session: StaffSession,
  orderId: bigint,
  input: EcommerceOrderStatusInput,
) {
  assertAllowed(canManageEcommerceOrders(session));

  const current = await prisma.commerceOrder.findFirst({
    where: { id: orderId, ...ISSUED_ORDER_WHERE },
    select: {
      id: true,
      orderNumber: true,
      customerId: true,
      status: true,
    },
  });

  if (!current) {
    throw new EcommerceAdminServiceError("Commande introuvable.", 404);
  }

  const status = input.status as CommerceOrderStatus;
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.commerceOrder.update({
      where: { id: orderId },
      data: {
        status,
        confirmedAt: status === "CONFIRMED" ? now : undefined,
        cancelledAt: status === "CANCELLED" ? now : undefined,
      },
    });

    if (current.status !== status) {
      await tx.commerceOrderStatusEvent.create({
        data: {
          orderId,
          fromStatus: current.status,
          toStatus: status,
          createdByUserId: session.id,
        },
      });

      await createOrderCustomerNotification(tx, current, {
        type: "ORDER_STATUS",
        title: `Commande ${current.orderNumber} mise a jour`,
        body: `Votre commande est maintenant ${customerStatusLabel(customerOrderStatusLabels, status)}.`,
      });
    }
  });
}

export async function listEcommerceCustomersAdminService(
  session: StaffSession,
): Promise<EcommerceCustomersAdminDto> {
  assertAllowed(canAccessEcommerceCustomers(session));

  const [items, total, companies, individuals, orderTotals] = await Promise.all([
    prisma.customerProfile.findMany({
      orderBy: { createdAt: "desc" },
      take: 80,
      select: {
        id: true,
        type: true,
        firstName: true,
        lastName: true,
        companyName: true,
        phone: true,
        createdAt: true,
        user: {
          select: {
            email: true,
            status: true,
            lastLoginAt: true,
          },
        },
        _count: {
          select: {
            addresses: true,
            paymentMethods: true,
          },
        },
        orders: {
          where: ISSUED_ORDER_WHERE,
          orderBy: { placedAt: "desc" },
          take: 1,
          select: {
            orderNumber: true,
            placedAt: true,
          },
        },
      },
    }),
    prisma.customerProfile.count(),
    prisma.customerProfile.count({ where: { type: "COMPANY" } }),
    prisma.customerProfile.count({ where: { type: "INDIVIDUAL" } }),
    prisma.commerceOrder.groupBy({
      by: ["customerId"],
      where: ISSUED_CUSTOMER_ORDER_WHERE,
      _count: { _all: true },
      _sum: { totalTtc: true },
    }),
  ]);

  const orderTotalsByCustomerId = new Map(
    orderTotals.map((row) => [
      toId(row.customerId ?? 0),
      {
        count: row._count._all,
        total: decimalToString(row._sum.totalTtc),
      },
    ]),
  );

  return {
    stats: {
      total,
      companies,
      individuals,
      withOrders: orderTotals.length,
    },
    items: items.map<EcommerceCustomerAdminItem>((customer) => {
      const totals = orderTotalsByCustomerId.get(toId(customer.id)) ?? {
        count: 0,
        total: "0",
      };
      const latestOrder = customer.orders[0] ?? null;

      return {
        id: toId(customer.id),
        type: customer.type,
        label: getCustomerLabel(customer),
        email: customer.user.email,
        phone: customer.phone,
        status: customer.user.status,
        createdAt: customer.createdAt.toISOString(),
        lastLoginAt: toIso(customer.user.lastLoginAt),
        orderCount: totals.count,
        addressCount: customer._count.addresses,
        paymentMethodCount: customer._count.paymentMethods,
        totalSpentTtc: totals.total,
        lastOrderNumber: latestOrder?.orderNumber ?? null,
        lastOrderAt: toIso(latestOrder?.placedAt),
      };
    }),
  };
}

export async function listEcommercePromotionsAdminService(
  session: StaffSession,
): Promise<EcommercePromotionsAdminDto> {
  assertAllowed(canAccessEcommercePromotions(session));

  const [items, total, active, paused, draft, categories, brands, products, customers] =
    await Promise.all([
      prisma.commercePromotion.findMany({
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        take: 80,
        select: {
          id: true,
          name: true,
          status: true,
          discountType: true,
          discountValue: true,
          minimumSubtotalTtc: true,
          startsAt: true,
          endsAt: true,
          usageLimit: true,
          usageCount: true,
          coupons: {
            orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
            select: {
              id: true,
              code: true,
              usageLimit: true,
              usageLimitPerCustomer: true,
              usageCount: true,
              startsAt: true,
              endsAt: true,
              isActive: true,
              customers: {
                select: {
                  customerId: true,
                },
              },
            },
          },
          products: {
            select: {
              productId: true,
            },
          },
          categories: {
            select: {
              categoryId: true,
            },
          },
          brands: {
            select: {
              brandId: true,
            },
          },
          _count: {
            select: {
              coupons: true,
              products: true,
              categories: true,
              brands: true,
            },
          },
        },
      }),
      prisma.commercePromotion.count(),
      prisma.commercePromotion.count({ where: { status: "ACTIVE" } }),
      prisma.commercePromotion.count({ where: { status: "PAUSED" } }),
      prisma.commercePromotion.count({ where: { status: "DRAFT" } }),
      prisma.productCategory.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: {
          id: true,
          name: true,
          slug: true,
        },
      }),
      prisma.organization.findMany({
        where: { isProductBrand: true },
        orderBy: { name: "asc" },
        take: 200,
        select: {
          id: true,
          name: true,
          slug: true,
        },
      }),
      prisma.product.findMany({
        where: { visibleEcommerce: true },
        orderBy: { displayName: "asc" },
        take: 250,
        select: {
          id: true,
          sku: true,
          displayName: true,
          brand: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.customerProfile.findMany({
        orderBy: { createdAt: "desc" },
        take: 250,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          companyName: true,
          phone: true,
          user: {
            select: {
              email: true,
              status: true,
            },
          },
        },
      }),
    ]);

  return {
    stats: { total, active, paused, draft },
    items: items.map<EcommercePromotionAdminItem>((promotion) => ({
      id: toId(promotion.id),
      name: promotion.name,
      status: promotion.status,
      discountType: promotion.discountType,
      discountValue: decimalToString(promotion.discountValue),
      minimumSubtotalTtc: promotion.minimumSubtotalTtc
        ? decimalToString(promotion.minimumSubtotalTtc)
        : null,
      startsAt: toIso(promotion.startsAt),
      endsAt: toIso(promotion.endsAt),
      usageLimit: promotion.usageLimit,
      usageCount: promotion.usageCount,
      productScopeIds: promotion.products.map((link) => toId(link.productId)),
      categoryScopeIds: promotion.categories.map((link) => toId(link.categoryId)),
      brandScopeIds: promotion.brands.map((link) => toId(link.brandId)),
      coupons: promotion.coupons.map<EcommerceCouponAdminItem>((coupon) => ({
        id: toId(coupon.id),
        code: coupon.code,
        isActive: coupon.isActive,
        usageLimit: coupon.usageLimit,
        usageLimitPerCustomer: coupon.usageLimitPerCustomer,
        usageCount: coupon.usageCount,
        startsAt: toIso(coupon.startsAt),
        endsAt: toIso(coupon.endsAt),
        customerIds: coupon.customers.map((link) => toId(link.customerId)),
        customerCount: coupon.customers.length,
      })),
      couponCount: promotion._count.coupons,
      productScopeCount: promotion._count.products,
      categoryScopeCount: promotion._count.categories,
      brandScopeCount: promotion._count.brands,
    })),
    options: {
      categories: categories.map((category) => ({
        id: toId(category.id),
        label: category.name,
        detail: category.slug,
      })),
      brands: brands.map((brand) => ({
        id: toId(brand.id),
        label: brand.name,
        detail: brand.slug,
      })),
      products: products.map((product) => ({
        id: toId(product.id),
        label: product.displayName,
        detail: [product.sku, product.brand?.name].filter(Boolean).join(" - "),
      })),
      customers: customers.map((customer) => ({
        id: toId(customer.id),
        label: getCustomerLabel(customer),
        detail: [customer.user.email, customer.phone, customer.user.status]
          .filter(Boolean)
          .join(" - "),
      })),
    },
  };
}

async function syncPromotionScopes(
  tx: Prisma.TransactionClient,
  promotionId: bigint,
  input: EcommercePromotionInput,
) {
  const productIds = (input.productIds ?? []).map((id) => parseId(id, "Produit"));
  const categoryIds = (input.categoryIds ?? []).map((id) => parseId(id, "Categorie"));
  const brandIds = (input.brandIds ?? []).map((id) => parseId(id, "Marque"));

  await Promise.all([
    tx.commercePromotionProduct.deleteMany({ where: { promotionId } }),
    tx.commercePromotionCategory.deleteMany({ where: { promotionId } }),
    tx.commercePromotionBrand.deleteMany({ where: { promotionId } }),
  ]);

  await Promise.all([
    productIds.length
      ? tx.commercePromotionProduct.createMany({
          data: productIds.map((productId) => ({ promotionId, productId })),
          skipDuplicates: true,
        })
      : Promise.resolve(),
    categoryIds.length
      ? tx.commercePromotionCategory.createMany({
          data: categoryIds.map((categoryId) => ({ promotionId, categoryId })),
          skipDuplicates: true,
        })
      : Promise.resolve(),
    brandIds.length
      ? tx.commercePromotionBrand.createMany({
          data: brandIds.map((brandId) => ({ promotionId, brandId })),
          skipDuplicates: true,
        })
      : Promise.resolve(),
  ]);
}

function promotionWriteData(input: EcommercePromotionInput) {
  return {
    name: input.name,
    status: input.status as CommercePromotionStatus,
    discountType: input.discountType as CommerceDiscountType,
    discountValue: input.discountValue,
    minimumSubtotalTtc: input.minimumSubtotalTtc || null,
    usageLimit: input.usageLimit ?? null,
    startsAt: input.startsAt ? new Date(input.startsAt) : null,
    endsAt: input.endsAt ? new Date(input.endsAt) : null,
  };
}

export async function createEcommercePromotionAdminService(
  session: StaffSession,
  input: EcommercePromotionInput,
) {
  assertManagePromotions(session);

  try {
    return await prisma.$transaction(async (tx) => {
      const promotion = await tx.commercePromotion.create({
        data: promotionWriteData(input),
        select: { id: true },
      });

      await syncPromotionScopes(tx, promotion.id, input);

      return { id: toId(promotion.id) };
    });
  } catch (error) {
    console.error("ECOMMERCE_PROMOTION_CREATE_SERVICE_ERROR:", error);
    throw new EcommerceAdminServiceError("Impossible de creer cette promotion.", 400);
  }
}

export async function updateEcommercePromotionAdminService(
  session: StaffSession,
  promotionId: bigint,
  input: EcommercePromotionInput,
) {
  assertManagePromotions(session);

  try {
    return await prisma.$transaction(async (tx) => {
      const promotion = await tx.commercePromotion.update({
        where: { id: promotionId },
        data: promotionWriteData(input),
        select: { id: true },
      });

      await syncPromotionScopes(tx, promotion.id, input);

      return { id: toId(promotion.id) };
    });
  } catch (error) {
    console.error("ECOMMERCE_PROMOTION_UPDATE_SERVICE_ERROR:", error);
    throw new EcommerceAdminServiceError("Impossible de mettre a jour cette promotion.", 400);
  }
}

export async function deleteEcommercePromotionAdminService(
  session: StaffSession,
  promotionId: bigint,
) {
  assertManagePromotions(session);

  const redemptionCount = await prisma.commercePromotionRedemption.count({
    where: { promotionId },
  });

  if (redemptionCount > 0) {
    await prisma.commercePromotion.update({
      where: { id: promotionId },
      data: { status: "ARCHIVED" },
    });
    return;
  }

  await prisma.commercePromotion.delete({ where: { id: promotionId } });
}

function couponWriteData(input: EcommerceCouponInput) {
  return {
    code: input.code,
    isActive: input.isActive,
    usageLimit: input.usageLimit ?? null,
    usageLimitPerCustomer: input.usageLimitPerCustomer ?? null,
    startsAt: input.startsAt ? new Date(input.startsAt) : null,
    endsAt: input.endsAt ? new Date(input.endsAt) : null,
  };
}

async function syncCouponCustomers(
  tx: Prisma.TransactionClient,
  couponId: bigint,
  input: EcommerceCouponInput,
) {
  const customerIds = (input.customerIds ?? []).map((id) => parseId(id, "Client"));

  await tx.commerceCouponCustomer.deleteMany({ where: { couponId } });

  if (customerIds.length === 0) {
    return;
  }

  await tx.commerceCouponCustomer.createMany({
    data: customerIds.map((customerId) => ({ couponId, customerId })),
    skipDuplicates: true,
  });
}

export async function createEcommerceCouponAdminService(
  session: StaffSession,
  promotionId: bigint,
  input: EcommerceCouponInput,
) {
  assertManagePromotions(session);

  try {
    const coupon = await prisma.$transaction(async (tx) => {
      const created = await tx.commerceCoupon.create({
        data: {
          ...couponWriteData(input),
          promotionId,
        },
        select: { id: true },
      });

      await syncCouponCustomers(tx, created.id, input);

      return created;
    });

    return { id: toId(coupon.id) };
  } catch (error) {
    console.error("ECOMMERCE_COUPON_CREATE_SERVICE_ERROR:", error);
    throw new EcommerceAdminServiceError(
      "Impossible de creer ce coupon. Le code existe peut-etre deja.",
      400,
    );
  }
}

export async function updateEcommerceCouponAdminService(
  session: StaffSession,
  promotionId: bigint,
  couponId: bigint,
  input: EcommerceCouponInput,
) {
  assertManagePromotions(session);

  const coupon = await prisma.commerceCoupon.findFirst({
    where: { id: couponId, promotionId },
    select: { id: true },
  });

  if (!coupon) {
    throw new EcommerceAdminServiceError("Coupon introuvable.", 404);
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.commerceCoupon.update({
        where: { id: couponId },
        data: couponWriteData(input),
      });

      await syncCouponCustomers(tx, couponId, input);
    });

    return { id: toId(couponId) };
  } catch (error) {
    console.error("ECOMMERCE_COUPON_UPDATE_SERVICE_ERROR:", error);
    throw new EcommerceAdminServiceError(
      "Impossible de mettre a jour ce coupon. Le code existe peut-etre deja.",
      400,
    );
  }
}

export async function deleteEcommerceCouponAdminService(
  session: StaffSession,
  promotionId: bigint,
  couponId: bigint,
) {
  assertManagePromotions(session);

  const coupon = await prisma.commerceCoupon.findFirst({
    where: { id: couponId, promotionId },
    select: {
      id: true,
      usageCount: true,
    },
  });

  if (!coupon) {
    throw new EcommerceAdminServiceError("Coupon introuvable.", 404);
  }

  if (coupon.usageCount > 0) {
    await prisma.commerceCoupon.update({
      where: { id: couponId },
      data: { isActive: false },
    });
    return;
  }

  await prisma.commerceCoupon.delete({ where: { id: couponId } });
}

export async function listEcommercePaymentsAdminService(
  session: StaffSession,
): Promise<EcommercePaymentsAdminDto> {
  assertAllowed(canAccessEcommercePayments(session));

  const [items, total, paid, pending, failed, collected] = await Promise.all([
    prisma.commercePayment.findMany({
      where: ISSUED_PAYMENT_WHERE,
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        provider: true,
        method: true,
        status: true,
        amount: true,
        currency: true,
        transactionReference: true,
        createdAt: true,
        paidAt: true,
        failedAt: true,
        order: {
          select: {
            orderNumber: true,
            guestEmail: true,
            guestPhone: true,
            customer: {
              select: {
                firstName: true,
                lastName: true,
                companyName: true,
                user: { select: { email: true } },
              },
            },
          },
        },
      },
    }),
    prisma.commercePayment.count({ where: ISSUED_PAYMENT_WHERE }),
    prisma.commercePayment.count({
      where: { ...ISSUED_PAYMENT_WHERE, status: "PAID" },
    }),
    prisma.commercePayment.count({
      where: { ...ISSUED_PAYMENT_WHERE, status: "PENDING" },
    }),
    prisma.commercePayment.count({
      where: { ...ISSUED_PAYMENT_WHERE, status: "FAILED" },
    }),
    prisma.commercePayment.aggregate({
      where: { ...ISSUED_PAYMENT_WHERE, status: "PAID" },
      _sum: { amount: true },
    }),
  ]);

  return {
    stats: {
      total,
      paid,
      pending,
      failed,
      collectedTtc: decimalToString(collected._sum.amount),
    },
    items: items.map<EcommercePaymentAdminItem>((payment) => ({
      id: toId(payment.id),
      orderNumber: payment.order.orderNumber,
      customerLabel: getCustomerLabel(
        payment.order.customer,
        payment.order.guestEmail,
        payment.order.guestPhone,
      ),
      provider: payment.provider,
      method: payment.method,
      status: payment.status,
      amount: decimalToString(payment.amount),
      currency: payment.currency,
      transactionReference: payment.transactionReference,
      createdAt: payment.createdAt.toISOString(),
      paidAt: toIso(payment.paidAt),
      failedAt: toIso(payment.failedAt),
    })),
  };
}

export async function updateEcommercePaymentStatusAdminService(
  session: StaffSession,
  paymentId: bigint,
  input: EcommercePaymentStatusInput,
) {
  assertAllowed(canManageEcommercePayments(session));

  const payment = await prisma.commercePayment.findFirst({
    where: { id: paymentId, ...ISSUED_PAYMENT_WHERE },
    select: {
      id: true,
      orderId: true,
      status: true,
      order: {
        select: {
          id: true,
          orderNumber: true,
          customerId: true,
        },
      },
    },
  });

  if (!payment) {
    throw new EcommerceAdminServiceError("Paiement introuvable.", 404);
  }

  const status = input.status as CommercePaymentStatus;
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.commercePayment.update({
      where: { id: paymentId },
      data: {
        status,
        paidAt: status === "PAID" ? now : undefined,
        failedAt: status === "FAILED" ? now : undefined,
      },
    });

    await tx.commerceOrder.update({
      where: { id: payment.orderId },
      data: { paymentStatus: status },
    });

    if (payment.status !== status) {
      await createOrderCustomerNotification(tx, payment.order, {
        type: "PAYMENT_STATUS",
        title: `Paiement de ${payment.order.orderNumber} mis a jour`,
        body: `Le paiement de votre commande est maintenant ${customerStatusLabel(
          customerPaymentStatusLabels,
          status,
        )}.`,
      });
    }
  });
}

export async function listEcommerceFulfillmentsAdminService(
  session: StaffSession,
): Promise<EcommerceFulfillmentsAdminDto> {
  assertAllowed(canAccessEcommerceFulfillments(session));

  const [items, total, pending, inTransit, delivered] = await Promise.all([
    prisma.commerceFulfillment.findMany({
      where: ISSUED_FULFILLMENT_WHERE,
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        method: true,
        status: true,
        carrierName: true,
        trackingNumber: true,
        requestedDate: true,
        scheduledAt: true,
        shippedAt: true,
        deliveredAt: true,
        createdAt: true,
        pickupLocation: {
          select: {
            name: true,
          },
        },
        order: {
          select: {
            orderNumber: true,
            guestEmail: true,
            guestPhone: true,
            customer: {
              select: {
                firstName: true,
                lastName: true,
                companyName: true,
                user: { select: { email: true } },
              },
            },
          },
        },
      },
    }),
    prisma.commerceFulfillment.count({ where: ISSUED_FULFILLMENT_WHERE }),
    prisma.commerceFulfillment.count({
      where: { ...ISSUED_FULFILLMENT_WHERE, status: "PENDING" },
    }),
    prisma.commerceFulfillment.count({
      where: { ...ISSUED_FULFILLMENT_WHERE, status: "IN_TRANSIT" },
    }),
    prisma.commerceFulfillment.count({
      where: { ...ISSUED_FULFILLMENT_WHERE, status: "DELIVERED" },
    }),
  ]);

  return {
    stats: {
      total,
      pending,
      inTransit,
      delivered,
    },
    items: items.map<EcommerceFulfillmentAdminItem>((fulfillment) => ({
      id: toId(fulfillment.id),
      orderNumber: fulfillment.order.orderNumber,
      customerLabel: getCustomerLabel(
        fulfillment.order.customer,
        fulfillment.order.guestEmail,
        fulfillment.order.guestPhone,
      ),
      method: fulfillment.method,
      status: fulfillment.status,
      pickupLocation: fulfillment.pickupLocation?.name ?? null,
      carrierName: fulfillment.carrierName,
      trackingNumber: fulfillment.trackingNumber,
      requestedDate: toIso(fulfillment.requestedDate),
      scheduledAt: toIso(fulfillment.scheduledAt),
      shippedAt: toIso(fulfillment.shippedAt),
      deliveredAt: toIso(fulfillment.deliveredAt),
      createdAt: fulfillment.createdAt.toISOString(),
    })),
  };
}

export async function updateEcommerceFulfillmentStatusAdminService(
  session: StaffSession,
  fulfillmentId: bigint,
  input: EcommerceFulfillmentStatusInput,
) {
  assertAllowed(canManageEcommerceFulfillments(session));

  const fulfillment = await prisma.commerceFulfillment.findFirst({
    where: { id: fulfillmentId, ...ISSUED_FULFILLMENT_WHERE },
    select: {
      id: true,
      orderId: true,
      status: true,
      order: {
        select: {
          id: true,
          orderNumber: true,
          customerId: true,
        },
      },
    },
  });

  if (!fulfillment) {
    throw new EcommerceAdminServiceError("Livraison introuvable.", 404);
  }

  const status = input.status as CommerceFulfillmentStatus;
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.commerceFulfillment.update({
      where: { id: fulfillmentId },
      data: {
        status,
        shippedAt: status === "IN_TRANSIT" ? now : undefined,
        deliveredAt: status === "DELIVERED" ? now : undefined,
      },
    });

    await tx.commerceOrder.update({
      where: { id: fulfillment.orderId },
      data: { fulfillmentStatus: status },
    });

    if (fulfillment.status !== status) {
      await tx.commerceFulfillmentEvent.create({
        data: {
          fulfillmentId,
          fromStatus: fulfillment.status,
          toStatus: status,
          createdByUserId: session.id,
        },
      });

      await createOrderCustomerNotification(tx, fulfillment.order, {
        type: "FULFILLMENT_STATUS",
        title: `Livraison de ${fulfillment.order.orderNumber} mise a jour`,
        body: `La livraison de votre commande est maintenant ${customerStatusLabel(
          customerFulfillmentStatusLabels,
          status,
        )}.`,
      });
    }
  });
}
