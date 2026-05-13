// components/staff/articles/block-editor/blocks/ImageBlock.tsx

"use client";

import type { ImageBlockData } from "../block-types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
// Import your existing MediaImageField component
import MediaImageField from "@/components/staff/media/importers/media-image-field";

interface ImageBlockProps {
  data: ImageBlockData;
  onChange: (data: ImageBlockData) => void;
}

const WIDTH_CLASSES: Record<ImageBlockData["width"], string> = {
  full: "w-full",
  wide: "w-4/5",
  medium: "w-1/2",
  small: "w-1/3",
};

const ALIGN_CLASSES: Record<ImageBlockData["align"], string> = {
  left: "mr-auto",
  center: "mx-auto",
  right: "ml-auto",
};

export function ImageBlock({ data, onChange }: ImageBlockProps) {
  return (
    <div className="px-2 py-2 space-y-3">
      {/* Media picker */}
      <div>
        <Label className="text-xs text-muted-foreground mb-1 block">Image</Label>
        <MediaImageField
          value={data.mediaId ? Number(data.mediaId) : null}
          onChange={(mediaId, src) =>
            onChange({ ...data, mediaId: mediaId ? String(mediaId) : "", src: src ?? "" })
          }
        />
      </div>

      {/* Preview */}
      {data.src && (
        <div className={cn(WIDTH_CLASSES[data.width], ALIGN_CLASSES[data.align], "block")}>
          <img
            src={data.src}
            alt={data.alt}
            className="rounded-md border object-cover w-full"
          />
          {data.caption && (
            <p className="text-xs text-muted-foreground text-center mt-1">{data.caption}</p>
          )}
        </div>
      )}

      {!data.src && (
        <div className="flex items-center justify-center h-24 rounded-md border border-dashed text-muted-foreground gap-2">
          <ImageIcon className="w-5 h-5" />
          <span className="text-sm">No image selected</span>
        </div>
      )}

      {/* Controls row */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs mb-1 block">Alt text</Label>
          <Input
            value={data.alt}
            onChange={(e) => onChange({ ...data, alt: e.target.value })}
            placeholder="Descriptive alt text…"
            className="h-7 text-xs"
          />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Width</Label>
          <Select
            value={data.width}
            onValueChange={(v) => onChange({ ...data, width: v as ImageBlockData["width"] })}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full</SelectItem>
              <SelectItem value="wide">Wide</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="small">Small</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs mb-1 block">Align</Label>
          <Select
            value={data.align}
            onValueChange={(v) => onChange({ ...data, align: v as ImageBlockData["align"] })}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Caption */}
      <div>
        <Label className="text-xs mb-1 block">Caption</Label>
        <Input
          value={data.caption}
          onChange={(e) => onChange({ ...data, caption: e.target.value })}
          placeholder="Image caption (optional)…"
          className="h-7 text-xs"
        />
      </div>
    </div>
  );
}