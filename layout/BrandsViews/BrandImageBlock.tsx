import { Brand } from "@/lib/static_tables/brands"
import Image from "next/image"
import Link from "next/link"
import { ReactNode } from "react"

function BrandBlockWrapper({brand, children}: {brand: Brand, children: ReactNode}){
    if(!brand.isProductBrand) return <div className="block group">{children}</div>
    return <Link href={`/produits?search=brand:2=${brand.value}`} className="block group">{children}</Link>
}

export default function BrandImageBlock({brand}: { brand: Brand }){
    return <BrandBlockWrapper brand={brand}>
        <div className="relative bg-white rounded-3xl border border-cobam-quill-grey/40 shadow-sm overflow-hidden transition-shadow duration-300 group-hover:shadow-md">
            <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-cobam-water-blue/10" />
            <div className="absolute -bottom-14 -right-10 w-40 h-40 rounded-full bg-cobam-water-blue/5" />
            <div className="relative z-10 px-8 py-10 flex items-center justify-center">
            <div className="w-full max-w-xs h-20 sm:h-24 flex items-center justify-center">
                {brand.imageUrl ? (
                <Image
                    src={brand.imageUrl}
                    alt={brand.name}
                    width={320}
                    height={100}
                    className="object-contain max-h-full w-auto"
                />
                ) : (
                <span className="text-center text-lg font-semibold text-cobam-dark-blue">
                    {brand.name}
                </span>
                )}
            </div>
            </div>
        </div>
    </BrandBlockWrapper>

}