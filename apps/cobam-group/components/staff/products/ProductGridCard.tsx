"use client";

import { type ReactNode, useState } from "react";
import Image from "next/image";
import { File, FileText, GripVertical, ImageIcon, Package, Video, X } from "lucide-react";
import { StaffBadge } from "@/components/staff/ui";
import { cn } from "@/lib/utils";

export type ProductGridCardType = "DOCUMENT" | "IMAGE" | "PRODUCT" | "VIDEO";

export type ProductGridCardItem = {
  id: number | string;
  imageAlt?: string | null;
  imageUrl?: string | null;
  subtitle?: string | null;
  title: string;
  type: ProductGridCardType;
};

function getFallbackIcon(type: ProductGridCardType) {
  switch (type) {
    case "DOCUMENT":
      return <FileText className="h-8 w-8" />;
    case "IMAGE":
      return <ImageIcon className="h-8 w-8" />;
    case "VIDEO":
      return <Video className="h-8 w-8" />;
    case "PRODUCT":
      return <Package className="h-8 w-8" />;
    default:
      return <File className="h-8 w-8" />;
  }
}

export default function ProductGridCard({
  item,
  index,
  canDrag,
  isDragging,
  isDragOver,
  meta,
  onClick,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  item: ProductGridCardItem;
  index: number;
  canDrag: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  meta?: ReactNode;
  onClick?: () => void;
  onRemove: () => void;
  onDragStart: () => void;
  onDragOver: () => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) {
  const imageUrl = item.imageUrl ?? null;
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const hasImage = Boolean(imageUrl) && failedImageUrl !== imageUrl;
  const clickableProps = onClick
    ? {
        role: "button",
        tabIndex: 0,
      }
    : {};

  return (
    <div
      draggable={canDrag}
      onClick={(event) => {
        if (!onClick || (event.target as HTMLElement).closest("button,input,label")) {
          return;
        }
        onClick();
      }}
      onKeyDown={(event) => {
        if (!onClick || (event.target as HTMLElement).closest("button,input,label")) {
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      onDragStart={onDragStart}
      onDragOver={(event) => {
        event.preventDefault();
        onDragOver();
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDrop();
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "group relative h-full overflow-hidden rounded-3xl border border-slate-300 bg-white shadow-sm transition",
        onClick ? "cursor-pointer" : "",
        canDrag && !onClick ? "cursor-grab active:cursor-grabbing" : "",
        canDrag && onClick ? "active:cursor-grabbing" : "",
        isDragOver ? "border-cobam-water-blue ring-2 ring-cobam-water-blue/20" : "",
        isDragging ? "scale-[0.98] opacity-70" : "hover:border-slate-300",
      )}
      {...clickableProps}
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        {hasImage ? (
          <Image
            src={imageUrl ?? ""}
            alt={item.imageAlt || item.title}
            fill
            sizes="(min-width: 1280px) 240px, (min-width: 1024px) 25vw, (min-width: 640px) 45vw, 90vw"
            className="object-contain p-3 transition duration-300 group-hover:scale-[1.03]"
            onError={() => setFailedImageUrl(imageUrl)}
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            {getFallbackIcon(item.type)}
          </div>
        )}

        <button
          type="button"
          onClick={onRemove}
          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-500 shadow-sm transition hover:bg-red-50 hover:text-red-600"
          aria-label={`Retirer ${item.title}`}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-slate-950/80 px-2 py-1 text-[11px] font-medium text-white">
          <GripVertical className="h-3.5 w-3.5" />
          #{index + 1}
        </div>
      </div>

      <div className="space-y-2 px-3 py-3">
        <div className="flex items-start gap-2">
          <p className="text-cobam-dark-blue line-clamp-2 min-w-0 flex-1 text-sm font-semibold">
            {item.title}
          </p>
          <StaffBadge size="xs" color="secondary" title={`ID ${item.id}`}>
            ID #{item.id}
          </StaffBadge>
        </div>

        <p className="truncate text-xs text-slate-500">{item.subtitle || item.type}</p>

        <div className="flex min-h-7 items-center justify-between gap-2">{meta}</div>
      </div>
    </div>
  );
}
