"use client";

import { SidebarCard } from "@/components/staff/articles/SidebarCard";
import type { ArticleEditorState } from "@/components/staff/articles/ArticleEditorShell";
import MediaImageField from "@/components/staff/media/importers/media-image-field";
import StaffSelect from "@/components/staff/ui/PanelSelect";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MEDIA_FOLDER_SCOPE_IDS, MEDIA_FOLDER_SCOPE_LABELS } from "@/features/media/folder-scopes";
import { cn } from "@/lib/utils";

interface ArticleSeoPanelProps {
  state: ArticleEditorState;
  onField: <K extends keyof ArticleEditorState>(key: K, value: ArticleEditorState[K]) => void;
}

const SCHEMA_OPTIONS = [
  { value: "Article", label: "Article" },
  { value: "NewsArticle", label: "News Article" },
  { value: "BlogPosting", label: "Blog Posting" },
  { value: "TechArticle", label: "Tech Article" },
];

function SeoScore({ state }: { state: ArticleEditorState }) {
  const checks = [
    { label: "Title present", pass: state.title.trim().length > 0 },
    { label: "Title 40-60 chars", pass: state.title.length >= 40 && state.title.length <= 60 },
    { label: "Slug set", pass: state.slug.trim().length > 0 },
    { label: "Excerpt present", pass: state.excerpt.trim().length > 0 },
    { label: "SEO description", pass: state.descriptionSeo.trim().length > 0 },
    { label: "Cover image set", pass: Boolean(state.coverMediaId) },
    { label: "Focus keyword set", pass: state.focusKeyword.trim().length > 0 },
  ];
  const passed = checks.filter((check) => check.pass).length;
  const pct = Math.round((passed / checks.length) * 100);

  return (
    <div className="mb-3">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">SEO Score</span>
        <span
          className={cn(
            "font-bold",
            pct >= 80 ? "text-green-600" : pct >= 50 ? "text-yellow-600" : "text-red-500",
          )}
        >
          {pct}%
        </span>
      </div>
      <div className="bg-muted h-1.5 w-full rounded-full">
        <div
          className={cn(
            "h-1.5 rounded-full transition-all",
            pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-yellow-500" : "bg-red-500",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function ArticleSeoPanel({ state, onField }: ArticleSeoPanelProps) {
  return (
    <SidebarCard title="SEO">
      <SeoScore state={state} />

      <div className="space-y-3">
        <div>
          <Label className="text-xs">Focus Keyword</Label>
          <Input
            value={state.focusKeyword}
            onChange={(event) => onField("focusKeyword", event.target.value)}
            placeholder="main keyword..."
            className="mt-1 h-8 text-sm"
          />
        </div>

        <div>
          <Label className="text-xs">
            Meta Description
            <span className="text-muted-foreground ml-1">({state.descriptionSeo.length}/160)</span>
          </Label>
          <textarea
            value={state.descriptionSeo}
            onChange={(event) => onField("descriptionSeo", event.target.value)}
            placeholder="Meta description for search engines..."
            rows={3}
            maxLength={160}
            className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring mt-1 w-full resize-none rounded-md border px-3 py-2 text-sm focus-visible:ring-1 focus-visible:outline-none"
          />
        </div>

        <div className="bg-muted/30 rounded-md border p-2.5">
          <p className="text-muted-foreground mb-1.5 text-[10px] font-semibold tracking-wide uppercase">
            Google Preview
          </p>
          <p className="truncate text-sm leading-snug font-medium text-blue-600">
            {state.ogTitle || state.title || "Article Title"}
          </p>
          <p className="truncate text-[11px] text-green-700">
            yourdomain.com/articles/{state.slug || "article-slug"}
          </p>
          <p className="text-muted-foreground mt-0.5 line-clamp-2 text-[11px] leading-relaxed">
            {state.descriptionSeo || "No meta description - add one for better CTR."}
          </p>
        </div>

        <div className="space-y-3 rounded-md border border-slate-300 p-3">
          <p className="text-xs font-semibold text-slate-600">Open Graph</p>

          <div>
            <Label className="text-xs">OG Title</Label>
            <Input
              value={state.ogTitle}
              onChange={(event) => onField("ogTitle", event.target.value)}
              placeholder={state.title || "OG title..."}
              className="mt-1 h-8 text-sm"
            />
          </div>

          <div>
            <Label className="text-xs">OG Description</Label>
            <textarea
              value={state.ogDescription}
              onChange={(event) => onField("ogDescription", event.target.value)}
              placeholder="OG description..."
              rows={2}
              className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring mt-1 w-full resize-none rounded-md border px-3 py-2 text-sm focus-visible:ring-1 focus-visible:outline-none"
            />
          </div>

          <div>
            <Label className="text-xs">OG Image</Label>
            <div className="mt-1">
              <MediaImageField
                label="OG image"
                mediaId={state.ogImageMediaId ? Number(state.ogImageMediaId) : null}
                folderId={MEDIA_FOLDER_SCOPE_IDS.ARTICLES}
                folderLabel={MEDIA_FOLDER_SCOPE_LABELS[MEDIA_FOLDER_SCOPE_IDS.ARTICLES]}
                onChange={(id) => onField("ogImageMediaId", id ? String(id) : "")}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-md border border-slate-300 p-3">
          <p className="text-xs font-semibold text-slate-600">Advanced</p>

          <div>
            <Label className="text-xs">Schema Type</Label>
            <div className="mt-1">
              <StaffSelect
                value={state.schemaType}
                onValueChange={(value) => onField("schemaType", value)}
                options={SCHEMA_OPTIONS}
                fullWidth
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={state.noIndex}
              onChange={(event) => onField("noIndex", event.target.checked)}
              className="rounded"
            />
            <span className="text-xs">No Index</span>
          </label>

          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={state.noFollow}
              onChange={(event) => onField("noFollow", event.target.checked)}
              className="rounded"
            />
            <span className="text-xs">No Follow</span>
          </label>
        </div>
      </div>
    </SidebarCard>
  );
}
