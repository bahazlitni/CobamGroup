"use client";

import type { ProductAvailability, StockUnit } from "@prisma/client";
import type { PromotionQuote } from "@/lib/promotion-types";

export type CartItemSnapshot = {
  id: number;
  sku: string;
  name: string;
  price: string | null;
  imageUrl: string | null;
};

export type CartLine = CartItemSnapshot & {
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

const LEGACY_CART_KEY = "e-cobam-cart";
const COUPON_CODE_KEY = "e-cobam-coupon-code";
export const CART_UPDATED_EVENT = "e-cobam-cart-updated";

export const EMPTY_CART: CartState = {
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

function parseLegacyCart(value: string | null): Array<CartItemSnapshot & { quantity: number }> {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item): item is CartItemSnapshot & { quantity: number } => {
        return (
          item != null &&
          typeof item === "object" &&
          typeof (item as CartItemSnapshot).id === "number" &&
          typeof (item as CartItemSnapshot).sku === "string" &&
          typeof (item as CartItemSnapshot).name === "string" &&
          typeof (item as { quantity?: unknown }).quantity === "number"
        );
      })
      .map((item) => ({
        ...item,
        quantity: Math.max(1, Math.floor(item.quantity)),
      }));
  } catch {
    return [];
  }
}

function dispatchCartUpdated(cart: CartState) {
  window.dispatchEvent(new CustomEvent<CartState>(CART_UPDATED_EVENT, { detail: cart }));
}

async function requestCart(path: string, init?: RequestInit, emit = false) {
  const response = await fetch(path, {
    ...init,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? "Le panier n'est pas disponible pour le moment.");
  }

  const cart = (await response.json()) as CartState;

  if (emit) {
    dispatchCartUpdated(cart);
  }

  return cart;
}

let legacySyncPromise: Promise<void> | null = null;

async function syncLegacyCart() {
  if (typeof window === "undefined") {
    return;
  }

  if (legacySyncPromise) {
    return legacySyncPromise;
  }

  legacySyncPromise = (async () => {
    const legacyLines = parseLegacyCart(window.localStorage.getItem(LEGACY_CART_KEY));

    if (legacyLines.length === 0) {
      return;
    }

    for (const line of legacyLines) {
      await requestCart(
        "/api/cart",
        {
          method: "POST",
          body: JSON.stringify({ productId: line.id, quantity: line.quantity }),
        },
        false,
      );
    }

    window.localStorage.removeItem(LEGACY_CART_KEY);
  })().catch((error) => {
    legacySyncPromise = null;
    console.error(error);
  });

  return legacySyncPromise;
}

export async function readCart() {
  await syncLegacyCart();
  return requestCart("/api/cart");
}

export async function addCartItem(snapshot: CartItemSnapshot, quantity = 1) {
  await syncLegacyCart();

  return requestCart(
    "/api/cart",
    {
      method: "POST",
      body: JSON.stringify({ productId: snapshot.id, quantity }),
    },
    true,
  );
}

export async function updateCartLine(productId: number, quantity: number) {
  await syncLegacyCart();

  return requestCart(
    `/api/cart/items/${productId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    },
    true,
  );
}

export async function clearCart() {
  await syncLegacyCart();
  clearStoredCouponCode();
  return requestCart("/api/cart", { method: "DELETE" }, true);
}

export async function restoreCartState(previousCart: CartState) {
  await syncLegacyCart();
  clearStoredCouponCode();
  await requestCart("/api/cart", { method: "DELETE" }, false);

  let restoredCart = EMPTY_CART;

  for (const line of previousCart.lines) {
    restoredCart = await requestCart(
      "/api/cart",
      {
        method: "POST",
        body: JSON.stringify({ productId: line.id, quantity: line.quantity }),
      },
      false,
    );
  }

  dispatchCartUpdated(restoredCart);
  return restoredCart;
}

export function getCartCount(cart: CartState | CartLine[]) {
  const lines = Array.isArray(cart) ? cart : cart.lines;

  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

export function readStoredCouponCode() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(COUPON_CODE_KEY) ?? "";
}

export function storeCouponCode(code: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(COUPON_CODE_KEY, code);
}

export function clearStoredCouponCode() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(COUPON_CODE_KEY);
}

export async function validatePromotionCode(code: string) {
  const response = await fetch("/api/promotions/coupon", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(body?.message ?? "Code promo invalide.");
  }

  const body = (await response.json()) as { promotion: PromotionQuote };
  return body.promotion;
}
