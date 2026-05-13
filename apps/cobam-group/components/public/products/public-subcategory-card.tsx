"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PublicProductSubcategoryCardData } from "@/features/product-categories/public-types";
import { normalizeThemeColor, withThemeAlpha } from "@/lib/theme-color";

type PublicSubcategoryCardProps = {
  subcategory: PublicProductSubcategoryCardData;
  themeColor?: string | null;
};

export default function PublicSubcategoryCard({
  subcategory,
  themeColor,
}: PublicSubcategoryCardProps) {
  const resolvedThemeColor = normalizeThemeColor(themeColor);

  return (
    <Link
      href={subcategory.href}
      className="group block h-full w-full focus:outline-none"
    >
      <div className="relative h-full w-full overflow-hidden">
        {/* Image area — full-bleed, immersive */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#14202e]">
          {subcategory.imageThumbnailUrl ? (
            <Image
              src={subcategory.imageThumbnailUrl}
              alt={subcategory.name}
              fill
              className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-sm font-medium text-white/60"
              style={{
                background: `linear-gradient(145deg, ${withThemeAlpha(
                  resolvedThemeColor,
                  0.3,
                )}, #14202e)`,
              }}
            >
              {subcategory.name}
            </div>
          )}

          {/* Gradient overlays */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent opacity-80" />
          <div className="pointer-events-none absolute inset-0 bg-black/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* Content overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 flex flex-col justify-end p-6 sm:p-8 text-white">
            {/* Product count pill */}
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.3em] text-white/60 transition-transform duration-500 group-hover:-translate-y-1">
              {subcategory.productCount} produit
              {subcategory.productCount > 1 ? "s" : ""}
            </p>

            {/* Title */}
            <h2
              className="text-2xl font-light leading-tight tracking-wide transition-transform duration-500 group-hover:-translate-y-1 sm:text-3xl"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {subcategory.name}
            </h2>

            {/* Subtitle / description */}
            {(subcategory.subtitle || subcategory.description) && (
              <p className="mt-2 line-clamp-2 max-w-sm text-sm font-light leading-relaxed text-white/65 transition-transform duration-500 group-hover:-translate-y-1">
                {subcategory.subtitle || subcategory.description}
              </p>
            )}

            {/* Animated accent line + CTA */}
            <div className="mt-5 flex items-center gap-4">
              <div
                className="h-[1px] w-0 opacity-0 transition-all duration-500 group-hover:w-10 group-hover:opacity-100"
                style={{ backgroundColor: resolvedThemeColor }}
              />
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50 transition-all duration-500 group-hover:text-white">
                Explorer
                <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
