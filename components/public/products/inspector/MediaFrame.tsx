import { PublicProductInspectorMedia } from "@/features/products/types";
import { CircleAlert } from "lucide-react";
import Image from "next/image";

export default function MediaFrame({
  media,
  isThumbnail = false,
  highQuality = false
}: {
  media: null | PublicProductInspectorMedia;
  priority?: boolean;
  highQuality?: boolean;
  isThumbnail?: boolean;
}) {
    if(media){
        const src = (isThumbnail ? media.thumbnailUrl : media.url) ?? media.url
        const quality = isThumbnail ? 0 : 100

        if (media.kind === "IMAGE") {
            if(highQuality){
                return <img src={media.url} alt={media.altText ?? media.title ?? "frame"} className="object-cover" />
            }
            return (
            <Image
                src={src}
                alt={media.altText ?? media.title ?? "frame"}
                fill
                priority={!isThumbnail}
                className="object-cover"
                quality={quality}
            />
            );
        }

        if (media.kind === "VIDEO") {
            return (
            <video
                className="h-full w-full object-cover"
                controls
                playsInline
                preload="metadata"
            >
                <source src={media.url} type={media.mimeType ?? undefined} />
            </video>
            );
        }
    }
    return (
        <div className="flex h-full items-center justify-center bg-slate-100 px-8 text-center text-slate-500">
        <div className="space-y-3">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400">
            <CircleAlert className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium">This media is not supported.</p>
        </div>
        </div>
    );
}