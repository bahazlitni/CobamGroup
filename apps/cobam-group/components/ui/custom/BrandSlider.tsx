"use client";

import Image from "next/image";
import Link from "next/link";
import type { PublicOrganizationBrand } from "@/features/organizations/public";
import RailCarousel from "./RailCarousel";

interface BrandSliderProps {
  brands: PublicOrganizationBrand[];
  speed?: number;
}

export default function BrandSlider({
  brands,
  speed = 80,
}: BrandSliderProps) {
  const brandsWithImages = brands.filter(
    (brand): brand is PublicOrganizationBrand & { imageUrl: string } =>
      typeof brand.imageUrl === "string" && brand.imageUrl.trim().length > 0,
  );

  if (brandsWithImages.length === 0) return null;

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
      {brandsWithImages.map((brand) => (
        <Link
          key={brand.slug}
          draggable={false}
          href={`/produits?search=${encodeURIComponent(brand.name)}`}
          className="transition-all duration-300 opacity-70 hover:opacity-100 select-none group flex h-24 w-32 flex-shrink-0 rounded-xl bg-white"
        >
          <Image
            src={brand.imageUrl}
            alt={brand.name}
            width={480}
            height={240}
            className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-110"
            draggable={false}
          />
        </Link>
      ))}
    </RailCarousel>
  );
}
