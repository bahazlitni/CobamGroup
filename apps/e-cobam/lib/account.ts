import type {
  CommerceFulfillmentMethod,
  CommerceFulfillmentStatus,
  CommerceOrderStatus,
  CommercePaymentMethod,
  CommercePaymentStatus,
} from "@prisma/client";

async function getPrisma() {
  const { prisma } = await import("@cobam/db");
  return prisma;
}

function cleanLookupText(value: string | null | undefined, maxLength = 255) {
  return value?.replace(/\s+/g, " ").trim().slice(0, maxLength) || null;
}

function normalizePhone(value: string | null | undefined) {
  return value?.replace(/\D/g, "").replace(/^00/, "") || null;
}

function contactMatches(input: string, email: string | null, phone: string | null) {
  const normalizedInput = input.toLowerCase();
  const normalizedPhoneInput = normalizePhone(input);

  if (email && email.toLowerCase() === normalizedInput) {
    return true;
  }

  return Boolean(phone && normalizedPhoneInput && normalizePhone(phone) === normalizedPhoneInput);
}

export type AccountOrderLookup = {
  orderNumber: string;
  placedAt: string;
  status: CommerceOrderStatus;
  paymentStatus: CommercePaymentStatus;
  fulfillmentStatus: CommerceFulfillmentStatus;
  paymentMethod: CommercePaymentMethod | null;
  fulfillmentMethod: CommerceFulfillmentMethod | null;
  guestEmail: string | null;
  guestPhone: string | null;
  subtotalTtc: string;
  discountTtc: string;
  shippingTtc: string;
  taxTtc: string;
  totalTtc: string;
  itemCount: number;
  items: Array<{
    id: string;
    sku: string;
    name: string;
    quantity: string;
    lineTotalTtc: string;
  }>;
};

export async function lookupAccountOrder(orderNumberInput: string | null, contactInput: string | null) {
  const orderNumber = cleanLookupText(orderNumberInput, 80)?.toUpperCase() ?? null;
  const contact = cleanLookupText(contactInput, 255);

  if (!orderNumber || !contact) {
    return null;
  }

  const db = await getPrisma();
  const order = await db.commerceOrder.findUnique({
    where: { orderNumber },
    select: {
      orderNumber: true,
      placedAt: true,
      status: true,
      paymentStatus: true,
      fulfillmentStatus: true,
      guestEmail: true,
      guestPhone: true,
      subtotalTtc: true,
      discountTtc: true,
      shippingTtc: true,
      taxTtc: true,
      totalTtc: true,
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { method: true },
      },
      fulfillments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { method: true },
      },
      items: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          sku: true,
          name: true,
          quantity: true,
          lineTotalTtc: true,
        },
      },
    },
  });

  if (!order || !contactMatches(contact, order.guestEmail, order.guestPhone)) {
    return null;
  }

  const itemCount = order.items.reduce((total, item) => {
    const quantity = Number(item.quantity.toString());
    return total + (Number.isFinite(quantity) ? quantity : 0);
  }, 0);

  return {
    orderNumber: order.orderNumber,
    placedAt: order.placedAt.toISOString(),
    status: order.status,
    paymentStatus: order.paymentStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    paymentMethod: order.payments[0]?.method ?? null,
    fulfillmentMethod: order.fulfillments[0]?.method ?? null,
    guestEmail: order.guestEmail,
    guestPhone: order.guestPhone,
    subtotalTtc: order.subtotalTtc.toString(),
    discountTtc: order.discountTtc.toString(),
    shippingTtc: order.shippingTtc.toString(),
    taxTtc: order.taxTtc.toString(),
    totalTtc: order.totalTtc.toString(),
    itemCount,
    items: order.items.map((item) => ({
      id: item.id.toString(),
      sku: item.sku,
      name: item.name,
      quantity: item.quantity.toString(),
      lineTotalTtc: item.lineTotalTtc.toString(),
    })),
  } satisfies AccountOrderLookup;
}

export type AccountOrderLookupResult = Awaited<ReturnType<typeof lookupAccountOrder>>;
