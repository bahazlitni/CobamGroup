import AnimatedUICopyButton from "@/components/ui/custom/CopyButton";
import Link from "next/link";

interface CopiablePropertyProps {
    name: string;
    value?: null | string;
    href?: string
    isFemale?: boolean
    isPlural?: boolean
    isCopiable?: boolean
}

function buildErrorText(name: string, isFemale?: boolean, isPlural?: boolean){
    if(isPlural) return `Impossible de copier les ${name}.`
    if(isFemale) return `Impossible de copier la ${name}.`
    return `Impossible de copier le ${name}.`
}

function buildSuccessText(name: string, isFemale?: boolean, isPlural?: boolean){
    if(isPlural && isFemale) return `${name} copiées.`
    if(isPlural && !isFemale) return `${name} copiés.`
    if(isFemale) return `${name} copiée.`
    return `${name} copié.`
}

export default function Property({name, value, href, isFemale=false, isPlural=false, isCopiable=false}: CopiablePropertyProps){
    const valueCls = "text-sm font-semibold text-cobam-water-blue"
    if(!value) return null
    return <div className="w-fit flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            {name}
        </span>
        { href 
            ? <Link href={href} className={valueCls}>{value}</Link>
            : <span className={valueCls}>{value}</span>
        }
        
        {value && isCopiable && <AnimatedUICopyButton
            errorText={buildErrorText(name, isFemale, isPlural)}
            successText={buildSuccessText(name, isFemale, isPlural)}
            value={value}
            size="xs"
            variant="light"
        />}
    </div>
} 