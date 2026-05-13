"use client";

import { EyeOff, Globe2, Loader2, Save } from "lucide-react";
import AutosaveIndicator from "@/components/staff/articles/AutosaveIndicator";
import { SidebarCard } from "@/components/staff/articles/SidebarCard";
import type { ArticleEditorState } from "@/components/staff/articles/ArticleEditorShell";
import { StaffBadge } from "@/components/staff/ui";
import { Button } from "@/components/ui/button";

interface ArticlePublishPanelProps {
  mode: "create" | "edit";
  state: ArticleEditorState;
  isDirty: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  isUnpublishing: boolean;
  lastSavedAt: Date | null;
  onSave: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
}

export function ArticlePublishPanel({
  mode,
  state,
  isDirty,
  isSaving,
  isPublishing,
  isUnpublishing,
  lastSavedAt,
  onSave,
  onPublish,
  onUnpublish,
}: ArticlePublishPanelProps) {
  const isPublished = state.status === "published";
  const isBusy = isSaving || isPublishing || isUnpublishing;

  return (
    <SidebarCard title="Publish">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Status</span>
          <StaffBadge
            size="sm"
            color={isPublished ? "green" : "default"}
            icon={isPublished ? "badge-check" : "file-text"}
          >
            {isPublished ? "Published" : "Draft"}
          </StaffBadge>
        </div>

        <AutosaveIndicator
          lastSavedAt={lastSavedAt}
          isDirty={isDirty}
          isSubmitting={isBusy}
        />

        <div className="flex flex-col gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSave}
            disabled={isBusy || !isDirty}
            className="h-8 w-full gap-1.5 text-xs"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {mode === "create" ? "Create draft" : "Save draft"}
          </Button>

          {!isPublished ? (
            <Button
              type="button"
              size="sm"
              onClick={onPublish}
              disabled={isBusy || !state.title.trim() || !state.slug.trim()}
              className="h-8 w-full gap-1.5 text-xs"
            >
              {isPublishing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Globe2 className="h-3.5 w-3.5" />
              )}
              Publish
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onUnpublish}
              disabled={isBusy}
              className="h-8 w-full gap-1.5 border-amber-200 text-xs text-amber-600 hover:bg-amber-50"
            >
              {isUnpublishing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <EyeOff className="h-3.5 w-3.5" />
              )}
              Unpublish
            </Button>
          )}
        </div>

        {!state.title.trim() || !state.slug.trim() ? (
          <p className="text-[10px] text-muted-foreground">
            Title and slug are required to publish.
          </p>
        ) : null}
      </div>
    </SidebarCard>
  );
}
