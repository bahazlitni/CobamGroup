"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { CART_ACTION_ANIMATION_EVENT } from "@/components/commerce/product-action-buttons";
import { cn } from "@/lib/cn";
import { CART_UPDATED_EVENT, getCartCount, readCart, type CartState } from "@/lib/cart-store";

export function CartBadge({ active = false }: { active?: boolean }) {
  const [count, setCount] = useState(0);
  const controls = useAnimationControls();

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

  useEffect(() => {
    function handleActionAnimation(event: Event) {
      const action = (event as CustomEvent<{ action?: "added" | "removed" }>).detail?.action;

      void controls.start(
        action === "removed"
          ? {
              scale: [1, 0.92, 1],
              transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
            }
          : {
              scale: [1, 1.16, 0.96, 1],
              rotate: [0, -5, 4, 0],
              transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
            },
      );
    }

    window.addEventListener(CART_ACTION_ANIMATION_EVENT, handleActionAnimation);
    return () => window.removeEventListener(CART_ACTION_ANIMATION_EVENT, handleActionAnimation);
  }, [controls]);

  return (
    <motion.span
      animate={controls}
      className={cn(
        "relative inline-grid size-10 place-items-center rounded-full border bg-white transition",
        active
          ? "border-ec-blue/50 bg-ec-blue/10 text-ec-blue shadow-[0_0_0_4px_rgba(10,141,193,0.08)]"
          : "border-ec-line text-ec-ink hover:border-ec-blue/40 hover:text-ec-blue",
      )}
    >
      <ShoppingBag className="size-5" />
      <AnimatePresence mode="popLayout" initial={false}>
        {count > 0 ? (
          <motion.span
            key={count}
            className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-ec-blue px-1 text-[11px] font-bold text-white"
            initial={{ scale: 0.72, y: 2, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.72, y: 2, opacity: 0 }}
            transition={{ type: "spring", stiffness: 620, damping: 22 }}
          >
            {count}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </motion.span>
  );
}
