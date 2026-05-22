import Image from "next/image";
import Link from "next/link";
import { PackageCheck } from "lucide-react";
import { FavoriteToggleButton } from "@/components/favorites/favorite-toggle-button";
import type { LandingProduct } from "@/lib/home-data";
import { cn } from "@/lib/cn";
import { formatPriceTnd } from "@/lib/format";

function StockBadge({ stock }: { stock: LandingProduct["stock"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold",
        stock.tone === "available" && "bg-emerald-50 text-emerald-700",
        stock.tone === "warning" && "bg-amber-50 text-amber-700",
        stock.tone === "unavailable" && "bg-rose-50 text-rose-700",
      )}
    >
      <PackageCheck className="size-3" />
      {stock.label}
    </span>
  );
}

export function LandingProductCard({
  product,
  priority = false,
}: {
  product: LandingProduct;
  priority?: boolean;
}) {
  const price = formatPriceTnd(product.price);
  const favoriteItem = {
    id: product.id,
    entityType: "PRODUCT",
    sku: product.sku,
    name: product.name,
    href: product.href,
    price: product.price,
    imageUrl: product.image?.thumbnailUrl ?? product.image?.url ?? null,
    brandName: product.brandName,
    categoryName: product.categoryName ?? product.subcategoryName,
  } as const;

  return (
    <article className="group border-ec-line hover:border-ec-blue/30 relative flex h-full flex-col overflow-hidden rounded-[1.15rem] border bg-white shadow-[0_10px_30px_rgba(16,32,47,0.045)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_46px_rgba(16,32,47,0.1)]">
      <Link
        href={product.href}
        className="focus-visible:outline-ec-blue relative block aspect-square w-full overflow-hidden bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {product.image?.thumbnailUrl || product.image?.url ? (
          <Image
            src={product.image.thumbnailUrl ?? product.image.url}
            alt={product.image.altText}
            fill
            sizes="(min-width: 1280px) 18vw, (min-width: 768px) 30vw, 92vw"
            priority={priority}
            className="object-contain p-4 transition duration-500 group-hover:scale-[1.035]"
          />
        ) : (
          <div className="text-ec-muted/45 flex h-full items-center justify-center px-6 text-center text-xs font-semibold tracking-[0.2em] uppercase">
            COBAM
          </div>
        )}
      </Link>
      <FavoriteToggleButton item={favoriteItem} className="absolute top-3 right-3 z-10" />

      <div className="flex flex-1 flex-col p-3.5">
        <Link
          href={product.href}
          className="text-ec-ink hover:text-ec-blue line-clamp-2 min-h-10 text-sm leading-snug font-black transition"
        >
          {product.name}
        </Link>

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <p className="text-ec-ink text-base font-black">{price ?? "Sur devis"}</p>
          <StockBadge stock={product.stock} />
        </div>
      </div>
    </article>
  );
}
