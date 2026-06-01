import { Prisma, type ProductAvailability, type StockUnit } from "@prisma/client";
import { safeRandomUUID } from "@/lib/safe-random-uuid";

export const CART_TOKEN_COOKIE = "e-cobam-cart-token";
export const CART_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const CART_EXPIRY_DAYS = 30;

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

const CART_PRODUCT_SELECT = {
  id: true,
  sku: true,
  slug: true,
  name: true,
  displayName: true,
  lifecycle: true,
  visibleEcommerce: true,
  currentPriceTtcTnd: true,
  basePriceTtcTnd: true,
  priceVisibility: true,
  vatRate: true,
  stockAvailable: true,
  stockAvailability: true,
  stockUnit: true,
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

const CART_ITEM_SELECT = {
  id: true,
  quantity: true,
  unitPriceTtc: true,
  vatRate: true,
  priceSnapshot: true,
  product: { select: CART_PRODUCT_SELECT },
} satisfies Prisma.ShoppingCartItemSelect;

type CartProductRecord = Prisma.ProductGetPayload<{ select: typeof CART_PRODUCT_SELECT }>;
type CartItemRecord = Prisma.ShoppingCartItemGetPayload<{ select: typeof CART_ITEM_SELECT }>;

export type CartLine = {
  id: number;
  sku: string;
  name: string;
  price: string | null;
  imageUrl: string | null;
  quantity: number;
  stock: {
    available: string;
    unit: StockUnit;
    availability: ProductAvailability;
    label: string;
    tone: "available" | "warning" | "unavailable";
  };
  lineTotalTtc: string | null;
  priceChanged: boolean;
};

export type CartState = {
  lines: CartLine[];
  summary: {
    itemCount: number;
    subtotalTtc: string;
    taxTtc: string;
    deliveryEstimateTtc: string | null;
    totalTtc: string;
    hasQuoteLines: boolean;
  };
};

export class CartError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
  ) {
    super(message);
    this.name = "CartError";
  }
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
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

function firstImage(product: Pick<CartProductRecord, "media">) {
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

function decimalToString(value: Prisma.Decimal | null | undefined) {
  return value == null ? null : value.toString();
}

function productPrice(product: Pick<CartProductRecord, "currentPriceTtcTnd" | "basePriceTtcTnd" | "priceVisibility">) {
  if (product.priceVisibility === "NEVER") {
    return null;
  }

  return product.currentPriceTtcTnd ?? product.basePriceTtcTnd;
}

function stockLabel(availability: ProductAvailability, available: Prisma.Decimal) {
  const amount = decimalToNumber(available) ?? 0;

  if (availability === "OUT_OF_STOCK" || amount <= 0) {
    return { label: "Rupture", tone: "unavailable" as const };
  }

  if (availability === "ON_ORDER") {
    return { label: "Sur commande", tone: "warning" as const };
  }

  return { label: "En stock", tone: "available" as const };
}

function requestedQuantity(value: unknown) {
  const quantity = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(quantity)) {
    return 1;
  }

  return Math.max(1, Math.floor(quantity));
}

function allowedQuantity(product: CartProductRecord, quantity: number) {
  const available = Math.floor(decimalToNumber(product.stockAvailable) ?? 0);

  if (product.lifecycle === "DISCONTINUED" || product.stockAvailability === "OUT_OF_STOCK") {
    return 0;
  }

  if (product.stockAvailability === "IN_STOCK") {
    return Math.min(quantity, Math.max(0, available));
  }

  return quantity;
}

function assertPurchasable(product: CartProductRecord, requested: number) {
  if (!product.visibleEcommerce || product.lifecycle === "DISCONTINUED") {
    throw new CartError("Ce produit n'est pas disponible dans la boutique.", 404);
  }

  const quantity = allowedQuantity(product, requested);
  if (quantity <= 0) {
    throw new CartError("Ce produit est actuellement indisponible.", 409);
  }

  if (quantity < requested) {
    throw new CartError(`Stock disponible insuffisant. Quantité ajustée possible: ${quantity}.`, 409);
  }
}

function priceSnapshot(product: CartProductRecord) {
  const price = productPrice(product);

  return {
    sku: product.sku,
    name: product.displayName || product.name,
    unitPriceTtc: decimalToString(price),
    vatRate: product.vatRate.toString(),
    capturedAt: new Date().toISOString(),
  } satisfies Prisma.InputJsonObject;
}

function emptyCartState(): CartState {
  return {
    lines: [],
    summary: {
      itemCount: 0,
      subtotalTtc: "0",
      taxTtc: "0",
      deliveryEstimateTtc: null,
      totalTtc: "0",
      hasQuoteLines: false,
    },
  };
}

function mapCartState(items: CartItemRecord[]): CartState {
  let subtotalTtc = 0;
  let taxTtc = 0;
  let itemCount = 0;
  let hasQuoteLines = false;

  const lines = items.map((item) => {
    const livePrice = productPrice(item.product);
    const storedPrice = item.unitPriceTtc;
    const quantity = Math.floor(decimalToNumber(item.quantity) ?? 0);
    const unitPrice = decimalToNumber(storedPrice);
    const vatRate = decimalToNumber(item.vatRate) ?? 0;
    const lineTotal = unitPrice == null ? null : unitPrice * quantity;
    const livePriceString = decimalToString(livePrice);
    const storedPriceString = decimalToString(storedPrice);

    itemCount += quantity;

    if (lineTotal == null) {
      hasQuoteLines = true;
    } else {
      subtotalTtc += lineTotal;
      taxTtc += lineTotal - lineTotal / (1 + vatRate / 100);
    }

    return {
      id: Number(item.product.id),
      sku: item.product.sku,
      name: item.product.displayName || item.product.name,
      price: storedPriceString,
      imageUrl: firstImage(item.product),
      quantity,
      stock: {
        available: item.product.stockAvailable.toString(),
        unit: item.product.stockUnit,
        availability: item.product.stockAvailability,
        ...stockLabel(item.product.stockAvailability, item.product.stockAvailable),
      },
      lineTotalTtc: lineTotal == null ? null : lineTotal.toFixed(3),
      priceChanged: livePriceString !== storedPriceString,
    } satisfies CartLine;
  });

  return {
    lines,
    summary: {
      itemCount,
      subtotalTtc: subtotalTtc.toFixed(3),
      taxTtc: taxTtc.toFixed(3),
      deliveryEstimateTtc: null,
      totalTtc: subtotalTtc.toFixed(3),
      hasQuoteLines,
    },
  };
}

async function ensureGuestCart(guestToken: string | null | undefined) {
  const db = await getPrisma();
  const now = new Date();
  const expiresAt = addDays(now, CART_EXPIRY_DAYS);

  if (guestToken) {
    const existing = await db.shoppingCart.findFirst({
      where: {
        guestToken,
        status: "ACTIVE",
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      select: { id: true, guestToken: true },
    });

    if (existing) {
      await db.shoppingCart.update({
        where: { id: existing.id },
        data: { expiresAt },
      });

      return { cartId: existing.id, token: existing.guestToken ?? guestToken };
    }
  }

  const token = safeRandomUUID();
  const cart = await db.shoppingCart.create({
    data: {
      guestToken: token,
      status: "ACTIVE",
      currency: "TND",
      expiresAt,
    },
    select: { id: true },
  });

  return { cartId: cart.id, token };
}

async function getCartItems(cartId: bigint) {
  const db = await getPrisma();

  return db.shoppingCartItem.findMany({
    where: { cartId },
    orderBy: { createdAt: "asc" },
    select: CART_ITEM_SELECT,
  });
}

export async function readGuestCart(guestToken: string | null | undefined) {
  const { cartId, token } = await ensureGuestCart(guestToken);
  const items = await getCartItems(cartId);

  return { token, cart: mapCartState(items) };
}

export async function addGuestCartItem(
  guestToken: string | null | undefined,
  productId: number,
  quantityInput: unknown,
) {
  const db = await getPrisma();
  const requested = requestedQuantity(quantityInput);
  const product = await db.product.findFirst({
    where: { id: BigInt(productId) },
    select: CART_PRODUCT_SELECT,
  });

  if (!product) {
    throw new CartError("Produit introuvable.", 404);
  }

  assertPurchasable(product, requested);

  const { cartId, token } = await ensureGuestCart(guestToken);
  const existing = await db.shoppingCartItem.findUnique({
    where: { cartId_productId: { cartId, productId: product.id } },
    select: { quantity: true },
  });
  const existingQuantity = Math.floor(decimalToNumber(existing?.quantity) ?? 0);
  const nextQuantity = existingQuantity + requested;

  assertPurchasable(product, nextQuantity);

  const unitPriceTtc = productPrice(product);

  await db.shoppingCartItem.upsert({
    where: { cartId_productId: { cartId, productId: product.id } },
    create: {
      cartId,
      productId: product.id,
      quantity: nextQuantity,
      unitPriceTtc,
      vatRate: product.vatRate,
      priceSnapshot: priceSnapshot(product),
    },
    update: {
      quantity: nextQuantity,
      unitPriceTtc,
      vatRate: product.vatRate,
      priceSnapshot: priceSnapshot(product),
    },
  });

  const items = await getCartItems(cartId);
  return { token, cart: mapCartState(items) };
}

export async function updateGuestCartItem(
  guestToken: string | null | undefined,
  productId: number,
  quantityInput: unknown,
) {
  const db = await getPrisma();
  const { cartId, token } = await ensureGuestCart(guestToken);
  const nextQuantity = Number(quantityInput);

  if (!Number.isFinite(nextQuantity) || Math.floor(nextQuantity) <= 0) {
    await db.shoppingCartItem.deleteMany({
      where: { cartId, productId: BigInt(productId) },
    });

    const items = await getCartItems(cartId);
    return { token, cart: mapCartState(items) };
  }

  const product = await db.product.findFirst({
    where: { id: BigInt(productId) },
    select: CART_PRODUCT_SELECT,
  });

  if (!product) {
    throw new CartError("Produit introuvable.", 404);
  }

  const requested = requestedQuantity(nextQuantity);
  assertPurchasable(product, requested);

  const unitPriceTtc = productPrice(product);

  await db.shoppingCartItem.upsert({
    where: { cartId_productId: { cartId, productId: product.id } },
    create: {
      cartId,
      productId: product.id,
      quantity: requested,
      unitPriceTtc,
      vatRate: product.vatRate,
      priceSnapshot: priceSnapshot(product),
    },
    update: {
      quantity: requested,
      unitPriceTtc,
      vatRate: product.vatRate,
      priceSnapshot: priceSnapshot(product),
    },
  });

  const items = await getCartItems(cartId);
  return { token, cart: mapCartState(items) };
}

export async function clearGuestCart(guestToken: string | null | undefined) {
  const { cartId, token } = await ensureGuestCart(guestToken);
  const db = await getPrisma();

  await db.shoppingCartItem.deleteMany({ where: { cartId } });

  return { token, cart: emptyCartState() };
}
