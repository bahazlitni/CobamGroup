"use client";

import { useEffect, useMemo } from "react";
import {
  File,
  FileImage,
  FileText,
  FileVideo,
  Music4,
} from "lucide-react";
import Image from "next/image";
import { StaffBadge } from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { cn } from "@/lib/utils";
import { formatBytes } from "./utils";

export type MediaUploadQueueStatus = "pending" | "uploading" | "success" | "error";

export type MediaUploadQueueItem = {
  id: string;
  file: File;
  status: MediaUploadQueueStatus;
  errorMessage?: string | null;
};

function renderFileIcon(file: File, className: string) {
  if (file.type.startsWith("image/")) {
    return <FileImage className={className} />;
  }

  if (file.type.startsWith("video/")) {
    return <FileVideo className={className} />;
  }

  if (file.type.startsWith("audio/")) {
    return <Music4 className={className} />;
  }

  if (file.type === "application/pdf" || file.type.startsWith("text/")) {
    return <FileText className={className} />;
  }

  return <File className={className} />;
}

function getStatusBadge(status: MediaUploadQueueStatus) {
  switch (status) {
    case "uploading":
      return {
        label: "Import en cours",
        color: "blue" as const,
        icon: "loader" as const,
      };
    case "success":
      return {
        label: "Importe",
        color: "green" as const,
        icon: "check-circle" as const,
      };
    case "error":
      return {
        label: "En erreur",
        color: "rose" as const,
        icon: "warning" as const,
      };
    default:
      return {
        label: "En attente",
        color: "default" as const,
        icon: "file" as const,
      };
  }
}

function MediaUploadQueuePreview({ file }: { file: File }) {
  const isImage = file.type.startsWith("image/");
  const previewUrl = useMemo(
    () => (isImage ? URL.createObjectURL(file) : null),
    [file, isImage],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (previewUrl) {
    return (
      <Image
        src={previewUrl}
        alt={file.name}
        width={56}
        height={56}
        unoptimized
        className="h-14 w-14 rounded-lg object-cover"
      />
    );
  }

  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
      {renderFileIcon(file, "h-6 w-6")}
    </div>
  );
}

function MediaUploadQueueRow({
  item,
  canRemove,
  onRemove,
}: {
  item: MediaUploadQueueItem;
  canRemove: boolean;
  onRemove?: (itemId: string) => void;
}) {
  const status = getStatusBadge(item.status);

  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-3xl border px-4 py-4 transition",
        item.status === "error"
          ? "border-rose-200 bg-rose-50/60"
          : "border-slate-300 bg-white",
      )}
    >
      <MediaUploadQueuePreview file={item.file} />

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="line-clamp-1 text-sm font-semibold text-cobam-dark-blue">
              {item.file.name}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                {renderFileIcon(item.file, "h-3.5 w-3.5")}
                {item.file.type || "Type inconnu"}
              </span>
              <span>{formatBytes(item.file.size)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StaffBadge size="md" color={status.color} icon={status.icon}>
              {status.label}
            </StaffBadge>

            {canRemove && onRemove ? (
              <AnimatedUIButton
                type="button"
                variant="ghost"
                icon="close"
                onClick={() => onRemove(item.id)}
                className="h-9 min-w-9 rounded-full px-0"
              />
            ) : null}
          </div>
        </div>

        {item.errorMessage ? (
          <p className="text-xs leading-5 text-rose-700">{item.errorMessage}</p>
        ) : null}
      </div>
    </div>
  );
}

export default function MediaUploadQueue({
  items,
  onRemove,
  canRemove,
}: {
  items: MediaUploadQueueItem[];
  onRemove?: (itemId: string) => void;
  canRemove?: boolean;
}) {
  const totalSize = useMemo(
    () => items.reduce((sum, item) => sum + item.file.size, 0),
    [items],
  );

  if (items.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
        Aucun fichier dans la file d&apos;import.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.75rem] border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <p className="font-medium text-cobam-dark-blue">
          {items.length} fichier(s) pret(s) a l&apos;import
        </p>
        <StaffBadge size="md" color="default" className="bg-white">
          {formatBytes(totalSize)}
        </StaffBadge>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <MediaUploadQueueRow
            key={item.id}
            item={item}
            canRemove={canRemove === true}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}
