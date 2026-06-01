"use client";

import Image from "next/image";
import { FileText, ImageIcon, Save, Video } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PanelInput from "@/components/staff/ui/PanelInput";
import { Button } from "@/components/ui/button";
import { useMediaObjectUrl } from "@/features/media/hooks/use-media-object-url";
import type { ProductMediaDto } from "@/features/products/types";

function getMediaLabel(media: ProductMediaDto) {
  return media.title || media.originalFilename || `Media #${media.id}`;
}

function MediaPreview({ media }: { media: ProductMediaDto }) {
  const { objectUrl } = useMediaObjectUrl(
    media.kind === "IMAGE" ? media.id : null,
    "thumbnail",
  );

  if (media.kind === "IMAGE" && objectUrl) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <Image
          src={objectUrl}
          alt={media.altText || getMediaLabel(media)}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
    );
  }

  const Icon = media.kind === "VIDEO" ? Video : media.kind === "DOCUMENT" ? FileText : ImageIcon;

  return (
    <div className="flex aspect-square items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-cobam-water-blue">
      <Icon className="h-12 w-12" />
    </div>
  );
}

export default function ProductMediaEditDialog({
  media,
  open,
  onOpenChange,
  onSave,
}: {
  media: ProductMediaDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (media: ProductMediaDto) => void;
}) {
  const [name, setName] = useState("");
  const [altText, setAltText] = useState("");

  useEffect(() => {
    setName(media?.title ?? "");
    setAltText(media?.altText ?? "");
  }, [media]);

  if (!media) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-hidden p-0">
        <DialogHeader className="border-b border-slate-200 px-6 py-5">
          <DialogTitle className="text-base font-semibold text-cobam-dark-blue">
            Modifier le media
          </DialogTitle>
          <DialogDescription className="pt-2 text-sm leading-6 text-slate-500">
            Ajustez le nom public et le texte alternatif associes a ce produit.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 px-6 py-6 md:grid-cols-[240px_minmax(0,1fr)]">
          <div className="space-y-3">
            <MediaPreview media={media} />
            <p className="break-words text-xs leading-5 text-slate-500">
              {media.originalFilename || `${media.kind.toLowerCase()} #${media.id}`}
            </p>
          </div>

          <div className="space-y-5">
            <label className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-cobam-water-blue">
                Nom
              </span>
              <PanelInput
                fullWidth
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Nom affiche, optionnel"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-cobam-water-blue">
                Texte alternatif
              </span>
              <PanelInput
                fullWidth
                value={altText}
                onChange={(event) => setAltText(event.target.value)}
                placeholder="Description courte du visuel, optionnelle"
              />
            </label>
          </div>
        </div>

        <DialogFooter className="border-t border-slate-200 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={() => {
              onSave({
                ...media,
                title: name.trim() || null,
                altText: altText.trim() || null,
              });
              onOpenChange(false);
            }}
          >
            <Save className="mr-2 h-4 w-4" />
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
