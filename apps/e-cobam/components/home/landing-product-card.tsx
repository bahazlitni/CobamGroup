import Image from "next/image";
import Link from "next/link";
import { PackageCheck } from "lucide-react";
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

  return (
    <Link
      href={product.href}
      className="group flex h-full flex-col overflow-hidden rounded-[1.15rem] border border-ec-line bg-white shadow-[0_10px_30px_rgba(16,32,47,0.045)] transition duration-300 hover:-translate-y-0.5 hover:border-ec-blue/30 hover:shadow-[0_18px_46px_rgba(16,32,47,0.1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ec-blue"
    >
      <div className="relative aspect-[4/3.15] overflow-hidden bg-ec-stone">
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
          <div className="flex h-full items-center justify-center px-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-ec-muted/45">
            COBAM
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="line-clamp-2 min-h-10 text-sm font-black leading-snug text-ec-ink">
          {product.name}
        </h3>

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <p className="text-base font-black text-ec-ink">{price ?? "Sur devis"}</p>
          <StockBadge stock={product.stock} />
        </div>
      </div>
    </Link>
  );
}
