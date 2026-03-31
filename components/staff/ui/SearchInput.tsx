import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Props {
    value: string
    onChange: (value: string) => void
    placeholder?: string 
    fullWidth?: boolean
}

export default function SearchInput({
    value, onChange, placeholder="Rechercher...", fullWidth = false
}: Props){
    const baseCls = "relative h-10 w-full min-w-48 max-w-128"
    const fullWidthCls = baseCls
    const nonFullWidth = baseCls + " max-w-128"

    return <div className={fullWidth ? fullWidthCls : nonFullWidth}>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="w-full h-full rounded-md border border-slate-300 bg-white pl-11 text-sm"
        />
    </div>
}