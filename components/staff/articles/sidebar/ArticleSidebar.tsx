// components/staff/articles/sidebar/ArticleSidebar.tsx

"use client";

import { ArticleMetaPanel } from "./ArticleMetaPanel";
import { ArticleSeoPanel } from "./ArticleSeoPanel";
import { ArticlePublishPanel } from "./ArticlePublishPanel";
import type { ArticleEditorState } from "@/components/staff/articles/ArticleEditorShell";

interface ArticleSidebarProps {
  mode: "create" | "edit";
  state: ArticleEditorState;
  isDirty: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  isUnpublishing: boolean;
  lastSavedAt: Date | null;
  categories: { value: string; label: string }[];
  onField: <K extends keyof ArticleEditorState>(key: K, value: ArticleEditorState[K]) => void;
  onGenerateSlug: () => void;
  onSave: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
}

export function ArticleSidebar(props: ArticleSidebarProps) {
  return (
    <div className="space-y-4">
      <ArticlePublishPanel
        mode={props.mode}
        state={props.state}
        isDirty={props.isDirty}
        isSaving={props.isSaving}
        isPublishing={props.isPublishing}
        isUnpublishing={props.isUnpublishing}
        lastSavedAt={props.lastSavedAt}
        onSave={props.onSave}
        onPublish={props.onPublish}
        onUnpublish={props.onUnpublish}
      />
      <ArticleMetaPanel
        state={props.state}
        onField={props.onField}
        onGenerateSlug={props.onGenerateSlug}
        categories={props.categories}
      />
      <ArticleSeoPanel state={props.state} onField={props.onField} />
    </div>
  );
}