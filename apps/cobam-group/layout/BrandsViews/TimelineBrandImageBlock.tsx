import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { PublicBrandViewItem } from "./types";

function BrandBlockWrapper({
  brand,
  children,
}: {
  brand: PublicBrandViewItem;
  children: ReactNode;
}) {
  if (!brand.isProductBrand) return <div className="group block">{children}</div>;
  return (
    <Link
      href={`/produits?search=${encodeURIComponent(`brand:2=${brand.value}`)}`}
      className="group block"
    >
      {children}
    </Link>
  );
}

export default function TimelineBrandImageBlock({ brand }: { brand: PublicBrandViewItem }) {
  return (
    <BrandBlockWrapper brand={brand}>
      <div className="border-cobam-quill-grey/40 relative overflow-hidden rounded-3xl border bg-white shadow-sm transition-shadow duration-300 group-hover:shadow-md">
        <div className="bg-cobam-water-blue/10 absolute -top-10 -left-10 h-32 w-32 rounded-full" />
        <div className="bg-cobam-water-blue/5 absolute -right-10 -bottom-14 h-40 w-40 rounded-full" />
        <div className="relative z-10 flex items-center justify-center px-8 py-10">
          <div className="flex h-20 w-full max-w-xs items-center justify-center sm:h-24">
            {brand.imageUrl ? (
              <Image
                src={brand.imageUrl}
                alt={brand.name}
                width={320}
                height={100}
                className="max-h-full w-auto object-contain"
              />
            ) : (
              <span className="text-cobam-dark-blue text-center text-lg font-semibold">
                {brand.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </BrandBlockWrapper>
  );
}
