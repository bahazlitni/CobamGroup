"use client";

import ImagePreviewCarousel from "@/components/ui/custom/ImagePreviewCarousel";
import type { PublicProductInspectorMedia } from "@/features/products/types";

type CarouselProps = {
  media: PublicProductInspectorMedia[];
  title: string;
};

export default function Carousel({ media, title }: CarouselProps) {
  return (
    <ImagePreviewCarousel
      items={media.map((entry) => ({
        id: entry.id,
        url: entry.url,
        thumbnailUrl: entry.thumbnailUrl,
        altText: entry.altText,
        title: entry.title,
        mimeType: entry.mimeType,
        kind: entry.kind,
      }))}
      title={title}
      size="2xl"
      className="lg:sticky lg:top-28"
      frameClassName="border-cobam-quill-grey/35 shadow-[0_28px_90px_rgba(20,32,46,0.08)]"
      thumbnailClassName="focus-visible:ring-cobam-water-blue/45"
      activeThumbnailClassName="border-cobam-dark-blue ring-cobam-dark-blue/10"
      inactiveThumbnailClassName="border-cobam-quill-grey/35 hover:border-cobam-water-blue/40"
      viewerClassName="bg-cobam-dark-blue/90"
      emptyLabel="Aucun media disponible."
    />
  );
}
