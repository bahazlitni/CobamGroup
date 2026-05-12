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
  if (!brand.isProductBrand) return <div className="relative z-10 px-5 pt-5">{children}</div>;
  return (
    <Link
      href={`/produits?search=${encodeURIComponent(`brand:2=${brand.value}`)}`}
      className="relative z-10 px-5 pt-5"
    >
      {children}
    </Link>
  );
}

export default function GridViewBrandImageBlock({ brand }: { brand: PublicBrandViewItem }) {
  return (
    <BrandBlockWrapper brand={brand}>
      <div className="border-cobam-quill-grey/40 to-cobam-light-bg/70 flex min-h-[150px] items-center justify-center rounded-xl border bg-gradient-to-b from-white px-6 py-7 transition-colors duration-300 group-hover:bg-white">
        {brand.imageUrl ? (
          <Image
            src={brand.imageUrl}
            alt={brand.name}
            width={240}
            height={110}
            className="max-h-[80px] w-auto object-contain contrast-110 grayscale-[0.6] transition-all duration-500 group-hover:grayscale-0"
          />
        ) : (
          <span className="text-cobam-dark-blue text-center text-sm font-semibold">
            {brand.name}
          </span>
        )}
      </div>
    </BrandBlockWrapper>
  );
}
