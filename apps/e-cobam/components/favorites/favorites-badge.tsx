"use client";

import { useEffect, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { Heart } from "lucide-react";
import { FAVORITES_ACTION_ANIMATION_EVENT } from "@/components/commerce/product-action-buttons";
import { getFavoritesSnapshot, subscribeFavorites } from "@/lib/favorites-store";
import { cn } from "@/lib/cn";

export function FavoritesBadge({ active = false }: { active?: boolean }) {
  const count = useSyncExternalStore(
    subscribeFavorites,
    () => getFavoritesSnapshot().items.length,
    () => 0,
  );
  const controls = useAnimationControls();

  useEffect(() => {
    function handleActionAnimation(event: Event) {
      const action = (event as CustomEvent<{ action?: "added" | "removed" }>).detail?.action;

      void controls.start(
        action === "removed"
          ? {
              scale: [1, 0.9, 1],
              transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
            }
          : {
              scale: [1, 1.18, 0.95, 1],
              transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
            },
      );
    }

    window.addEventListener(FAVORITES_ACTION_ANIMATION_EVENT, handleActionAnimation);
    return () => window.removeEventListener(FAVORITES_ACTION_ANIMATION_EVENT, handleActionAnimation);
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
      <Heart className="size-5" />
      <AnimatePresence mode="popLayout" initial={false}>
        {count > 0 ? (
          <motion.span
            key={count}
            className="bg-ec-blue absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full px-1 text-[11px] font-bold text-white"
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
