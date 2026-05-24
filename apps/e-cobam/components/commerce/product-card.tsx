"use client";

import Image from "next/image";
import Link from "next/link";
import { PackageCheck, PackageX, ShoppingBag, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { FavoriteToggleButton } from "@/components/favorites/favorite-toggle-button";
import type { ProductActionSize } from "@/components/commerce/product-action-buttons";
import { cn } from "@/lib/cn";
import type { CartItemSnapshot } from "@/lib/cart-store";
import type { FavoriteItemSnapshot } from "@/lib/favorites-store";
import { formatPriceTnd } from "@/lib/format";

type ProductCardStockTone = "available" | "warning" | "unavailable";

type ProductCardImage = {
  url: string;
  thumbnailUrl?: string | null;
  altText?: string | null;
};

type ProductCardNamedRef = {
  name: string | null;
};

type ProductCardStock = {
  label: string;
  tone: ProductCardStockTone;
  available?: string | null;
  unit?: string | null;
};

export type ProductCardSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "auto";
type ResolvedProductCardSize = Exclude<ProductCardSize, "auto">;

export type ProductCardProduct = {
  id: number;
  entityType?: "PRODUCT" | "FAMILY";
  sku?: string | null;
  slug?: string | null;
  href?: string | null;
  name: string;
  displayName?: string | null;
  subtitle?: string | null;
  summary?: string | null;
  brand?: ProductCardNamedRef | null;
  brandName?: string | null;
  category?: ProductCardNamedRef | null;
  categoryName?: string | null;
  subcategory?: ProductCardNamedRef | null;
  subcategoryName?: string | null;
  image?: ProductCardImage | null;
  price: string | null;
  stock: ProductCardStock;
  badges?: string[];
  addToCart?: CartItemSnapshot | null;
  favoriteItem?: FavoriteItemSnapshot | null;
};

type ProductCardProps = {
  product: ProductCardProduct;
  priority?: boolean;
  className?: string;
  size?: ProductCardSize;
  selected?: boolean;
  onSelect?: () => void;
  flat?: boolean;
  showSelectedMarker?: boolean;
};

const WIDTH_SIZE_STEPS: Array<[number, ResolvedProductCardSize]> = [
  [180, "xs"],
  [230, "sm"],
  [290, "md"],
  [360, "lg"],
  [460, "xl"],
];

const IMAGE_SIZES: Record<ResolvedProductCardSize, string> = {
  xs: "170px",
  sm: "220px",
  md: "280px",
  lg: "340px",
  xl: "420px",
  "2xl": "520px",
};

const CARD_PADDING: Record<ResolvedProductCardSize, string> = {
  xs: "p-2",
  sm: "p-3",
  md: "p-4",
  lg: "p-4",
  xl: "p-5",
  "2xl": "p-5",
};

const TITLE_SIZE: Record<ResolvedProductCardSize, string> = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
  "2xl": "text-lg",
};

const PRICE_SIZE: Record<ResolvedProductCardSize, string> = {
  xs: "text-base",
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-2xl",
  "2xl": "text-3xl",
};

const FAVORITE_ACTION_SIZE: Record<ResolvedProductCardSize, ProductActionSize> = {
  xs: "xs",
  sm: "sm",
  md: "md",
  lg: "md",
  xl: "lg",
  "2xl": "lg",
};

const CART_ACTION_SIZE: Record<ResolvedProductCardSize, ProductActionSize> = {
  xs: "xs",
  sm: "sm",
  md: "sm",
  lg: "md",
  xl: "md",
  "2xl": "lg",
};

function resolveCardSize(width: number): ResolvedProductCardSize {
  for (const [maxWidth, size] of WIDTH_SIZE_STEPS) {
    if (width < maxWidth) return size;
  }
  return "2xl";
}

function getStaticSize(size: ProductCardSize): ResolvedProductCardSize {
  return size === "auto" ? "md" : size;
}

function StockBadge({ stock, compact = false }: { stock: ProductCardStock; compact?: boolean }) {
  const Icon =
    stock.tone === "unavailable"
      ? PackageX
      : stock.tone === "warning"
        ? TriangleAlert
        : PackageCheck;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full font-bold",
        compact ? "px-2 py-1 text-[0.64rem]" : "px-2.5 py-1 text-xs",
        stock.tone === "available" && "bg-emerald-50 text-emerald-700",
        stock.tone === "warning" && "bg-amber-50 text-amber-700",
        stock.tone === "unavailable" && "bg-rose-50 text-rose-700",
      )}
    >
      <Icon className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden="true" />
      {stock.label}
    </span>
  );
}

function CardMediaAction({
  href,
  onSelect,
  children,
  className,
  label,
}: {
  href: string;
  onSelect?: () => void;
  children: ReactNode;
  className?: string;
  label: string;
}) {
  if (onSelect) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={cn("block w-full text-left", className)}
        aria-label={label}
      >
        {children}
      </button>
    );
  }

  return (
    <Link href={href} className={cn("block w-full", className)} aria-label={label}>
      {children}
    </Link>
  );
}

export function ProductCard({
  product,
  priority = false,
  className,
  size = "auto",
  selected = false,
  onSelect,
  flat = false,
  showSelectedMarker = true,
}: ProductCardProps) {
  const cardRef = useRef<HTMLElement | null>(null);
  const [autoSize, setAutoSize] = useState<ResolvedProductCardSize>(() => getStaticSize(size));

  useEffect(() => {
    if (size !== "auto") {
      return undefined;
    }

    const element = cardRef.current;
    if (!element || typeof ResizeObserver === "undefined") return undefined;

    const updateSize = () => {
      setAutoSize(resolveCardSize(element.getBoundingClientRect().width));
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, [size]);

  const resolvedSize = size === "auto" ? autoSize : size;
  const displayName = product.displayName || product.name;
  const href = product.href || (product.slug ? `/produits/${product.slug}` : "#");
  const imageUrl = product.image?.thumbnailUrl || product.image?.url || null;
  const imageAlt = product.image?.altText || displayName;
  const brandLabel = product.brandName || product.brand?.name || null;
  const categoryLabel =
    product.categoryName || product.category?.name || product.subcategoryName || product.subcategory?.name || null;
  const isTiny = resolvedSize === "xs";
  const isSmall = resolvedSize === "xs" || resolvedSize === "sm";
  const showSku = !isTiny && Boolean(product.sku);
  const showBrand = !isTiny && Boolean(brandLabel);
  const showStock = !isTiny;
  const showActions = !isSmall;
  const showFavorite = !isTiny;

  const fallbackAddToCart = useMemo<CartItemSnapshot | null>(() => {
    if (product.addToCart) return product.addToCart;
    if (product.entityType === "FAMILY") return null;
    return {
      id: product.id,
      sku: product.sku || "",
      name: displayName,
      price: product.price,
      imageUrl,
    };
  }, [displayName, imageUrl, product.addToCart, product.entityType, product.id, product.price, product.sku]);

  const favoriteItem = useMemo<FavoriteItemSnapshot>(
    () =>
      product.favoriteItem || {
        id: product.id,
        entityType: product.entityType || "PRODUCT",
        sku: product.sku || null,
        name: displayName,
        href,
        price: product.price,
        imageUrl,
        brandName: brandLabel,
        categoryName: categoryLabel,
      },
    [brandLabel, categoryLabel, displayName, href, imageUrl, product],
  );

  return (
    <article
      ref={cardRef}
      className={cn(
        "group relative flex min-w-0 flex-col overflow-hidden rounded-[1.45rem] border bg-white text-cobam-900 transition duration-300",
        flat
          ? selected
            ? "border-cobam-500 outline outline-2 outline-cobam-200"
            : "border-slate-200 hover:border-cobam-200"
          : selected
            ? "border-cobam-500 shadow-[0_18px_48px_rgba(0,149,213,0.16)] ring-2 ring-cobam-200"
            : "border-slate-200 shadow-[0_14px_38px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 hover:border-cobam-200 hover:shadow-[0_20px_52px_rgba(15,23,42,0.11)]",
        className,
      )}
      data-product-card-size={resolvedSize}
      aria-current={selected ? "true" : undefined}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-white">
        <CardMediaAction href={href} onSelect={onSelect} label={`Voir ${displayName}`} className="h-full">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              priority={priority}
              sizes={IMAGE_SIZES[resolvedSize]}
              unoptimized
              className="object-contain transition duration-500 group-hover:scale-[1.025]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-white text-cobam-200">
              <ShoppingBag className={cn("h-12 w-12", !isSmall && "h-16 w-16")} strokeWidth={1.4} aria-hidden="true" />
            </div>
          )}
        </CardMediaAction>

        {showBrand && (
          <span
            className={cn(
              "absolute left-3 top-3 max-w-[calc(100%-4.5rem)] truncate rounded-full bg-white/92 px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.16em] text-cobam-600 ring-1 ring-slate-200 backdrop-blur",
              !flat && "shadow-sm",
            )}
          >
            {brandLabel}
          </span>
        )}

        {showFavorite && (
          <div className="absolute right-3 top-3">
            <FavoriteToggleButton
              item={favoriteItem}
              size={FAVORITE_ACTION_SIZE[resolvedSize]}
              iconOnly
              buttonClassName={cn(
                "border-slate-200 bg-white/94 text-cobam-900 backdrop-blur hover:border-cobam-200 hover:text-cobam-500",
                !flat && "shadow-sm",
                flat && "shadow-none",
                selected && "border-cobam-200 text-cobam-500",
              )}
            />
          </div>
        )}

        {selected && showSelectedMarker && (
          <span className="absolute bottom-3 right-3 inline-flex h-3 w-3 rounded-full bg-cobam-500 shadow-[0_0_0_4px_rgba(0,149,213,0.14)]" />
        )}
      </div>

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col border-t border-slate-100",
          CARD_PADDING[resolvedSize],
        )}
      >
        <div className="min-w-0 flex-1">
          {showSku && (
            <p className="mb-2 truncate font-mono text-[0.68rem] font-black uppercase tracking-[0.22em] text-slate-500">
              {product.sku}
            </p>
          )}

          <CardMediaAction href={href} onSelect={onSelect} label={`Voir ${displayName}`}>
            <h3
              className={cn(
                "line-clamp-2 font-black leading-snug text-cobam-900 transition group-hover:text-cobam-700",
                TITLE_SIZE[resolvedSize],
              )}
            >
              {displayName}
            </h3>
          </CardMediaAction>

          {!isSmall && product.subtitle ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{product.subtitle}</p>
          ) : null}
        </div>

        <div className={cn("mt-4 flex items-end justify-between gap-3", isTiny && "mt-3")}>
          <div className="min-w-0">
            <p className={cn("font-black leading-none text-cobam-900", PRICE_SIZE[resolvedSize])}>
              {formatPriceTnd(product.price) ?? "Prix sur demande"}
            </p>
          </div>
          {showStock && <StockBadge stock={product.stock} compact={resolvedSize === "sm"} />}
        </div>

        {showActions && fallbackAddToCart ? (
          <div className="mt-4">
            <AddToCartButton
              item={fallbackAddToCart}
              quantity={1}
              size={CART_ACTION_SIZE[resolvedSize]}
              className="w-full"
              buttonClassName="w-full justify-center shadow-none sm:w-full"
            />
          </div>
        ) : null}

        {isTiny && (
          <div className="mt-3 flex items-center justify-between gap-2">
            <StockBadge stock={product.stock} compact />
            <FavoriteToggleButton
              item={favoriteItem}
              size="xs"
              iconOnly
              buttonClassName="border-slate-200 text-slate-500 shadow-none hover:border-cobam-200 hover:text-cobam-500"
            />
          </div>
        )}
      </div>
    </article>
  );
}

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <article
      className={cn(
        "animate-pulse overflow-hidden rounded-[1.45rem] border border-slate-200 bg-white shadow-[0_14px_38px_rgba(15,23,42,0.06)]",
        className,
      )}
    >
      <div className="aspect-square bg-white" />
      <div className="space-y-3 border-t border-slate-100 p-4">
        <div className="h-3 w-20 rounded-full bg-slate-100" />
        <div className="h-5 w-4/5 rounded-full bg-slate-100" />
        <div className="h-7 w-28 rounded-full bg-slate-100" />
        <div className="h-10 rounded-2xl bg-slate-100" />
      </div>
    </article>
  );
}
