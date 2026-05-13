import { ChevronRight } from "lucide-react";
import Link from "next/link";

export interface BreadCrumbProps {
    categorySlug?: string;
    categoryName?: string;
    subcategorySlug?: string;
    subcategoryName?: string;
} 

function DynamicLink({href, text} : { href?: string, text?: string}){
    const cls = "transition hover:text-cobam-water-blue"
    if(!text) return null
    if(!href) return <p className={cls}>{text}</p>
    return <Link href={href} className={cls}>{text}</Link>
}

export default function BreadCrumb({categorySlug, categoryName, subcategorySlug, subcategoryName}: BreadCrumbProps){
    return <div className="inline-flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        <Link href="/produits" className="transition hover:text-cobam-water-blue">
            Produits
        </Link>
        {
            categoryName && 
            <>
                <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                <DynamicLink href={categorySlug ? `/produits/${categorySlug}` : undefined} text={categoryName}/>
            </>
        }
        {
            categoryName && subcategoryName && 
            <>
                <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                <DynamicLink href={categorySlug && subcategorySlug ? `/produits/${categorySlug}/${subcategorySlug}` : undefined} text={subcategoryName}/>
            </>
        }
    </div>
}