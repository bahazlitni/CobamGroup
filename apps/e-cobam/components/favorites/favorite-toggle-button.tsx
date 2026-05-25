"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  AddToFavoritesButton,
  emitFavoritesActionAnimation,
  type ProductActionSize,
} from "@/components/commerce/product-action-buttons";
import {
  addFavorite,
  favoriteKey,
  EMPTY_FAVORITE_ITEMS,
  getFavoritesSnapshot,
  removeFavorite,
  subscribeFavorites,
  type FavoriteItemSnapshot,
} from "@/lib/favorites-store";
import { cn } from "@/lib/cn";
import { pushUndoToast } from "@/lib/undo-actions";

export function FavoriteToggleButton({
  item,
  showLabel = false,
  size = "md",
  iconOnly,
  disabled = false,
  className,
  buttonClassName,
  onAddedToFavoritesAnimation,
  onRemovedFromFavoritesAnimation,
}: {
  item: FavoriteItemSnapshot;
  label?: string;
  showLabel?: boolean;
  size?: ProductActionSize;
  iconOnly?: boolean;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  onAddedToFavoritesAnimation?: () => void;
  onRemovedFromFavoritesAnimation?: () => void;
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
    if (active) {
      removeFavorite(item);
      pushUndoToast({
        title: "Retiré des favoris",
        description: item.name,
        onUndo: () => {
          addFavorite(item);
        },
      });
      return;
    }

    addFavorite(item);
    pushUndoToast({
      title: "Ajouté aux favoris",
      description: item.name,
      onUndo: () => {
        removeFavorite(item);
      },
    });
  }

  return (
    <AddToFavoritesButton
      isFavorite={active}
      onToggle={handleToggle}
      size={size}
      iconOnly={iconOnly ?? !showLabel}
      disabled={disabled}
      className={cn(buttonClassName, className)}
      onAddedToFavoritesAnimation={() => {
        emitFavoritesActionAnimation("added");
        onAddedToFavoritesAnimation?.();
      }}
      onRemovedFromFavoritesAnimation={() => {
        emitFavoritesActionAnimation("removed");
        onRemovedFromFavoritesAnimation?.();
      }}
    />
  );
}
