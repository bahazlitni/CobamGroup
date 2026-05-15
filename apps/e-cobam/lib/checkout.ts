import {
  Prisma,
  type CommerceFulfillmentMethod,
  type CommercePaymentMethod,
  type StockUnit,
} from "@prisma/client";

const CHECKOUT_SESSION_EXPIRY_HOURS = 2;
const STOCK_RESERVATION_DAYS = 7;

async function getPrisma() {
  const { prisma } = await import("@cobam/db");
  return prisma;
}

const MEDIA_SELECT = {
  id: true,
  kind: true,
  title: true,
  altText: true,
  isActive: true,
  deletedAt: true,
} satisfies Prisma.MediaSelect;

const ORDER_PRODUCT_SELECT = {
  id: true,
  sku: true,
  slug: true,
  name: true,
  displayName: true,
  visibleEcommerce: true,
  currentPriceTtcTnd: true,
  basePriceTtcTnd: true,
  priceVisibility: true,
  vatRate: true,
  stockAvailable: true,
  stockAvailability: true,
  stockUnit: true,
  brand: { select: { name: true } },
  media: {
    orderBy: [{ sortOrder: "asc" }, { mediaId: "asc" }],
    select: {
      role: true,
      altText: true,
      name: true,
      media: { select: MEDIA_SELECT },
    },
  },
} satisfies Prisma.ProductSelect;

const CHECKOUT_CART_SELECT = {
  id: true,
  currency: true,
  status: true,
  items: {
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      quantity: true,
      product: { select: ORDER_PRODUCT_SELECT },
    },
  },
} satisfies Prisma.ShoppingCartSelect;

type CheckoutCartRecord = Prisma.ShoppingCartGetPayload<{ select: typeof CHECKOUT_CART_SELECT }>;
type OrderProductRecord = Prisma.ProductGetPayload<{ select: typeof ORDER_PRODUCT_SELECT }>;

export type CheckoutOrderResult = {
  orderNumber: string;
  orderId: string;
  totalTtc: string;
  itemCount: number;
  paymentMethod: CommercePaymentMethod;
  fulfillmentMethod: CommerceFulfillmentMethod;
};

export type PublicOrderSummary = {
  orderNumber: string;
  placedAt: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  paymentMethod: CommercePaymentMethod | null;
  fulfillmentMethod: CommerceFulfillmentMethod | null;
  guestEmail: string | null;
  guestPhone: string | null;
  subtotalTtc: string;
  taxTtc: string;
  shippingTtc: string;
  totalTtc: string;
  notes: string | null;
  shippingAddress: Prisma.JsonValue | null;
  items: Array<{
    id: string;
    sku: string;
    name: string;
    imageUrl: string | null;
    quantity: string;
    stockUnit: StockUnit;
    unitPriceTtc: string | null;
    lineTotalTtc: string;
  }>;
};

type NormalizedCheckoutInput = {
  customer: {
    firstName: string;
    lastName: string;
    companyName: string | null;
    email: string;
    phone: string;
    fullName: string;
  };
  fulfillmentMethod: CommerceFulfillmentMethod;
  paymentMethod: CommercePaymentMethod;
  shippingAddress: Prisma.InputJsonObject;
  billingAddress: Prisma.InputJsonObject;
  notes: string | null;
};

type PreparedLine = {
  productId: bigint;
  sku: string;
  name: string;
  slug: string | null;
  imageUrl: string | null;
  brandName: string | null;
  quantity: number;
  stockUnit: StockUnit;
  unitPriceTtc: string | null;
  vatRate: string;
  lineSubtotalTtc: string;
  lineTotalTtc: string;
  taxTtc: number;
  shouldReserveStock: boolean;
};

export class CheckoutError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
  ) {
    super(message);
    this.name = "CheckoutError";
  }
}

function addHours(date: Date, hours: number) {
  const next = new Date(date);
  next.setHours(next.getHours() + hours);
  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned ? cleaned.slice(0, maxLength) : null;
}

function requireText(value: unknown, label: string, maxLength: number) {
  const cleaned = cleanText(value, maxLength);

  if (!cleaned) {
    throw new CheckoutError(`${label} est requis.`);
  }

  return cleaned;
}

function requireEmail(value: unknown) {
  const email = requireText(value, "Email", 255).toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new CheckoutError("Email invalide.");
  }

  return email;
}

function parseFulfillmentMethod(value: unknown): CommerceFulfillmentMethod {
  return value === "PICKUP" ? "PICKUP" : "DELIVERY";
}

function parsePaymentMethod(value: unknown): CommercePaymentMethod {
  if (value === "CASH_ON_DELIVERY" || value === "PAY_IN_STORE") {
    return value;
  }

  return "BANK_TRANSFER";
}

function objectValue(value: unknown) {
  return value != null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function normalizeCheckoutInput(input: unknown): NormalizedCheckoutInput {
  const body = objectValue(input);
  const customerInput = objectValue(body.customer);
  const fulfillmentInput = objectValue(body.fulfillment);
  const addressInput = objectValue(fulfillmentInput.address);
  const paymentInput = objectValue(body.payment);

  const firstName = requireText(customerInput.firstName, "Prenom", 100);
  const lastName = requireText(customerInput.lastName, "Nom", 100);
  const email = requireEmail(customerInput.email);
  const phone = requireText(customerInput.phone, "Telephone", 50);
  const companyName = cleanText(customerInput.companyName, 255);
  const fullName = [firstName, lastName].join(" ");
  const fulfillmentMethod = parseFulfillmentMethod(fulfillmentInput.method);
  const paymentMethod = parsePaymentMethod(paymentInput.method);
  const notes = cleanText(body.notes, 1000);

  const shippingAddress =
    fulfillmentMethod === "PICKUP"
      ? ({
          type: "PICKUP",
          fullName,
          companyName,
          phone,
          addressLine1: "Retrait en magasin COBAM",
          addressLine2: null,
          city: "Tunis",
          governorate: null,
          postalCode: null,
          countryCode: "TN",
        } satisfies Prisma.InputJsonObject)
      : ({
          type: "DELIVERY",
          fullName,
          companyName,
          phone,
          addressLine1: requireText(addressInput.addressLine1, "Adresse", 255),
          addressLine2: cleanText(addressInput.addressLine2, 255),
          city: requireText(addressInput.city, "Ville", 120),
          governorate: cleanText(addressInput.governorate, 120),
          postalCode: cleanText(addressInput.postalCode, 30),
          countryCode: "TN",
        } satisfies Prisma.InputJsonObject);

  return {
    customer: {
      firstName,
      lastName,
      companyName,
      email,
      phone,
      fullName,
    },
    fulfillmentMethod,
    paymentMethod,
    shippingAddress,
    billingAddress: shippingAddress,
    notes,
  };
}

function mediaUrl(id: bigint | number, variant: "original" | "thumbnail" = "original") {
  const query = variant === "thumbnail" ? "?variant=thumbnail" : "";
  return `/api/media/${id.toString()}/file${query}`;
}

function isRenderableMedia(media: {
  id: bigint;
  kind: "IMAGE" | "VIDEO" | "DOCUMENT";
  isActive: boolean;
  deletedAt: Date | null;
}) {
  return media.isActive && media.deletedAt == null;
}

function firstImage(product: Pick<OrderProductRecord, "media">) {
  for (const link of product.media) {
    if (link.role !== "GALLERY" || link.media.kind !== "IMAGE") {
      continue;
    }

    if (isRenderableMedia(link.media)) {
      return mediaUrl(link.media.id, "thumbnail");
    }
  }

  return null;
}

function decimalToNumber(value: Prisma.Decimal | null | undefined) {
  if (value == null) {
    return null;
  }

  const amount = Number(value.toString());
  return Number.isFinite(amount) ? amount : null;
}

function productPrice(product: Pick<OrderProductRecord, "currentPriceTtcTnd" | "basePriceTtcTnd" | "priceVisibility">) {
  if (product.priceVisibility === "NEVER") {
    return null;
  }

  return product.currentPriceTtcTnd ?? product.basePriceTtcTnd;
}

function money(value: number) {
  return value.toFixed(3);
}

function orderNumber(date = new Date()) {
  const yyyy = date.getFullYear().toString();
  const mm = (date.getMonth() + 1).toString().padStart(2, "0");
  const dd = date.getDate().toString().padStart(2, "0");
  const suffix = crypto.randomUUID().slice(0, 8).toUpperCase();

  return `ECB-${yyyy}${mm}${dd}-${suffix}`;
}

function prepareCartLines(cart: CheckoutCartRecord) {
  if (cart.items.length === 0) {
    throw new CheckoutError("Votre panier est vide.");
  }

  let subtotalTtc = 0;
  let taxTtc = 0;
  let itemCount = 0;

  const lines = cart.items.map((item) => {
    const product = item.product;
    const quantity = Math.floor(decimalToNumber(item.quantity) ?? 0);

    if (quantity <= 0) {
      throw new CheckoutError("Une ligne du panier a une quantite invalide.");
    }

    if (!product.visibleEcommerce) {
      throw new CheckoutError(`Le produit ${product.sku} n'est plus disponible.`, 409);
    }

    if (product.stockAvailability === "DISCONTINUED" || product.stockAvailability === "OUT_OF_STOCK") {
      throw new CheckoutError(`Le produit ${product.sku} est en rupture.`, 409);
    }

    const available = Math.floor(decimalToNumber(product.stockAvailable) ?? 0);
    if (product.stockAvailability === "IN_STOCK" && available < quantity) {
      throw new CheckoutError(`Stock disponible insuffisant pour ${product.sku}.`, 409);
    }

    const unitPrice = productPrice(product);
    const unitPriceNumber = decimalToNumber(unitPrice);
    const vatRateNumber = decimalToNumber(product.vatRate) ?? 0;
    const lineSubtotal = unitPriceNumber == null ? 0 : unitPriceNumber * quantity;
    const lineTax = lineSubtotal - lineSubtotal / (1 + vatRateNumber / 100);

    subtotalTtc += lineSubtotal;
    taxTtc += lineTax;
    itemCount += quantity;

    return {
      productId: product.id,
      sku: product.sku,
      name: product.displayName || product.name,
      slug: product.slug,
      imageUrl: firstImage(product),
      brandName: product.brand?.name ?? null,
      quantity,
      stockUnit: product.stockUnit,
      unitPriceTtc: unitPrice == null ? null : unitPrice.toString(),
      vatRate: product.vatRate.toString(),
      lineSubtotalTtc: money(lineSubtotal),
      lineTotalTtc: money(lineSubtotal),
      taxTtc: lineTax,
      shouldReserveStock: product.stockAvailability === "IN_STOCK",
    } satisfies PreparedLine;
  });

  return {
    lines,
    itemCount,
    subtotalTtc: money(subtotalTtc),
    taxTtc: money(taxTtc),
    shippingTtc: "0.000",
    discountTtc: "0.000",
    totalTtc: money(subtotalTtc),
  };
}

export async function createGuestCheckoutOrder(guestToken: string | null | undefined, input: unknown) {
  if (!guestToken) {
    throw new CheckoutError("Votre panier est vide.");
  }

  const normalized = normalizeCheckoutInput(input);
  const db = await getPrisma();
  const now = new Date();

  return db.$transaction(async (tx) => {
    const cart = await tx.shoppingCart.findFirst({
      where: {
        guestToken,
        status: "ACTIVE",
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      select: CHECKOUT_CART_SELECT,
    });

    if (!cart) {
      throw new CheckoutError("Votre panier est vide.");
    }

    const totals = prepareCartLines(cart);
    const checkoutSession = await tx.checkoutSession.create({
      data: {
        cartId: cart.id,
        status: "COMPLETED",
        currency: cart.currency,
        subtotalTtc: totals.subtotalTtc,
        discountTtc: totals.discountTtc,
        shippingTtc: totals.shippingTtc,
        taxTtc: totals.taxTtc,
        totalTtc: totals.totalTtc,
        shippingAddressSnapshot: normalized.shippingAddress,
        billingAddressSnapshot: normalized.billingAddress,
        expiresAt: addHours(now, CHECKOUT_SESSION_EXPIRY_HOURS),
        completedAt: now,
      },
      select: { id: true },
    });

    const order = await tx.commerceOrder.create({
      data: {
        orderNumber: orderNumber(now),
        cartId: cart.id,
        guestEmail: normalized.customer.email,
        guestPhone: normalized.customer.phone,
        status: "PENDING",
        paymentStatus: "PENDING",
        fulfillmentStatus: "PENDING",
        currency: cart.currency,
        subtotalTtc: totals.subtotalTtc,
        discountTtc: totals.discountTtc,
        shippingTtc: totals.shippingTtc,
        taxTtc: totals.taxTtc,
        totalTtc: totals.totalTtc,
        customerSnapshot: {
          type: normalized.customer.companyName ? "COMPANY" : "INDIVIDUAL",
          ...normalized.customer,
        },
        billingAddressSnapshot: normalized.billingAddress,
        shippingAddressSnapshot: normalized.shippingAddress,
        notes: normalized.notes,
        placedAt: now,
        items: {
          create: totals.lines.map((line) => ({
            productId: line.productId,
            sku: line.sku,
            name: line.name,
            slug: line.slug,
            imageUrl: line.imageUrl,
            brandName: line.brandName,
            quantity: money(line.quantity),
            stockUnit: line.stockUnit,
            unitPriceTtc: line.unitPriceTtc,
            vatRate: line.vatRate,
            discountTtc: "0.000",
            lineSubtotalTtc: line.lineSubtotalTtc,
            lineTotalTtc: line.lineTotalTtc,
          })),
        },
        statusEvents: {
          create: {
            toStatus: "PENDING",
            note: "Commande creee depuis le checkout e-cobam.",
          },
        },
      },
      select: { id: true, orderNumber: true },
    });

    await tx.commercePayment.create({
      data: {
        orderId: order.id,
        checkoutSessionId: checkoutSession.id,
        provider: "manual",
        method: normalized.paymentMethod,
        status: "PENDING",
        amount: totals.totalTtc,
        currency: cart.currency,
      },
    });

    await tx.commerceFulfillment.create({
      data: {
        orderId: order.id,
        method: normalized.fulfillmentMethod,
        status: "PENDING",
        deliveryAddressSnapshot:
          normalized.fulfillmentMethod === "DELIVERY" ? normalized.shippingAddress : undefined,
        notes: normalized.notes,
      },
    });

    const reservationLines = totals.lines.filter((line) => line.shouldReserveStock);
    if (reservationLines.length > 0) {
      await tx.commerceStockReservation.createMany({
        data: reservationLines.map((line) => ({
          productId: line.productId,
          orderId: order.id,
          cartId: cart.id,
          quantity: money(line.quantity),
          status: "RESERVED",
          expiresAt: addDays(now, STOCK_RESERVATION_DAYS),
        })),
      });
    }

    await tx.shoppingCart.update({
      where: { id: cart.id },
      data: {
        status: "CONVERTED",
        expiresAt: null,
      },
    });

    return {
      orderNumber: order.orderNumber,
      orderId: order.id.toString(),
      totalTtc: totals.totalTtc,
      itemCount: totals.itemCount,
      paymentMethod: normalized.paymentMethod,
      fulfillmentMethod: normalized.fulfillmentMethod,
    } satisfies CheckoutOrderResult;
  });
}

export async function getPublicOrderSummary(orderNumberValue: string): Promise<PublicOrderSummary | null> {
  const db = await getPrisma();
  const order = await db.commerceOrder.findUnique({
    where: { orderNumber: orderNumberValue },
    select: {
      orderNumber: true,
      placedAt: true,
      status: true,
      paymentStatus: true,
      fulfillmentStatus: true,
      guestEmail: true,
      guestPhone: true,
      subtotalTtc: true,
      taxTtc: true,
      shippingTtc: true,
      totalTtc: true,
      notes: true,
      shippingAddressSnapshot: true,
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
          imageUrl: true,
          quantity: true,
          stockUnit: true,
          unitPriceTtc: true,
          lineTotalTtc: true,
        },
      },
    },
  });

  if (!order) {
    return null;
  }

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
    taxTtc: order.taxTtc.toString(),
    shippingTtc: order.shippingTtc.toString(),
    totalTtc: order.totalTtc.toString(),
    notes: order.notes,
    shippingAddress: order.shippingAddressSnapshot,
    items: order.items.map((item) => ({
      id: item.id.toString(),
      sku: item.sku,
      name: item.name,
      imageUrl: item.imageUrl,
      quantity: item.quantity.toString(),
      stockUnit: item.stockUnit,
      unitPriceTtc: item.unitPriceTtc?.toString() ?? null,
      lineTotalTtc: item.lineTotalTtc.toString(),
    })),
  };
}
