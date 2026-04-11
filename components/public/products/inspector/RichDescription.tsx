"use client"
import { AnimatedUIButton } from "@/components/ui/custom/Buttons"
import { useState } from "react"
import PublicRichText from "../../articles/public-rich-text"
import { cn } from "@/lib/utils"

export default function RichDescription({description}: {description?: null | string}){
    const [isExpanded, setIsExpanded] = useState<boolean>(false)
    const isLong = description ? description.length > 420 : false;

    if(!description) return null;

    return <div className="space-y-3">
        <div
        className={cn(
            "text-slate-600",
            !isExpanded && isLong ? "max-h-64 overflow-hidden" : "",
        )}
        >
        <PublicRichText
            content={description}
            className="max-w-none"
        />
        </div>
        {isLong ? (
        <AnimatedUIButton
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="-ml-3 w-fit"
        >
            {isExpanded ? "Afficher moins" : "Afficher plus"}
        </AnimatedUIButton>
        ) : null}
    </div>
}