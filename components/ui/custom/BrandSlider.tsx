"use client";

import Image from "next/image";
import Link from "next/link";
import type { Brand as PublicBrand } from "@/lib/static_tables/brands";
import RailCarousel from "./RailCarousel";

interface BrandSliderProps {
  brands: PublicBrand[];
  speed?: number;
}

export default function BrandSlider({
  brands,
  speed = 80,
}: BrandSliderProps) {
  if (brands.length === 0) return null;

  return (
    <RailCarousel
      autoScroll={true}
      autoScrollSpeed={speed}
      autoScrollDirection="ltr"
      showButtons="never"
      allowDrag={true}
      applyPhysics={true}
      modularScroll={true}
      trackClassName="gap-6"
      previousButtonLabel="Marques précédentes"
      nextButtonLabel="Marques suivantes"
    >
      {brands.map((brand) => (
        <Link
          key={brand.slug}
          draggable={false}
          href={`/produits?search=${encodeURIComponent(`brand:2=${brand.value}`)}`}
          className="transition-all duration-300 opacity-70 hover:opacity-100 select-none group flex h-24 w-32 flex-shrink-0 rounded-xl bg-white"
        >
          {brand.imageUrl ? (
            <Image
              src={brand.imageUrl}
              alt={brand.name}
              width={480}
              height={240}
              className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-110"
              draggable={false}
            />
          ) : (
            <span className="px-2 text-center text-sm font-semibold text-cobam-dark-blue">
              {brand.name}
            </span>
          )}
        </Link>
      ))}
    </RailCarousel>
  );
}
