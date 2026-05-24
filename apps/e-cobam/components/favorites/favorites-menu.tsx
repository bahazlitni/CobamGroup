"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Heart } from "lucide-react";
import { FavoritesBadge } from "@/components/favorites/favorites-badge";
import {
  EMPTY_FAVORITE_ITEMS,
  getFavoritesSnapshot,
  subscribeFavorites,
  type FavoriteItemSnapshot,
} from "@/lib/favorites-store";
import { formatPriceTnd } from "@/lib/format";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function isTodayFavorite(item: FavoriteItemSnapshot) {
  if (!item.addedAt) {
    return false;
  }

  const date = new Date(item.addedAt);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.toDateString() === new Date().toDateString();
}

function FavoritePreview({ item, onNavigate }: { item: FavoriteItemSnapshot; onNavigate: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className="grid grid-cols-[3.5rem_1fr] gap-3 rounded-2xl p-2 transition hover:bg-ec-paper"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-white ring-1 ring-ec-line">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="56px"
            unoptimized
            className="object-contain"
          />
        ) : (
          <span className="grid h-full place-items-center text-ec-muted/40">
            <Heart className="size-5" />
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-[10px] font-black tracking-[0.16em] text-ec-blue uppercase">
          {item.brandName ?? item.categoryName ?? "COBAM"}
        </p>
        <p className="mt-1 line-clamp-2 text-sm font-black text-ec-ink">{item.name}</p>
        <p className="mt-1 text-xs font-bold text-ec-muted">
          {formatPriceTnd(item.price) ?? "Prix sur demande"}
        </p>
      </div>
    </Link>
  );
}

export function FavoritesMenu({
  active = false,
  open,
  onOpenChange,
}: {
  active?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const isOpen = open ?? uncontrolledOpen;
  const items = useSyncExternalStore(
    subscribeFavorites,
    () => getFavoritesSnapshot().items,
    () => EMPTY_FAVORITE_ITEMS,
  );
  const todayItems = useMemo(
    () => items.filter(isTodayFavorite).slice(0, 4),
    [items],
  );

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    if (open === undefined) {
      setUncontrolledOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  }, [onOpenChange, open]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function isInsideFavoritesMenu(target: EventTarget | null) {
      return (
        target instanceof Element &&
        (menuRef.current?.contains(target) || target.closest("[data-slot='popover-content']"))
      );
    }

    function closeIfOutside(event: PointerEvent | FocusEvent) {
      if (isInsideFavoritesMenu(event.target)) {
        return;
      }

      handleOpenChange(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleOpenChange(false);
      }
    }

    document.addEventListener("pointerdown", closeIfOutside, true);
    document.addEventListener("focusin", closeIfOutside, true);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", closeIfOutside, true);
      document.removeEventListener("focusin", closeIfOutside, true);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [handleOpenChange, isOpen]);

  function isEventInsideFavoritesMenu(event: Event) {
    const originalEvent = (event as CustomEvent<{ originalEvent?: Event }>).detail?.originalEvent;
    const target = originalEvent?.target ?? event.target;

    return (
      target instanceof Element &&
      (menuRef.current?.contains(target) || target.closest("[data-slot='popover-content']"))
    );
  }

  function handlePopoverOutside(event: Event) {
    if (isEventInsideFavoritesMenu(event)) {
      event.preventDefault();
      return;
    }

    handleOpenChange(false);
  }

  return (
    <div ref={menuRef}>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button type="button" aria-label="Ouvrir les favoris">
            <FavoritesBadge active={active || isOpen} />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="ecom-popover-content p-3"
          onEscapeKeyDown={() => handleOpenChange(false)}
          onFocusOutside={handlePopoverOutside}
          onInteractOutside={handlePopoverOutside}
          onPointerDownOutside={handlePopoverOutside}
        >
        <div className="flex items-center justify-between gap-3 px-2 py-2">
          <p className="text-sm font-black text-ec-ink">Favoris du jour</p>
          <Link
              href="/favoris"
              onClick={() => handleOpenChange(false)}
              className="inline-flex w-fit h-8 items-center justify-center rounded-full bg-ec-ink px-4 text-xs font-black text-white transition hover:bg-ec-blue"
            >
              Voir mes favoris
            </Link>
        </div>

        <div className="mt-2 max-h-[19rem] overflow-y-auto pr-1">
          {todayItems.length > 0 ? (
            todayItems.map((item) => (
              <FavoritePreview
                key={`${item.entityType}-${item.id}`}
                item={item}
                onNavigate={() => handleOpenChange(false)}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-ec-line bg-ec-paper/70 px-4 py-8 text-center">
              <Heart className="mx-auto size-8 text-ec-blue" />
              <p className="mt-3 text-sm font-semibold text-ec-muted">
                Aucun favori ajout&eacute; aujourd&apos;hui.
              </p>
            </div>
          )}
        </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
