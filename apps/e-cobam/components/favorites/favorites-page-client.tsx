"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { ProductCard, type ProductCardProduct } from "@/components/commerce/product-card";
import {
  EMPTY_FAVORITE_ITEMS,
  getFavoritesSnapshot,
  subscribeFavorites,
  type FavoriteItemSnapshot,
} from "@/lib/favorites-store";

type FavoriteGroup = {
  key: string;
  label: string;
  items: FavoriteItemSnapshot[];
};

function favoriteDateKey(item: FavoriteItemSnapshot) {
  if (!item.addedAt) {
    return "legacy";
  }

  const date = new Date(item.addedAt);
  if (Number.isNaN(date.getTime())) {
    return "legacy";
  }

  return date.toISOString().slice(0, 10);
}

function favoriteDateLabel(key: string) {
  if (key === "legacy") {
    return "Anciens favoris";
  }

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const todayKey = today.toISOString().slice(0, 10);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  if (key === todayKey) {
    return "Aujourd'hui";
  }

  if (key === yesterdayKey) {
    return "Hier";
  }

  return new Intl.DateTimeFormat("fr-TN", {
    dateStyle: "long",
  }).format(new Date(`${key}T12:00:00`));
}

function favoriteToProductCard(item: FavoriteItemSnapshot): ProductCardProduct {
  return {
    id: item.id,
    entityType: item.entityType,
    sku: item.sku,
    href: item.href,
    name: item.name,
    displayName: item.name,
    brandName: item.brandName,
    categoryName: item.categoryName,
    image: item.imageUrl ? { url: item.imageUrl, thumbnailUrl: item.imageUrl, altText: item.name } : null,
    price: item.price,
    stock: {
      label: "A verifier",
      tone: "warning",
    },
    addToCart:
      item.entityType === "PRODUCT" && item.sku
        ? {
            id: item.id,
            sku: item.sku,
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl,
          }
        : null,
    favoriteItem: item,
  };
}

function groupFavorites(items: FavoriteItemSnapshot[]): FavoriteGroup[] {
  const groups = new Map<string, FavoriteItemSnapshot[]>();

  for (const item of items) {
    const key = favoriteDateKey(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => {
      if (a === "legacy") return 1;
      if (b === "legacy") return -1;
      return b.localeCompare(a);
    })
    .map(([key, groupItems]) => ({
      key,
      label: favoriteDateLabel(key),
      items: groupItems,
    }));
}

export function FavoritesPageClient() {
  const items = useSyncExternalStore(
    subscribeFavorites,
    () => getFavoritesSnapshot().items,
    () => EMPTY_FAVORITE_ITEMS,
  );

  const groups = useMemo(() => groupFavorites(items), [items]);
  return (
    <main className="bg-ec-paper min-h-[70vh]">
      <section className="commerce-container py-12 sm:py-16">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-ec-blue text-xs font-black tracking-[0.2em] uppercase">
              Mes favoris
            </p>
            <h1 className="text-ec-ink mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Vos produits mis de côté.
            </h1>
          </div>
        </div>

        {groups.length > 0 ? (
          <div className="mt-10 space-y-12">
            {groups.map((group) => (
              <section key={group.key} aria-labelledby={`favorites-${group.key}`}>
                <div className="mb-5 flex items-end justify-between gap-4">
                  <h2
                    id={`favorites-${group.key}`}
                    className="text-ec-ink text-2xl font-black tracking-tight"
                  >
                    {group.label}
                  </h2>
                  <p className="text-ec-muted text-sm font-bold">
                    {group.items.length} reference{group.items.length > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {group.items.map((item) => (
                    <ProductCard
                      key={`${item.entityType}-${item.id}`}
                      product={favoriteToProductCard(item)}
                      size="auto"
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="border-ec-line mt-10 rounded-3xl border bg-white px-6 py-14 text-center shadow-sm">
            <Heart className="text-ec-blue mx-auto size-10" />
            <h2 className="text-ec-ink mt-5 text-2xl font-black">Aucun favori pour le moment.</h2>
            <Link
              href="/catalogue"
              className="bg-ec-ink hover:bg-ec-blue mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-black text-white transition"
            >
              <ShoppingBag className="size-4" />
              Explorer les produits
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
