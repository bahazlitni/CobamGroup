"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { CART_UPDATED_EVENT, getCartCount, readCart, type CartState } from "@/lib/cart-store";

export function CartBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    async function refresh() {
      try {
        const cart = await readCart();
        if (mounted) {
          setCount(getCartCount(cart));
        }
      } catch {
        if (mounted) {
          setCount(0);
        }
      }
    }

    function handleCartUpdated(event: Event) {
      const detail = (event as CustomEvent<CartState>).detail;

      if (detail?.lines) {
        setCount(getCartCount(detail));
        return;
      }

      void refresh();
    }

    void refresh();
    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);

    return () => {
      mounted = false;
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    };
  }, []);

  return (
    <span className="relative inline-grid size-10 place-items-center rounded-full border border-ec-line bg-white text-ec-ink transition hover:border-ec-blue/40 hover:text-ec-blue">
      <ShoppingBag className="size-5" />
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-ec-blue px-1 text-[11px] font-bold text-white">
          {count}
        </span>
      ) : null}
    </span>
  );
}
