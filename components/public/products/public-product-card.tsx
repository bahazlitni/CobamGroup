"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PublicProductSummary } from "@/features/products/public";
import { normalizeThemeColor, withThemeAlpha } from "@/lib/theme-color";
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
  const resolvedThemeColor = normalizeThemeColor(themeColor)  || "#14202E";

  return (
    <Link
      href={href}
      className={cn("group block h-full", className)}
      aria-label={`Voir le produit ${product.name}`}
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
          <div className="flex items-center gap-2">
             {product.subtitle && (
                <h5 className="text-[9px] font-bold uppercase tracking-[0.3em] text-cobam-carbon-grey truncate">
                  {product.subtitle}
                </h5>
             )}
          </div>

          {/* Title */}
          <h4 
            className={`text-xl md:text-2xl font-normal text-cobam-dark-blue leading-tight group-hover:text-[${resolvedThemeColor}] transition-colors duration-300`}
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {product.name}
          </h4>

          {/* Bottom Row - Price & Link highlight */}
          <div className="mt-2 flex items-center justify-between">
             <div className="flex items-baseline gap-1">
                <span className="text-lg font-medium text-cobam-dark-blue">
                   {product.price ? product.price : "Sur demande"}
                </span>
                {product.price && <span className="text-[10px] font-bold uppercase tracking-widest text-cobam-carbon-grey">TND</span>}
             </div>
             
             {/* The refined theme-colored accent */}
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
