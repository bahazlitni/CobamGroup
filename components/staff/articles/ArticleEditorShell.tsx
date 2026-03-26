"use client";

import { useRef } from "react";
import { BlockCanvas } from "./block-editor/BlockCanvas";
import { ArticleSidebar } from "./sidebar/ArticleSidebar";
import {
  deserializeBlocksFromHTML,
  serializeBlocksToHTML,
} from "./block-editor/block-types";
import type { Block } from "./block-editor/block-types";
import { cn } from "@/lib/utils";

export type { ArticleEditorState } from "@/features/articles/hooks/use-article-editor";
import type { ArticleEditorState } from "@/features/articles/hooks/use-article-editor";

interface ArticleEditorShellProps {
  mode: "create" | "edit";
  state: ArticleEditorState;
  isDirty: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  isUnpublishing: boolean;
  lastSavedAt: Date | null;
  error: string | null;
  notice: string | null;
  categories: { value: string; label: string }[];
  onField: <K extends keyof ArticleEditorState>(key: K, value: ArticleEditorState[K]) => void;
  onGenerateSlug: () => void;
  onSave: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
}

export function ArticleEditorShell({
  mode,
  state,
  isDirty,
  isSaving,
  isPublishing,
  isUnpublishing,
  lastSavedAt,
  error,
  notice,
  categories,
  onField,
  onGenerateSlug,
  onSave,
  onPublish,
  onUnpublish,
}: ArticleEditorShellProps) {
  // Parse blocks from content string
  const initialBlocks = useRef<Block[]>(
    deserializeBlocksFromHTML(state.content)
  );

  const handleBlocksChange = (blocks: Block[]) => {
    onField("content", serializeBlocksToHTML(blocks));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Notices */}
      {(error || notice) && (
        <div
          className={cn(
            "px-4 py-2 text-sm rounded-md mb-4",
            error
              ? "bg-destructive/10 text-destructive border border-destructive/20"
              : "bg-green-500/10 text-green-700 border border-green-500/20"
          )}
        >
          {error ?? notice}
        </div>
      )}

      {/* Main layout */}
      <div className="flex gap-6 items-start">
        {/* Canvas */}
        <div className="flex-1 min-w-0">
          <div className="rounded-lg border bg-card shadow-sm min-h-[600px]">
            {/* Editor top bar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b bg-muted/30">
              <div className="h-2 w-2 rounded-full bg-red-400" />
              <div className="h-2 w-2 rounded-full bg-yellow-400" />
              <div className="h-2 w-2 rounded-full bg-green-400" />
              <span className="text-xs text-muted-foreground ml-2">
                {mode === "create" ? "New Article" : `Editing: ${state.title || "Untitled"}`}
              </span>
            </div>

            {/* Block canvas area */}
            <div className="px-8 py-6 max-w-3xl mx-auto">
              <BlockCanvas
                blocks={initialBlocks.current}
                onChange={handleBlocksChange}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-72 shrink-0 sticky top-4">
          <ArticleSidebar
            mode={mode}
            state={state}
            isDirty={isDirty}
            isSaving={isSaving}
            isPublishing={isPublishing}
            isUnpublishing={isUnpublishing}
            lastSavedAt={lastSavedAt}
            categories={categories}
            onField={onField}
            onGenerateSlug={onGenerateSlug}
            onSave={onSave}
            onPublish={onPublish}
            onUnpublish={onUnpublish}
          />
        </aside>
      </div>
    </div>
  );
}
