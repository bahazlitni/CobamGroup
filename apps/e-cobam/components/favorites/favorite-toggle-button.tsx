"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Heart } from "lucide-react";
import {
  favoriteKey,
  EMPTY_FAVORITE_ITEMS,
  getFavoritesSnapshot,
  subscribeFavorites,
  toggleFavorite,
  type FavoriteItemSnapshot,
} from "@/lib/favorites-store";
import { cn } from "@/lib/cn";

export function FavoriteToggleButton({
  item,
  label = "Favori",
  showLabel = false,
  className,
}: {
  item: FavoriteItemSnapshot;
  label?: string;
  showLabel?: boolean;
  className?: string;
}) {
  const favorites = useSyncExternalStore(
    subscribeFavorites,
    () => getFavoritesSnapshot().items,
    () => EMPTY_FAVORITE_ITEMS,
  );
  const active = useMemo(() => {
    const key = favoriteKey(item);
    return favorites.some((favorite) => favoriteKey(favorite) === key);
  }, [favorites, item]);

  function handleToggle() {
    toggleFavorite(item);
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={active}
      aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}
      className={cn(
        "border-ec-line text-ec-muted hover:border-ec-blue/40 hover:text-ec-blue focus-visible:outline-ec-blue inline-flex h-10 items-center justify-center gap-2 rounded-full border bg-white px-3 text-sm font-black shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        active && "border-ec-blue/45 bg-ec-blue/10 text-ec-blue",
        !showLabel && "w-10 px-0",
        className,
      )}
    >
      <Heart className={cn("size-4", active && "fill-current")} aria-hidden="true" />
      {showLabel ? <span>{active ? "Dans mes favoris" : label}</span> : null}
    </button>
  );
}
