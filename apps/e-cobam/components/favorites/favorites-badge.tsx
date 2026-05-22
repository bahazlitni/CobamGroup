"use client";

import { useSyncExternalStore } from "react";
import { Heart } from "lucide-react";
import { getFavoritesSnapshot, subscribeFavorites } from "@/lib/favorites-store";

export function FavoritesBadge() {
  const count = useSyncExternalStore(
    subscribeFavorites,
    () => getFavoritesSnapshot().items.length,
    () => 0,
  );

  return (
    <span className="border-ec-line text-ec-ink hover:border-ec-blue/40 hover:text-ec-blue relative inline-grid size-10 place-items-center rounded-full border bg-white transition">
      <Heart className="size-5" />
      {count > 0 ? (
        <span className="bg-ec-blue absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full px-1 text-[11px] font-bold text-white">
          {count}
        </span>
      ) : null}
    </span>
  );
}
