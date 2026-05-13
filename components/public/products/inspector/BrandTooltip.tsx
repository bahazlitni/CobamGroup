"use client";

import type { PublicProductBrand } from "@/features/products/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function BrandTooltip({ brand }: { brand: PublicProductBrand | null }) {
  if (!brand) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex w-fit cursor-help flex-wrap items-center gap-3">
          <span className="text-xs font-semibold tracking-[0.22em] text-slate-400 uppercase">
            Marque
          </span>
          <span className="text-cobam-water-blue text-sm font-semibold">{brand.name}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs px-4 py-3 leading-6">
        {brand.description?.trim() ||
          "Aucune description de marque n'est renseignée pour le moment."}
      </TooltipContent>
    </Tooltip>
  );
}
