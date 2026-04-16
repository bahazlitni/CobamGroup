import { PublicProductSubcategoryLink } from "@/features/products/types"
import Link from "next/link"

export default function SubcategoriesList({subcategories}: {subcategories: PublicProductSubcategoryLink[]}){
    return <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-slate-500">
        <span className="font-medium text-slate-400">Catégories</span>
        <div className="inline-block">
            {subcategories.map((subcategory, i: number) => (
            <Link
                key={`${subcategory.categorySlug}-${subcategory.slug}`}
                href={`/produits/${subcategory.categorySlug}/${subcategory.slug}`}
                className="transition hover:text-cobam-water-blue"
            >
                {subcategory.name}
                {i === subcategories.length - 1 ? null : <span>,{" "}</span>}
            </Link>
            ))}
        </div>
    </div>
}