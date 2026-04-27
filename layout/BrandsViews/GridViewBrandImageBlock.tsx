import { Brand } from "@/lib/static_tables/brands";
import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

function BrandBlockWrapper({brand, children}: {brand: Brand, children: ReactNode}){
    if(!brand.isProductBrand) return <div className="relative z-10 px-5 pt-5">{children}</div>
    return <Link href={`/produits?search=brand:2=${brand.value}`} className="relative z-10 px-5 pt-5">{children}</Link>
}

export default function GridViewBrandImageBlock({brand}: {brand: Brand}){
    return <BrandBlockWrapper brand={brand}>
        <div className="flex min-h-[150px] items-center justify-center rounded-xl border border-cobam-quill-grey/40 bg-gradient-to-b from-white to-cobam-light-bg/70 px-6 py-7 transition-colors duration-300 group-hover:bg-white">
        {brand.imageUrl ? (
            <Image
                src={brand.imageUrl}
                alt={brand.name}
                width={240}
                height={110}
                className="max-h-[80px] w-auto object-contain grayscale-[0.6] contrast-110 transition-all duration-500 group-hover:grayscale-0"
            />
        ) : (
            <span className="text-center text-sm font-semibold text-cobam-dark-blue">
            {brand.name}
            </span>
        )}
        </div>
    </BrandBlockWrapper>
}