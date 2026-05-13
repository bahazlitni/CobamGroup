"use client";

export type CartItemSnapshot = {
  id: number;
  sku: string;
  name: string;
  price: string | null;
  imageUrl: string | null;
};

export type CartLine = CartItemSnapshot & {
  quantity: number;
};

const CART_KEY = "e-cobam-cart";
export const CART_UPDATED_EVENT = "e-cobam-cart-updated";

function parseCart(value: string | null): CartLine[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((item): item is CartLine => {
        return (
          item != null &&
          typeof item === "object" &&
          typeof (item as CartLine).id === "number" &&
          typeof (item as CartLine).sku === "string" &&
          typeof (item as CartLine).name === "string" &&
          typeof (item as CartLine).quantity === "number"
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

function writeCart(lines: CartLine[]) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(lines));
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
}

export function readCart() {
  if (typeof window === "undefined") {
    return [];
  }

  return parseCart(window.localStorage.getItem(CART_KEY));
}

export function addCartItem(snapshot: CartItemSnapshot, quantity = 1) {
  const lines = readCart();
  const existing = lines.find((line) => line.id === snapshot.id);

  if (existing) {
    existing.quantity += Math.max(1, Math.floor(quantity));
    writeCart(lines);
    return lines;
  }

  const next = [...lines, { ...snapshot, quantity: Math.max(1, Math.floor(quantity)) }];
  writeCart(next);
  return next;
}

export function updateCartLine(productId: number, quantity: number) {
  const next = readCart()
    .map((line) => (line.id === productId ? { ...line, quantity: Math.floor(quantity) } : line))
    .filter((line) => line.quantity > 0);

  writeCart(next);
  return next;
}

export function clearCart() {
  writeCart([]);
}

export function getCartCount(lines: CartLine[]) {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}
