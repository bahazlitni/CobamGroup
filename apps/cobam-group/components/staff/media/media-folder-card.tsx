"use client";

import { useRef, useState } from "react";
import type { DragEvent, MouseEvent } from "react";
import { Folder, LockKeyhole } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { MediaFolderListItemDto } from "@/features/media/types";
import StaffBadge from "@/components/staff/ui/StaffBadge";
import { readDraggedMediaSelection, type DraggedMediaSelection } from "./media-dnd";

export default function MediaFolderCard({
  folder,
  isSelected,
  onToggleSelected,
  onOpen,
  onDropSelection,
  onDragStart,
}: {
  folder: MediaFolderListItemDto;
  isSelected: boolean;
  onToggleSelected: (folderId: number, checked: boolean, options?: { shiftKey?: boolean }) => void;
  onOpen: (folderId: number) => void;
  onDropSelection: (folderId: number, sélection: DraggedMediaSelection) => void;
  onDragStart: (folderId: number, event: DragEvent<HTMLDivElement>) => void;
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const pendingShiftRef = useRef(false);

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    const sélection = readDraggedMediaSelection(event);

    if (sélection.mediaIds.length === 0 && sélection.folderIds.length === 0) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    const sélection = readDraggedMediaSelection(event);

    setIsDragOver(false);

    if (sélection.mediaIds.length === 0 && sélection.folderIds.length === 0) {
      return;
    }

    event.preventDefault();
    onDropSelection(folder.id, sélection);
  };

  return (
    <Card
      draggable
      onDragStart={(event) => onDragStart(folder.id, event)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={
        isDragOver
          ? "border-cobam-water-blue bg-cobam-water-blue/5 ring-cobam-water-blue/20 overflow-hidden rounded-3xl border shadow-md ring-2"
          : isSelected
            ? "border-cobam-water-blue/40 bg-cobam-water-blue/5 overflow-hidden rounded-3xl border shadow-sm"
            : "hover:border-cobam-water-blue/30 overflow-hidden rounded-3xl border border-slate-300 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      }
    >
      <CardContent className="px-4 py-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={isSelected}
                onClick={(event: MouseEvent<HTMLButtonElement>) => {
                  pendingShiftRef.current = event.shiftKey;
                }}
                onCheckedChange={(checked) => {
                  onToggleSelected(folder.id, checked === true, {
                    shiftKey: pendingShiftRef.current,
                  });
                  pendingShiftRef.current = false;
                }}
                aria-label={`Selectionner le dossier ${folder.name}`}
              />
            </div>
                            {folder.isProtected ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex h-6 items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 text-xs font-semibold text-blue-700">
                        <LockKeyhole className="h-3 w-3" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      Ce dossier est protégé et ne peut pas être supprimé.
                    </TooltipContent>
                  </Tooltip>
                ) : null}
          </div>

          <button
            type="button"
            onClick={() => onOpen(folder.id)}
            className="flex w-full flex-col gap-4 text-left"
          >
            <div className="inline-flex items-center gap-3">
              <div className="bg-cobam-water-blue/10 text-cobam-water-blue flex h-10 w-12 items-center justify-center rounded-lg">
                <Folder className="h-6 w-6" />
              </div>
              <h2 className="text-cobam-dark-blue line-clamp-2 text-base font-semibold">
                {folder.name}
              </h2>
              
            </div>
            <div className="flex items-start justify-between gap-3">
              <div className="inline-flex items-center gap-1">
                <StaffBadge icon="folder" size="sm" color="default">
                  {folder.childFolderCount}
                </StaffBadge>
                <StaffBadge icon="file" size="sm" color="default">
                  {folder.mediaCount}
                </StaffBadge>
              </div>
            </div>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
