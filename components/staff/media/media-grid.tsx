"use client";

import { Fragment, type RefObject } from "react";
import { ImageOff, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { MediaListItemDto } from "@/features/media/types";
import MediaCard from "./media-card";
import MediaGridSkeleton from "./media-grid-skeleton";

type MediaGroup = {
  key: string;
  label: string;
  items: MediaListItemDto[];
};

export default function MediaGrid({
  groups,
  selectedIds,
  onToggleSelected,
  onToggleGroupSelected,
  onOpen,
  isLoadingInitial,
  isLoadingMore,
  hasMore,
  sentinelRef,
}: {
  groups: MediaGroup[];
  selectedIds: number[];
  onToggleSelected: (mediaId: number, checked: boolean) => void;
  onToggleGroupSelected: (mediaIds: number[], checked: boolean) => void;
  onOpen: (mediaId: number) => void;
  isLoadingInitial: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  sentinelRef: RefObject<HTMLDivElement | null>;
}) {
  const selectedSet = new Set(selectedIds);

  return (
    <div className="overflow-hidden px-4 py-5 md:px-6 md:py-6">
        {isLoadingInitial ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            <MediaGridSkeleton count={4} />
          </div>
        ) : groups.length === 0 ? (
          <div className="h-full flex flex-col place-items-center gap-4 text-center text-sm text-slate-500">
            <ImageOff className="h-10 w-10 text-slate-300" />
            <p>Aucun media correspondant.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {groups.map((group) => {
              const groupIds = group.items.map((item) => item.id);
              const selectedCount = groupIds.filter((id) => selectedSet.has(id)).length;
              const checked =
                selectedCount === 0
                  ? false
                  : selectedCount === groupIds.length
                    ? true
                    : "indeterminate";

              return (
                <Fragment key={group.key}>
                  <div className="col-span-full flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(nextChecked) =>
                          onToggleGroupSelected(groupIds, nextChecked === true)
                        }
                        aria-label={`Selectionner ${group.label}`}
                      />
                      <div>
                        <p className="text-sm font-semibold text-cobam-dark-blue">
                          {group.label}
                        </p>
                        <p className="text-xs text-slate-500">
                          {group.items.length} fichier(s)
                        </p>
                      </div>
                    </div>
                  </div>

                  {group.items.map((item) => (
                    <MediaCard
                      key={item.id}
                      item={item}
                      isSelected={selectedSet.has(item.id)}
                      onToggleSelected={onToggleSelected}
                      onOpen={onOpen}
                    />
                  ))}
                </Fragment>
              );
            })}

            {isLoadingMore ? <MediaGridSkeleton count={8} /> : null}
          </div>
        )}

        <div className="flex min-h-14 items-center justify-center">
          {isLoadingMore ? (
            <div className="inline-flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement de nouveaux fichiers...
            </div>
          ) : hasMore ? (
            <div ref={sentinelRef} className="h-2 w-full" />
          ) : groups.length > 0 ? (
            <p className="text-xs text-slate-400">Tous les fichiers charges pour cette vue.</p>
          ) : null}
      </div>
    </div>
  );
}
