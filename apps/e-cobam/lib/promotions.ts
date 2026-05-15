import "server-only";

import { Prisma } from "@prisma/client";
import type { CustomerSession } from "@/lib/customer-auth";
import type { PromotionQuote } from "@/lib/promotion-types";

type PromotionDb = Pick<
  Prisma.TransactionClient,
  "shoppingCart" | "commerceCoupon" | "commercePromotionRedemption" | "commercePromotion"
>;

const PROMOTION_PRODUCT_SELECT = {
  id: true,
  brandId: true,
  productTypeId: true,
  visibleEcommerce: true,
  currentPriceTtcTnd: true,
  basePriceTtcTnd: true,
  priceVisibility: true,
  subcategories: {
    select: {
      subcategory: {
        select: {
          categoryId: true,
          isActive: true,
          visibleEcommerce: true,
          category: { select: { isActive: true } },
        },
      },
    },
  },
} satisfies Prisma.ProductSelect;

const PROMOTION_CART_SELECT = {
  id: true,
  currency: true,
  items: {
    select: {
      quantity: true,
      product: { select: PROMOTION_PRODUCT_SELECT },
    },
  },
} satisfies Prisma.ShoppingCartSelect;

const COUPON_SELECT = {
  id: true,
  code: true,
  usageLimit: true,
  usageLimitPerCustomer: true,
  usageCount: true,
  customers: {
    select: {
      customerId: true,
    },
  },
  promotion: {
    select: {
      id: true,
      name: true,
      discountType: true,
      discountValue: true,
      minimumSubtotalTtc: true,
      usageLimit: true,
      usageCount: true,
      products: { select: { productId: true } },
      categories: { select: { categoryId: true } },
      brands: { select: { brandId: true } },
    },
  },
} satisfies Prisma.CommerceCouponSelect;

type PromotionCart = Prisma.ShoppingCartGetPayload<{ select: typeof PROMOTION_CART_SELECT }>;
type CouponRecord = Prisma.CommerceCouponGetPayload<{ select: typeof COUPON_SELECT }>;

export type AppliedPromotion = PromotionQuote & {
  promotionId: bigint;
  couponId: bigint;
};

export class PromotionError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
  ) {
    super(message);
    this.name = "PromotionError";
  }
}

async function getPrisma() {
  const { prisma } = await import("@cobam/db");
  return prisma;
}

function money(value: number) {
  return Math.max(0, value).toFixed(3);
}

export function normalizeCouponCode(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const code = value.replace(/\s+/g, "").trim().toUpperCase();
  return code ? code.slice(0, 80) : null;
}

function decimalToNumber(value: Prisma.Decimal | null | undefined) {
  if (value == null) {
    return null;
  }

  const amount = Number(value.toString());
  return Number.isFinite(amount) ? amount : null;
}

function productPrice(
  product: Pick<
    PromotionCart["items"][number]["product"],
    "currentPriceTtcTnd" | "basePriceTtcTnd" | "priceVisibility"
  >,
) {
  if (product.priceVisibility === "NEVER") {
    return null;
  }

  return product.currentPriceTtcTnd ?? product.basePriceTtcTnd;
}

function cartSubtotals(cart: PromotionCart) {
  let subtotalTtc = 0;

  const lines = cart.items.map((item) => {
    const quantity = Math.max(0, Math.floor(decimalToNumber(item.quantity) ?? 0));
    const unitPrice = decimalToNumber(productPrice(item.product));
    const subtotal = unitPrice == null ? 0 : unitPrice * quantity;

    subtotalTtc += subtotal;

    return {
      product: item.product,
      subtotalTtc: subtotal,
    };
  });

  return { lines, subtotalTtc };
}

function productCategoryIds(product: PromotionCart["items"][number]["product"]) {
  const ids = new Set<bigint>();

  if (product.productTypeId != null) {
    ids.add(product.productTypeId);
  }

  for (const link of product.subcategories) {
    const subcategory = link.subcategory;

    if (subcategory.isActive && subcategory.visibleEcommerce && subcategory.category.isActive) {
      ids.add(subcategory.categoryId);
    }
  }

  return ids;
}

function eligibleSubtotal(cart: PromotionCart, coupon: CouponRecord) {
  const productIds = new Set(coupon.promotion.products.map((link) => link.productId.toString()));
  const categoryIds = new Set(
    coupon.promotion.categories.map((link) => link.categoryId.toString()),
  );
  const brandIds = new Set(coupon.promotion.brands.map((link) => link.brandId.toString()));
  const hasTargetRules = productIds.size > 0 || categoryIds.size > 0 || brandIds.size > 0;
  const { lines, subtotalTtc } = cartSubtotals(cart);

  if (!hasTargetRules) {
    return { subtotalTtc, eligibleSubtotalTtc: subtotalTtc };
  }

  const eligibleSubtotalTtc = lines.reduce((sum, line) => {
    const product = line.product;
    const categories = productCategoryIds(product);
    const categoryMatches = [...categories].some((id) => categoryIds.has(id.toString()));
    const eligible =
      productIds.has(product.id.toString()) ||
      (product.brandId != null && brandIds.has(product.brandId.toString())) ||
      categoryMatches;

    return eligible ? sum + line.subtotalTtc : sum;
  }, 0);

  return { subtotalTtc, eligibleSubtotalTtc };
}

async function loadActiveCoupon(db: PromotionDb, code: string, now: Date) {
  const coupon = await db.commerceCoupon.findFirst({
    where: {
      code: { equals: code, mode: "insensitive" },
      isActive: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
      promotion: {
        is: {
          status: "ACTIVE",
          AND: [
            { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
            { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
          ],
        },
      },
    },
    select: COUPON_SELECT,
  });

  if (!coupon) {
    throw new PromotionError("Ce code promo n'est pas actif.");
  }

  return coupon;
}

async function assertCouponUsage(db: PromotionDb, coupon: CouponRecord, customerId: bigint | null) {
  if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) {
    throw new PromotionError("Ce code promo a atteint sa limite d'utilisation.", 409);
  }

  if (
    coupon.promotion.usageLimit != null &&
    coupon.promotion.usageCount >= coupon.promotion.usageLimit
  ) {
    throw new PromotionError("Cette promotion a atteint sa limite d'utilisation.", 409);
  }

  if (coupon.customers.length > 0) {
    if (customerId == null) {
      throw new PromotionError("Connectez-vous pour utiliser ce code promo.", 401);
    }

    const allowedCustomerIds = new Set(coupon.customers.map((link) => link.customerId.toString()));

    if (!allowedCustomerIds.has(customerId.toString())) {
      throw new PromotionError("Ce code promo est reserve a certains clients.", 403);
    }
  }

  if (customerId != null && coupon.usageLimitPerCustomer != null) {
    const redemptions = await db.commercePromotionRedemption.count({
      where: { couponId: coupon.id, customerId },
    });

    if (redemptions >= coupon.usageLimitPerCustomer) {
      throw new PromotionError("Ce code promo a deja ete utilise pour ce compte.", 409);
    }
  }
}

function buildQuote(coupon: CouponRecord, cart: PromotionCart): AppliedPromotion {
  const { subtotalTtc, eligibleSubtotalTtc } = eligibleSubtotal(cart, coupon);
  const minimumSubtotal = decimalToNumber(coupon.promotion.minimumSubtotalTtc);

  if (subtotalTtc <= 0) {
    throw new PromotionError("Ce code promo ne s'applique pas aux lignes sur devis.");
  }

  if (minimumSubtotal != null && subtotalTtc < minimumSubtotal) {
    throw new PromotionError(
      `Ce code promo demande un sous-total minimum de ${money(minimumSubtotal)} TND.`,
    );
  }

  if (eligibleSubtotalTtc <= 0 && coupon.promotion.discountType !== "FREE_SHIPPING") {
    throw new PromotionError("Ce code promo ne s'applique pas aux produits du panier.");
  }

  const value = decimalToNumber(coupon.promotion.discountValue) ?? 0;
  let discountTtc = 0;
  let message = "Code promo applique.";

  if (coupon.promotion.discountType === "PERCENT") {
    discountTtc = eligibleSubtotalTtc * (Math.max(0, value) / 100);
    message = `${money(Math.min(value, 100))}% de réduction appliquée.`;
  }

  if (coupon.promotion.discountType === "FIXED_AMOUNT") {
    discountTtc = Math.min(Math.max(0, value), eligibleSubtotalTtc);
    message = `${money(discountTtc)} TND de réduction appliquée.`;
  }

  if (coupon.promotion.discountType === "FREE_SHIPPING") {
    message = "Livraison offerte si des frais sont appliques.";
  }

  discountTtc = Math.min(discountTtc, subtotalTtc);

  if (discountTtc <= 0 && coupon.promotion.discountType !== "FREE_SHIPPING") {
    throw new PromotionError("Ce code promo ne genere aucune réduction pour ce panier.");
  }

  return {
    promotionId: coupon.promotion.id,
    couponId: coupon.id,
    code: coupon.code,
    name: coupon.promotion.name,
    discountType: coupon.promotion.discountType,
    subtotalTtc: money(subtotalTtc),
    eligibleSubtotalTtc: money(eligibleSubtotalTtc),
    discountTtc: money(discountTtc),
    totalTtc: money(subtotalTtc - discountTtc),
    message,
  };
}

export async function quotePromotionForCartId(
  db: PromotionDb,
  cartId: bigint,
  couponCode: string | null,
  customerId: bigint | null,
  now = new Date(),
) {
  const code = normalizeCouponCode(couponCode);

  if (!code) {
    return null;
  }

  const cart = await db.shoppingCart.findUnique({
    where: { id: cartId },
    select: PROMOTION_CART_SELECT,
  });

  if (!cart || cart.items.length === 0) {
    throw new PromotionError("Votre panier est vide.");
  }

  const coupon = await loadActiveCoupon(db, code, now);
  await assertCouponUsage(db, coupon, customerId);

  return buildQuote(coupon, cart);
}

export async function quotePromotionForGuestCart(
  guestToken: string | null | undefined,
  couponCode: string | null,
  customerSession?: CustomerSession | null,
) {
  const code = normalizeCouponCode(couponCode);

  if (!code) {
    throw new PromotionError("Entrez un code promo.");
  }

  if (!guestToken) {
    throw new PromotionError("Votre panier est vide.");
  }

  const db = await getPrisma();
  const now = new Date();
  const cart = await db.shoppingCart.findFirst({
    where: {
      guestToken,
      status: "ACTIVE",
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    select: { id: true },
  });

  if (!cart) {
    throw new PromotionError("Votre panier est vide.");
  }

  return quotePromotionForCartId(
    db,
    cart.id,
    code,
    customerSession ? BigInt(customerSession.customerId) : null,
    now,
  );
}

export async function recordPromotionRedemption(
  db: Prisma.TransactionClient,
  promotion: AppliedPromotion | null,
  orderId: bigint,
  customerId: bigint | null,
) {
  if (!promotion || Number(promotion.discountTtc) <= 0) {
    return;
  }

  await db.commercePromotionRedemption.create({
    data: {
      promotionId: promotion.promotionId,
      couponId: promotion.couponId,
      customerId,
      orderId,
      discountAmountTtc: promotion.discountTtc,
    },
  });

  await db.commercePromotion.update({
    where: { id: promotion.promotionId },
    data: { usageCount: { increment: 1 } },
  });

  await db.commerceCoupon.update({
    where: { id: promotion.couponId },
    data: { usageCount: { increment: 1 } },
  });
}
