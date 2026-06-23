"use client";

import { useState } from "react";
import { StaffBadge } from "@/components/staff/ui";
import { getMediaFolderScopeLabel, MEDIA_FOLDER_SCOPE_IDS } from "@/features/media/folder-scopes";
import type { ProductMediaDto } from "@/features/products/types";
import ProductGrid from "./ProductGrid";
import type { ProductGridCardItem } from "./ProductGridCard";
import ProductMediaEditDialog from "./ProductMediaEditDialog";
import ProductMediaPickerDialog from "./ProductMediaPickerDialog";

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

function getMediaLabel(media: ProductMediaDto) {
  return media.title || media.originalFilename || `Media #${media.id}`;
}

function getMediaKindLabel(kind: ProductMediaDto["kind"]) {
  switch (kind) {
    case "DOCUMENT":
      return "Document";
    case "IMAGE":
      return "Image";
    case "VIDEO":
      return "Vidéo";
    default:
      return kind;
  }
}

function mapMediaToGridItem(media: ProductMediaDto): ProductGridCardItem {
  return {
    id: media.id,
    imageAlt: media.altText || getMediaLabel(media),
    imageUrl: media.role === "GALLERY" && media.kind === "IMAGE" ? media.thumbnailUrl : null,
    subtitle: media.originalFilename || `${media.kind.toLowerCase()} #${media.id}`,
    title: getMediaLabel(media),
    type: media.kind,
  };
}

export default function ProductMediaGrid({
  items,
  onChange,
  title = "Medias",
  description = "Optionnel : ajoutez des medias si necessaire, puis glissez-les pour reorganiser leur ordre.",
  pickerTitle = "Ajouter un media",
  pickerDescription = "Optionnel : choisissez un media existant ou importez-en un nouveau.",
  addButtonLabel = "Ajouter un media",
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
  mediaKind?: ProductMediaDto["kind"] | "ALL";
  documentExtensions?: string[];
  role?: ProductMediaDto["role"];
  maxItems?: number;
  folderId?: number | null;
  folderLabel?: string;
}) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<ProductMediaDto | null>(null);
  const pickerFolderId =
    folderId !== undefined ? folderId : getDefaultProductMediaFolderId({ mediaKind, role });
  const pickerFolderLabel = folderLabel ?? getMediaFolderScopeLabel(pickerFolderId);
  const gridItems = items.map(mapMediaToGridItem);

  return (
    <>
      <ProductGrid
        items={gridItems}
        title={title}
        description={description}
        addButtonLabel={addButtonLabel}
        onAddClick={() => setIsPickerOpen(true)}
        onItemClick={(_, index) => setEditingMedia(items[index] ?? null)}
        onItemsReordered={
          maxItems === 1
            ? undefined
            : (nextItems) => {
                const itemsById = new Map(items.map((item) => [String(item.id), item]));
                onChange(
                  nextItems
                    .map((item) => itemsById.get(String(item.id)))
                    .filter((item): item is ProductMediaDto => Boolean(item)),
                );
              }
        }
        onRemove={(_, index) => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
        renderMeta={(item) => (
          <StaffBadge size="xs" color="secondary">
            {getMediaKindLabel(item.type as ProductMediaDto["kind"])}
          </StaffBadge>
        )}
      />

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
    </>
  );
}
