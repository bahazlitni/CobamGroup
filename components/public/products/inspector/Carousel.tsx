import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { PublicProductInspectorMedia } from "@/features/products/types";
import { useState } from "react";
import MediaFrame from "./MediaFrame";
import Image from "next/image";
import { cn } from "@/lib/utils";

type CarouselProps = {
  media: PublicProductInspectorMedia[];
  title: string;
};

export default function Carousel({ media, title }: CarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const activeMedia = media[activeIndex] ?? media[0] ?? null;
    const containerCls = "relative aspect-[4/3] sm:aspect-square overflow-hidden rounded-[2rem] border border-cobam-quill-grey/30 bg-[#fafaf9] w-full max-w-[600px]"
    const containerCls2 = "relative grid place-items-center text-center text-[#5e5e5e] w-full h-full max-w-[600px]"

    if (!activeMedia) {
        return (
            <div className={containerCls}>
                <div className={containerCls2}>
                    Aucun media disponible.
                </div>
            </div>
        );
    }

    if (media.length === 1) {
        return (
            <div className={containerCls}>
                <div className={containerCls2}>
                    <MediaFrame highQuality media={activeMedia} />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3 max-w-[600px]">
            <div className={containerCls}>
                <div className={containerCls2}>
                    <MediaFrame highQuality media={activeMedia} />
                </div>

                <AnimatedUIButton
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        setActiveIndex((currentIndex) =>
                        currentIndex === 0 ? media.length - 1 : currentIndex - 1,
                        )
                    }
                    className="absolute left-3 top-1/2 h-10 w-10 min-h-0 -translate-y-1/2"
                    aria-label="Media precedente"
                    icon="chevron-left"
                />
                <AnimatedUIButton
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        setActiveIndex((currentIndex) =>
                        currentIndex === media.length - 1 ? 0 : currentIndex + 1,
                        )
                    }
                    className="absolute right-3 top-1/2 h-10 w-10 min-h-0 -translate-y-1/2"
                    aria-label="Media suivante"
                    icon="chevron-right"
                />
            </div>

            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                {media.map((entry, index) => {
                const isActive = index === activeIndex;

                return (
                    <button
                    key={entry.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                        "overflow-hidden rounded-lg border bg-[#fafaf9] transition-all duration-300",
                        isActive
                        ? "border-2 border-cobam-water-blue shadow-md -translate-y-1"
                        : "border-cobam-quill-grey/30 hover:border-cobam-water-blue/50",
                    )}
                    >
                    <div className="relative aspect-square overflow-hidden bg-transparent">
                        {entry.kind === "IMAGE" ? (
                        <Image
                            src={entry.thumbnailUrl ?? entry.url}
                            alt={entry.altText ?? entry.title ?? title}
                            fill
                            sizes="96px"
                            className="object-cover"
                        />
                        ) : entry.kind === "VIDEO" ? (
                        <div className="flex h-full items-center justify-center text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Video
                        </div>
                        ) : (
                        <div className="flex h-full items-center justify-center text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Fichier
                        </div>
                        )}
                    </div>
                    </button>
                );
                })}
            </div>
        </div>
    );
}
