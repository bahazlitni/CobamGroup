"use client";

import type { ArticleCTABannerAnchor } from "@prisma/client";
import {
  ARTICLE_CTA_BANNER_ANCHORS,
  getArticleCtaBannerAnchorOption,
} from "@/features/articles/cta-banners";
import type { ArticleCTABannerDto } from "@/features/articles/types";
import { cn } from "@/lib/utils";

type AnchorPickerProps = {
  value: ArticleCTABannerAnchor;
  onValueChange: (value: ArticleCTABannerAnchor) => void;
  aspectRatio: string;
  disabled?: boolean;
  className?: string;
};

export default function AnchorPicker({
  value,
  onValueChange,
  aspectRatio,
  disabled = false,
  className,
}: AnchorPickerProps) {
  const selected = getArticleCtaBannerAnchorOption(value as ArticleCTABannerDto["anchor"]);

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div
        className="relative grid w-full overflow-hidden rounded-2xl border border-slate-300 bg-slate-50 shadow-inner"
        style={{ aspectRatio }}
      >
        {ARTICLE_CTA_BANNER_ANCHORS.map((anchor) => (
          <button
            key={anchor.value}
            type="button"
            disabled={disabled}
            aria-label={anchor.label}
            aria-pressed={anchor.value === value}
            onClick={() => onValueChange(anchor.value as ArticleCTABannerAnchor)}
            className={cn(
              "relative min-h-0 border-slate-200 transition-colors hover:bg-cobam-water-blue/8",
              "focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobam-water-blue/30",
              anchor.col !== 2 && "border-r",
              anchor.row !== 2 && "border-b",
              disabled && "cursor-not-allowed opacity-60 hover:bg-transparent",
            )}
            style={{
              gridColumn: anchor.col + 1,
              gridRow: anchor.row + 1,
            }}
          />
        ))}

        <span
          className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cobam-water-blue shadow-[0_0_0_6px_rgba(10,141,193,0.16)] transition-[top,left] duration-200"
          style={{
            left: `${(selected.col + 0.5) * (100 / 3)}%`,
            top: `${(selected.row + 0.5) * (100 / 3)}%`,
          }}
        />
      </div>
      <p className="text-xs font-medium text-slate-500">{selected.label}</p>
    </div>
  );
}
