"use client"
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton"
import { useState } from "react"
import { PublicRichText, getPublicRichTextPlainText } from "@cobam/shared/ui/PublicRichText"
import { cn } from "@/lib/utils"

export default function RichDescription({
    description,
    collapseAfter = 420,
}: {
    description?: null | string;
    collapseAfter?: number | null;
}){
    const [isExpanded, setIsExpanded] = useState<boolean>(false)
    const plainTextLength = getPublicRichTextPlainText(description).length;
    const isLong = collapseAfter != null && plainTextLength > collapseAfter;

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
