import "server-only";

import type { CustomerSession } from "@/lib/customer-auth";

async function getPrisma() {
  const { prisma } = await import("@cobam/db");
  return prisma;
}

export async function linkGuestOrdersToCustomer(customerId: bigint, email: string, phone?: string | null) {
  const db = await getPrisma();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = phone?.trim() || null;

  await db.commerceOrder.updateMany({
    where: {
      customerId: null,
      OR: [
        { guestEmail: normalizedEmail },
        ...(normalizedPhone ? [{ guestPhone: normalizedPhone }] : []),
      ],
    },
    data: { customerId },
  });
}

export async function getCustomerAccount(session: CustomerSession) {
  const db = await getPrisma();
  const customerId = BigInt(session.customerId);

  await linkGuestOrdersToCustomer(customerId, session.email, session.phone);

  const customer = await db.customerProfile.findUnique({
    where: { id: customerId },
    select: {
      id: true,
      type: true,
      firstName: true,
      lastName: true,
      companyName: true,
      taxIdentifier: true,
      phone: true,
      emailMarketingOptIn: true,
      smsMarketingOptIn: true,
      defaultBillingAddressId: true,
      defaultShippingAddressId: true,
      user: {
        select: {
          email: true,
          lastLoginAt: true,
          createdAt: true,
        },
      },
      addresses: {
        orderBy: [{ isDefaultShipping: "desc" }, { isDefaultBilling: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          type: true,
          label: true,
          fullName: true,
          phone: true,
          addressLine1: true,
          addressLine2: true,
          city: true,
          governorate: true,
          postalCode: true,
          countryCode: true,
          isDefaultBilling: true,
          isDefaultShipping: true,
        },
      },
      paymentMethods: {
        where: { isActive: true },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          method: true,
          label: true,
          provider: true,
          holderName: true,
          billingAddressId: true,
          isDefault: true,
          createdAt: true,
        },
      },
      orders: {
        orderBy: { placedAt: "desc" },
        take: 20,
        select: {
          orderNumber: true,
          placedAt: true,
          status: true,
          paymentStatus: true,
          fulfillmentStatus: true,
          subtotalTtc: true,
          totalTtc: true,
          items: {
            select: { id: true, quantity: true },
          },
        },
      },
    },
  });

  if (!customer) {
    return null;
  }

  const orderCount = await db.commerceOrder.count({
    where: {
      OR: [
        { customerId },
        { customerId: null, guestEmail: session.email },
      ],
    },
  });

  return {
    ...customer,
    id: customer.id.toString(),
    defaultBillingAddressId: customer.defaultBillingAddressId?.toString() ?? null,
    defaultShippingAddressId: customer.defaultShippingAddressId?.toString() ?? null,
    addresses: customer.addresses.map((address) => ({
      ...address,
      id: address.id.toString(),
    })),
    paymentMethods: customer.paymentMethods.map((method) => ({
      ...method,
      id: method.id.toString(),
      billingAddressId: method.billingAddressId?.toString() ?? null,
      createdAt: method.createdAt.toISOString(),
    })),
    orders: customer.orders.map((order) => ({
      ...order,
      placedAt: order.placedAt.toISOString(),
      subtotalTtc: order.subtotalTtc.toString(),
      totalTtc: order.totalTtc.toString(),
      itemCount: order.items.reduce((total, item) => {
        const quantity = Number(item.quantity.toString());
        return total + (Number.isFinite(quantity) ? quantity : 0);
      }, 0),
    })),
    orderCount,
  };
}

export type CustomerAccount = Awaited<ReturnType<typeof getCustomerAccount>>;
