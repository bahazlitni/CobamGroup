"use client";

import Image from "next/image";
import Link from "next/link";
import type { PublicProductSummary } from "@/features/products/public";
import { normalizeThemeColor } from "@/lib/theme-color";
import { cn } from "@/lib/utils";

type PublicProductCardProps = {
  product: PublicProductSummary;
  href?: string;
  themeColor?: string | null;
  className?: string;
};

export default function ProductCard({
  product,
  href = `/produits/${product.slug}`,
  themeColor,
  className,
}: PublicProductCardProps) {
  const imageSrc = product.imageThumbnailUrl || product.imageUrl || null;
  const resolvedThemeColor = normalizeThemeColor(themeColor) || "#14202E";

  return (
    <Link
      href={href}
      className={cn("group block h-full", className)}
      aria-label={`Voir le produit ${product.name}`}
      draggable={false}
      onDragStart={(event) => event.preventDefault()}
    >
      <article className="flex flex-col h-full gap-5">
        {/* Image Container - Clean, softly rounded */}
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-[#F0F0F0]">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.imageAlt || product.name}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              draggable={false}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] font-bold uppercase tracking-widest text-cobam-quill-grey">
              Image à venir
            </div>
          )}

          {/* Floating Brand - Minimalist */}
          {product.brandName && (
            <div className="absolute top-4 left-4 z-10 transition-opacity duration-300">
              <span className="inline-flex px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-black/[0.03] text-[9px] font-bold uppercase tracking-[0.15em] text-cobam-dark-blue shadow-sm">
                {product.brandName}
              </span>
            </div>
          )}

        </div>

        {/* Content Area - Simple & Typography focused */}
        <div className="flex flex-col gap-2 px-1">
          {/* Title */}
          <h4
            className={`text-xl md:text-xl font-normal text-cobam-dark-blue leading-tight group-hover:text-[${resolvedThemeColor}] transition-colors duration-300`}
          >
            {product.name}
          </h4>

          <div className="mt-2 flex justify-end">
            <div
              className="h-[2px] w-0 group-hover:w-8 transition-all duration-300 origin-right"
              style={{ backgroundColor: resolvedThemeColor }}
            />
          </div>
        </div>
      </article>
    </Link>
  );
}
