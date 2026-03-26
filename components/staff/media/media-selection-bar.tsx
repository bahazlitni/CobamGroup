"use client";

import { Layers3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import DynamicSuppressionButton from "./dynamic-suppression-button";
import { formatBytes } from "./utils";

export default function MediaSelectionBar({
  count,
  totalSize,
  canDelete,
  isForceDeleteMode,
  isDeleting,
  onClear,
  onDelete,
}: {
  count: number;
  totalSize: number;
  canDelete: boolean;
  isForceDeleteMode: boolean;
  isDeleting: boolean;
  onClear: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-3xl -translate-x-1/2">
      <Card className="pointer-events-auto rounded-[1.75rem] border border-cobam-water-blue/25 bg-white/95 shadow-xl backdrop-blur">
        <CardContent className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-cobam-water-blue/10 text-cobam-dark-blue">
              <Layers3 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-cobam-dark-blue">
                {count} fichier(s) selectionne(s)
              </p>
              <p className="truncate text-xs text-slate-500">
                Volume estime: {formatBytes(totalSize)}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <AnimatedUIButton type="button" variant="light" onClick={onClear}>
              Vider
            </AnimatedUIButton>
            <DynamicSuppressionButton
              isForceMode={isForceDeleteMode}
              onClick={onDelete}
              disabled={!canDelete || isDeleting}
              loading={isDeleting}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
