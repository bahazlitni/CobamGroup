import Image from "next/image";
import Link from "next/link";
import { ArrowRight, PackageCheck } from "lucide-react";
import type { LandingProduct } from "@/lib/home-data";
import { cn } from "@/lib/cn";
import { formatPriceTnd } from "@/lib/format";

function StockBadge({ stock }: { stock: LandingProduct["stock"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        stock.tone === "available" && "bg-emerald-50 text-emerald-700",
        stock.tone === "warning" && "bg-amber-50 text-amber-700",
        stock.tone === "unavailable" && "bg-rose-50 text-rose-700",
      )}
    >
      <PackageCheck className="size-3.5" />
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
  const kicker = product.brandName ?? product.subcategoryName ?? product.categoryName ?? "COBAM";

  return (
    <Link
      href={product.href}
      className="group flex h-full flex-col overflow-hidden rounded-[1.4rem] border border-ec-line bg-white shadow-[0_14px_42px_rgba(16,32,47,0.05)] transition duration-300 hover:-translate-y-1 hover:border-ec-blue/30 hover:shadow-[0_24px_64px_rgba(16,32,47,0.12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ec-blue"
    >
      <div className="relative aspect-[4/3.35] overflow-hidden bg-[#f3f0ea]">
        {product.image?.thumbnailUrl || product.image?.url ? (
          <Image
            src={product.image.thumbnailUrl ?? product.image.url}
            alt={product.image.altText}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 92vw"
            priority={priority}
            className="object-contain p-5 transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-8 text-center text-sm font-semibold uppercase tracking-[0.22em] text-ec-muted/45">
            COBAM
          </div>
        )}

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {product.badges.slice(0, 2).map((badge) => (
            <span
              key={badge}
              className="rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-ec-ink shadow-sm backdrop-blur"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ec-blue">
              {kicker}
            </p>
            <h3 className="mt-2 line-clamp-2 text-lg font-semibold leading-snug text-ec-ink">
              {product.name}
            </h3>
          </div>
          <ArrowRight className="mt-1 size-5 shrink-0 text-ec-muted transition group-hover:translate-x-1 group-hover:text-ec-blue" />
        </div>

        {product.summary ? (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-ec-muted">{product.summary}</p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-4 pt-5">
          <div>
            <p className="text-xs text-ec-muted">Prix TTC</p>
            <p className="mt-1 text-lg font-semibold text-ec-ink">{price ?? "Prix sur demande"}</p>
          </div>
          <StockBadge stock={product.stock} />
        </div>
      </div>
    </Link>
  );
}
