"use client";

import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { getMediaFolderScopeLabel, MEDIA_FOLDER_SCOPE_IDS } from "@/features/media/folder-scopes";
import type { ProductMediaDto } from "@/features/products/types";
import { cn } from "@/lib/utils";
import ProductMediaEditDialog from "./ProductMediaEditDialog";
import ProductMediaPickerDialog from "./ProductMediaPickerDialog";
import ProductMediaTile from "./ProductMediaTile";

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

function getDefaultProductMediaFolderId(input: {
  mediaKind: ProductMediaDto["kind"] | "ALL";
  role: ProductMediaDto["role"];
}) {
  if (input.role === "TECHNICAL") {
    return MEDIA_FOLDER_SCOPE_IDS.PRODUCT_DATASHEETS;
  }

  if (input.role === "CERTIFICATE") {
    return MEDIA_FOLDER_SCOPE_IDS.CERTIFICATE_PDFS;
  }

  if (input.mediaKind === "IMAGE" || input.role === "GALLERY") {
    return MEDIA_FOLDER_SCOPE_IDS.PRODUCT_IMAGES;
  }

  return null;
}

export default function ProductMediaGrid({
  items,
  onChange,
  title = "Medias",
  description = "Optionnel : ajoutez des medias si necessaire, puis glissez-les pour reorganiser leur ordre.",
  pickerTitle = "Ajouter un media",
  pickerDescription = "Optionnel : choisissez un media existant ou importez-en un nouveau.",
  addButtonLabel = "Ajouter un media",
  addButtonHint = "Optionnel : image, video ou document",
  mediaKind = "ALL",
  documentExtensions,
  role = "GALLERY",
  maxItems,
  folderId,
  folderLabel,
}: {
  items: ProductMediaDto[];
  onChange: (items: ProductMediaDto[]) => void;
  title?: string;
  description?: string;
  pickerTitle?: string;
  pickerDescription?: string;
  addButtonLabel?: string;
  addButtonHint?: string;
  mediaKind?: ProductMediaDto["kind"] | "ALL";
  documentExtensions?: string[];
  role?: ProductMediaDto["role"];
  maxItems?: number;
  folderId?: number | null;
  folderLabel?: string;
}) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<ProductMediaDto | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const pickerFolderId =
    folderId !== undefined ? folderId : getDefaultProductMediaFolderId({ mediaKind, role });
  const pickerFolderLabel = folderLabel ?? getMediaFolderScopeLabel(pickerFolderId);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-cobam-dark-blue text-sm font-semibold">{title}</p>
        <p className="text-sm leading-6 text-slate-500">{description}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((media, index) => (
          <ProductMediaTile
            key={media.id}
            media={media}
            isDragging={draggedIndex === index}
            isDragOver={dragOverIndex === index}
            onRemove={() => onChange(items.filter((item) => item.id !== media.id))}
            onEdit={() => setEditingMedia(media)}
            onDragStart={() => {
              setDraggedIndex(index);
              setDragOverIndex(index);
            }}
            onDragOver={() => setDragOverIndex(index)}
            onDrop={() => {
              if (draggedIndex == null || maxItems === 1) {
                return;
              }

              onChange(moveItem(items, draggedIndex, index));
              setDraggedIndex(null);
              setDragOverIndex(null);
            }}
            onDragEnd={() => {
              setDraggedIndex(null);
              setDragOverIndex(null);
            }}
          />
        ))}

        <button
          type="button"
          onClick={() => setIsPickerOpen(true)}
          className={cn(
            "group hover:border-cobam-water-blue hover:bg-cobam-water-blue/5 flex aspect-square flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 text-center transition",
            items.length === 0 ? "min-h-52" : "",
          )}
        >
          <span className="text-cobam-water-blue group-hover:border-cobam-water-blue/30 mb-3 inline-flex h-14 w-14 items-center justify-center rounded-lg border border-slate-300 bg-white shadow-sm transition">
            <ImagePlus className="h-6 w-6" />
          </span>
          <p className="text-cobam-dark-blue text-sm font-semibold">{addButtonLabel}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{addButtonHint}</p>
        </button>
      </div>

      {isPickerOpen ? (
        <ProductMediaPickerDialog
          open={isPickerOpen}
          onOpenChange={setIsPickerOpen}
          title={pickerTitle}
          description={pickerDescription}
          mediaKind={mediaKind}
          documentExtensions={documentExtensions}
          excludedMediaIds={maxItems === 1 ? [] : items.map((item) => item.id)}
          folderId={pickerFolderId}
          folderLabel={pickerFolderLabel}
          onSelect={(media) => {
            const selectedMedia = { ...media, role, sortOrder: items.length };
            onChange(maxItems === 1 ? [selectedMedia] : [...items, selectedMedia]);
            setIsPickerOpen(false);
          }}
        />
      ) : null}

      <ProductMediaEditDialog
        media={editingMedia}
        open={editingMedia != null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingMedia(null);
          }
        }}
        onSave={(updatedMedia) => {
          onChange(items.map((item) => (item.id === updatedMedia.id ? updatedMedia : item)));
        }}
      />
    </div>
  );
}
