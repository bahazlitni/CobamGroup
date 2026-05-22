"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import {
  clearFavorites,
  EMPTY_FAVORITE_ITEMS,
  getFavoritesSnapshot,
  removeFavorite,
  subscribeFavorites,
  type FavoriteItemSnapshot,
} from "@/lib/favorites-store";
import { formatPriceTnd } from "@/lib/format";

function FavoriteCard({ item }: { item: FavoriteItemSnapshot }) {
  const price = formatPriceTnd(item.price) ?? "Prix sur demande";

  return (
    <article className="border-ec-line flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-[0_12px_34px_rgba(20,32,46,0.055)]">
      <Link href={item.href} className="bg-ec-stone relative block aspect-[4/3] overflow-hidden">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(min-width: 1024px) 24vw, (min-width: 640px) 42vw, 92vw"
            className="object-contain p-6"
          />
        ) : (
          <span className="text-ec-muted/45 grid h-full place-items-center text-xs font-black tracking-[0.2em] uppercase">
            COBAM
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-ec-blue line-clamp-1 text-[11px] font-black tracking-[0.18em] uppercase">
          {item.brandName ?? item.categoryName ?? "COBAM"}
        </p>
        <Link
          href={item.href}
          className="text-ec-ink hover:text-ec-blue mt-2 line-clamp-2 text-sm font-black"
        >
          {item.name}
        </Link>
        <p className="text-ec-ink mt-5 text-lg font-black">{price}</p>

        <div className="mt-auto grid gap-3 pt-5">
          {item.entityType === "PRODUCT" && item.sku ? (
            <AddToCartButton
              item={{
                id: item.id,
                sku: item.sku,
                name: item.name,
                price: item.price,
                imageUrl: item.imageUrl,
              }}
              quantity={1}
              size="sm"
              className="sm:w-full"
            />
          ) : (
            <Link
              href={item.href}
              className="bg-ec-ink hover:bg-ec-blue inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-black text-white transition"
            >
              Voir la gamme
            </Link>
          )}

          <button
            type="button"
            onClick={() => removeFavorite(item)}
            className="border-ec-line text-ec-muted inline-flex h-10 items-center justify-center gap-2 rounded-full border bg-white px-4 text-sm font-black transition hover:border-rose-200 hover:text-rose-600"
          >
            <Trash2 className="size-4" />
            Retirer
          </button>
        </div>
      </div>
    </article>
  );
}

export function FavoritesPageClient() {
  const items = useSyncExternalStore(
    subscribeFavorites,
    () => getFavoritesSnapshot().items,
    () => EMPTY_FAVORITE_ITEMS,
  );

  const productCount = useMemo(
    () => items.filter((item) => item.entityType === "PRODUCT").length,
    [items],
  );

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
            <p className="text-ec-muted mt-3 max-w-2xl text-sm leading-6 font-semibold">
              Retrouvez vos références préférées, ouvrez leurs fiches ou ajoutez-les au panier.
            </p>
          </div>
          {items.length > 0 ? (
            <button
              type="button"
              onClick={clearFavorites}
              className="border-ec-line text-ec-ink inline-flex h-11 items-center justify-center gap-2 rounded-full border bg-white px-5 text-sm font-black transition hover:border-rose-200 hover:text-rose-600"
            >
              <Trash2 className="size-4" />
              Vider la liste
            </button>
          ) : null}
        </div>

        {items.length > 0 ? (
          <>
            <div className="border-ec-line mt-8 grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-3">
              <div>
                <p className="text-ec-muted text-xs font-black tracking-[0.18em] uppercase">
                  Total
                </p>
                <p className="text-ec-ink mt-1 text-2xl font-black">{items.length}</p>
              </div>
              <div>
                <p className="text-ec-muted text-xs font-black tracking-[0.18em] uppercase">
                  Produits
                </p>
                <p className="text-ec-ink mt-1 text-2xl font-black">{productCount}</p>
              </div>
              <div>
                <p className="text-ec-muted text-xs font-black tracking-[0.18em] uppercase">
                  Gammes
                </p>
                <p className="text-ec-ink mt-1 text-2xl font-black">
                  {items.length - productCount}
                </p>
              </div>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((item) => (
                <FavoriteCard key={`${item.entityType}-${item.id}`} item={item} />
              ))}
            </div>
          </>
        ) : (
          <div className="border-ec-line mt-10 rounded-3xl border bg-white px-6 py-14 text-center shadow-sm">
            <Heart className="text-ec-blue mx-auto size-10" />
            <h2 className="text-ec-ink mt-5 text-2xl font-black">Aucun favori pour le moment.</h2>
            <p className="text-ec-muted mx-auto mt-3 max-w-xl text-sm leading-6 font-semibold">
              Touchez le cœur sur une fiche produit pour la retrouver ici plus tard.
            </p>
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
