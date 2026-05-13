"use client";

import { Wand2 } from "lucide-react";
import type { ArticleEditorState } from "@/components/staff/articles/ArticleEditorShell";
import { SidebarCard } from "@/components/staff/articles/SidebarCard";
import MediaImageField from "@/components/staff/media/importers/media-image-field";
import StaffSelect from "@/components/staff/ui/PanelSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ArticleMetaPanelProps {
  state: ArticleEditorState;
  onField: <K extends keyof ArticleEditorState>(
    key: K,
    value: ArticleEditorState[K],
  ) => void;
  onGenerateSlug: () => void;
  categories: { value: string; label: string }[];
}

export function ArticleMetaPanel({
  state,
  onField,
  onGenerateSlug,
  categories,
}: ArticleMetaPanelProps) {
  const publicUrl = state.slug
    ? `https://www.yourdomain.com/articles/${state.slug}`
    : "https://www.yourdomain.com/articles/...";

  return (
    <SidebarCard title="Article Settings">
      <div className="space-y-4">
        <div>
          <Label className="text-xs">Internal Title *</Label>
          <Input
            value={state.title}
            onChange={(event) => onField("title", event.target.value)}
            onBlur={() => {
              if (!state.slug && state.title) {
                onGenerateSlug();
              }
              if (!state.displayTitle) {
                onField("displayTitle", state.title);
              }
              if (!state.ogTitle) {
                onField("ogTitle", state.title);
              }
            }}
            placeholder="Article title..."
            className="mt-1 h-8 text-sm"
          />
        </div>

        <div>
          <Label className="text-xs">Display Title</Label>
          <Input
            value={state.displayTitle}
            onChange={(event) => onField("displayTitle", event.target.value)}
            placeholder="Same as title if empty"
            className="mt-1 h-8 text-sm"
          />
        </div>

        <div>
          <Label className="text-xs">Slug *</Label>
          <div className="mt-1 flex gap-1.5">
            <Input
              value={state.slug}
              onChange={(event) => onField("slug", event.target.value)}
              placeholder="article-slug"
              className="h-8 text-sm font-mono"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onGenerateSlug}
              className="h-8 shrink-0 px-2"
              title="Generate from title"
            >
              <Wand2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          <p className="mt-1 truncate text-[10px] text-muted-foreground">
            {publicUrl}
          </p>
        </div>

        <div>
          <Label className="text-xs">Category</Label>
          <div className="mt-1">
            <StaffSelect
              value={state.categoryId}
              onValueChange={(value) => onField("categoryId", value)}
              options={categories}
              placeholder="Select category..."
              fullWidth
            />
          </div>
        </div>

        <div>
          <Label className="text-xs">Cover Image</Label>
          <div className="mt-1">
            <MediaImageField
              label="Cover image"
              mediaId={state.coverMediaId ? Number(state.coverMediaId) : null}
              onChange={(id) => onField("coverMediaId", id ? String(id) : "")}
            />
          </div>
        </div>

        <div>
          <Label className="text-xs">Excerpt</Label>
          <textarea
            value={state.excerpt}
            onChange={(event) => onField("excerpt", event.target.value)}
            placeholder="Short summary for listings..."
            rows={3}
            className="mt-1 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <p className="text-right text-[10px] text-muted-foreground">
            {state.excerpt.length}/300
          </p>
        </div>
      </div>
    </SidebarCard>
  );
}
