"use client";

import { useMemo, useState } from "react";
import { Copy, GripVertical, Trash2 } from "lucide-react";
import ArticleCTABannerRenderer from "@/components/public/articles/article-cta-banner-renderer";
import MediaImageField from "@/components/staff/media/importers/media-image-field";
import PanelField from "@/components/staff/ui/PanelField";
import PanelInput from "@/components/staff/ui/PanelInput";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ARTICLE_CTA_BANNER_ASPECT_RATIOS,
} from "@/features/articles/cta-banners";
import type {
  ArticleEditorCTABanner,
  ArticleEditorCTABannerButton,
} from "@/features/articles/hooks/use-article-editor";
import type { ArticleCTABannerHorizontalAspectRatio } from "@/features/articles/types";
import { cn } from "@/lib/utils";

type ArticleCTABannersEditorProps = {
  value: ArticleEditorCTABanner[];
  onChange: (value: ArticleEditorCTABanner[]) => void;
  disabled?: boolean;
};

function createRowId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createDefaultButton(sortOrder: number): ArticleEditorCTABannerButton {
  return {
    rowId: createRowId("article-cta-button"),
    id: null,
    text: sortOrder === 0 ? "Découvrir" : "",
    iconCode: sortOrder === 0 ? "arrow-right" : "external-link",
    sortOrder,
    href: "",
  };
}

function createDefaultBanner(index: number): ArticleEditorCTABanner {
  return {
    rowId: createRowId("article-cta-banner"),
    id: null,
    title: `Bannière CTA ${index + 1}`,
    description: "",
    imageId: "",
    backgroundColor: "#14202e",
    horizontalAspectRatio: "RATIO_21_10" as ArticleCTABannerHorizontalAspectRatio,
    approxPositionPercentage: 50,
    href: "",
    buttons: [createDefaultButton(0)],
  };
}

function toPreviewBanner(banner: ArticleEditorCTABanner, index: number) {
  const numericImageId = banner.imageId.trim() ? Number(banner.imageId) : null;

  return {
    id: banner.id ?? -(index + 1),
    title: banner.title.trim() || "Bannière CTA",
    description: banner.description.trim() || null,
    imageId: numericImageId,
    imageUrl: numericImageId != null ? `/api/staff/medias/${numericImageId}/file` : null,
    imageThumbnailUrl:
      numericImageId != null ? `/api/staff/medias/${numericImageId}/file?variant=thumbnail` : null,
    imageAlt: banner.title.trim() || "Bannière CTA",
    imageWidth: null,
    imageHeight: null,
    backgroundColor: banner.backgroundColor || "#14202e",
    horizontalAspectRatio: banner.horizontalAspectRatio,
    approxPositionPercentage: banner.approxPositionPercentage,
    href: banner.href.trim() || null,
    buttons: banner.buttons.map((button, buttonIndex) => ({
      id: button.id ?? -(index + 1) * 10 - buttonIndex,
      text: button.text.trim() || null,
      iconCode: button.iconCode.trim() || null,
      sortOrder: buttonIndex,
      href: button.href.trim() || null,
    })),
  };
}

function sortBannersForDisplay(banners: readonly ArticleEditorCTABanner[]) {
  return [...banners].sort((left, right) => {
    const positionDelta = left.approxPositionPercentage - right.approxPositionPercentage;

    if (positionDelta !== 0) {
      return positionDelta;
    }

    return left.title.localeCompare(right.title, "fr", { sensitivity: "base" });
  });
}

export default function ArticleCTABannersEditor({
  value,
  onChange,
  disabled = false,
}: ArticleCTABannersEditorProps) {
  const [previewRows, setPreviewRows] = useState<Set<string>>(() => new Set());
  const sortedBanners = useMemo(() => sortBannersForDisplay(value), [value]);

  const updateBanner = (
    rowId: string,
    updater: (banner: ArticleEditorCTABanner) => ArticleEditorCTABanner,
  ) => {
    onChange(value.map((banner) => (banner.rowId === rowId ? updater(banner) : banner)));
  };

  const removeBanner = (rowId: string) => {
    onChange(value.filter((banner) => banner.rowId !== rowId));
    setPreviewRows((current) => {
      const next = new Set(current);
      next.delete(rowId);
      return next;
    });
  };

  const duplicateBanner = (banner: ArticleEditorCTABanner) => {
    onChange([
      ...value,
      {
        ...banner,
        rowId: createRowId("article-cta-banner"),
        id: null,
        title: `${banner.title || "Bannière CTA"} copie`,
        buttons: banner.buttons.map((button, index) => ({
          ...button,
          rowId: createRowId("article-cta-button"),
          id: null,
          sortOrder: index,
        })),
      },
    ]);
  };

  const addButton = (rowId: string) => {
    updateBanner(rowId, (banner) => {
      if (banner.buttons.length >= 2) {
        return banner;
      }

      return {
        ...banner,
        buttons: [...banner.buttons, createDefaultButton(banner.buttons.length)],
      };
    });
  };

  const updateButton = (
    bannerRowId: string,
    buttonRowId: string,
    updater: (button: ArticleEditorCTABannerButton) => ArticleEditorCTABannerButton,
  ) => {
    updateBanner(bannerRowId, (banner) => ({
      ...banner,
      buttons: banner.buttons.map((button) =>
        button.rowId === buttonRowId ? updater(button) : button,
      ),
    }));
  };

  const removeButton = (bannerRowId: string, buttonRowId: string) => {
    updateBanner(bannerRowId, (banner) => ({
      ...banner,
      buttons: banner.buttons
        .filter((button) => button.rowId !== buttonRowId)
        .map((button, index) => ({ ...button, sortOrder: index })),
    }));
  };

  const moveButton = (bannerRowId: string, buttonRowId: string, direction: -1 | 1) => {
    updateBanner(bannerRowId, (banner) => {
      const index = banner.buttons.findIndex((button) => button.rowId === buttonRowId);
      const nextIndex = index + direction;

      if (index < 0 || nextIndex < 0 || nextIndex >= banner.buttons.length) {
        return banner;
      }

      const nextButtons = [...banner.buttons];
      const [moved] = nextButtons.splice(index, 1);
      nextButtons.splice(nextIndex, 0, moved);

      return {
        ...banner,
        buttons: nextButtons.map((button, buttonIndex) => ({
          ...button,
          sortOrder: buttonIndex,
        })),
      };
    });
  };

  const togglePreview = (rowId: string) => {
    setPreviewRows((current) => {
      const next = new Set(current);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-cobam-dark-blue">Bannières CTA</p>
          <p className="text-sm leading-6 text-slate-500">
            Elles seront insérées entre les blocs de contenu selon leur position.
          </p>
        </div>

        <AnimatedUIButton
          type="button"
          variant="primary"
          icon="plus"
          iconPosition="left"
          onClick={() => onChange([...value, createDefaultBanner(value.length)])}
          disabled={disabled}
        >
          Ajouter
        </AnimatedUIButton>
      </div>

      {sortedBanners.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/75 p-5 text-sm leading-6 text-slate-500">
          Aucune bannière CTA pour le moment.
        </div>
      ) : (
        <div className="space-y-5">
          {sortedBanners.map((banner, index) => {
            const isPreview = previewRows.has(banner.rowId);

            return (
              <section
                key={banner.rowId}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/75 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <GripVertical className="h-5 w-5 shrink-0 text-slate-300" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-cobam-dark-blue">
                        {banner.title || "Bannière CTA"}
                      </p>
                      <p className="text-xs text-slate-500">
                        Position {Math.round(banner.approxPositionPercentage)}%
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <AnimatedUIButton
                      type="button"
                      variant={isPreview ? "primary" : "outline"}
                      size="sm"
                      icon={isPreview ? "modify" : "eye"}
                      iconPosition="left"
                      onClick={() => togglePreview(banner.rowId)}
                    >
                      {isPreview ? "Éditer" : "Aperçu"}
                    </AnimatedUIButton>
                    <AnimatedUIButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => duplicateBanner(banner)}
                      disabled={disabled}
                    >
                      <span className="inline-flex items-center gap-2">
                        <Copy className="h-4 w-4" />
                        Dupliquer
                      </span>
                    </AnimatedUIButton>
                    <AnimatedUIButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBanner(banner.rowId)}
                      disabled={disabled}
                    >
                      <span className="inline-flex items-center gap-2 text-red-600">
                        <Trash2 className="h-4 w-4" />
                        Retirer
                      </span>
                    </AnimatedUIButton>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  {isPreview ? (
                    <ArticleCTABannerRenderer banner={toPreviewBanner(banner, index)} />
                  ) : (
                    <div className="grid gap-5">
                      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
                        <div className="grid gap-4">
                          <PanelField id={`cta-title-${banner.rowId}`} label="Titre">
                            <PanelInput
                              id={`cta-title-${banner.rowId}`}
                              value={banner.title}
                              onChange={(event) =>
                                updateBanner(banner.rowId, (current) => ({
                                  ...current,
                                  title: event.target.value,
                                }))
                              }
                              disabled={disabled}
                              fullWidth
                            />
                          </PanelField>

                          <PanelField id={`cta-description-${banner.rowId}`} label="Description">
                            <Textarea
                              id={`cta-description-${banner.rowId}`}
                              value={banner.description}
                              onChange={(event) =>
                                updateBanner(banner.rowId, (current) => ({
                                  ...current,
                                  description: event.target.value,
                                }))
                              }
                              rows={3}
                              disabled={disabled}
                              className="min-h-28 rounded-xl border-slate-300"
                            />
                          </PanelField>

                          <PanelField id={`cta-href-${banner.rowId}`} label="Lien de secours">
                            <PanelInput
                              id={`cta-href-${banner.rowId}`}
                              value={banner.href}
                              onChange={(event) =>
                                updateBanner(banner.rowId, (current) => ({
                                  ...current,
                                  href: event.target.value,
                                }))
                              }
                              placeholder="/contact"
                              disabled={disabled}
                              fullWidth
                            />
                          </PanelField>
                        </div>

                        <MediaImageField
                          label="Image de bannière"
                          description="Image utilisée en arrière-plan de la bannière CTA."
                          dialogTitle="Choisir l'image de bannière"
                          dialogDescription="Sélectionnez une image depuis la médiathèque ou importez-en une nouvelle."
                          mediaId={banner.imageId ? Number(banner.imageId) : null}
                          onChange={(mediaId) =>
                            updateBanner(banner.rowId, (current) => ({
                              ...current,
                              imageId: mediaId != null ? String(mediaId) : "",
                            }))
                          }
                          aspectRatio="21:10"
                          disabled={disabled}
                          previewClassName="w-full rounded-2xl"
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <PanelField id={`cta-position-${banner.rowId}`} label="Position">
                          <div className="grid gap-2">
                            <Input
                              id={`cta-position-${banner.rowId}`}
                              type="range"
                              min={0}
                              max={100}
                              step={1}
                              value={banner.approxPositionPercentage}
                              onChange={(event) =>
                                updateBanner(banner.rowId, (current) => ({
                                  ...current,
                                  approxPositionPercentage: Number(event.target.value),
                                }))
                              }
                              disabled={disabled}
                            />
                            <span className="text-sm font-semibold text-slate-500">
                              {Math.round(banner.approxPositionPercentage)}%
                            </span>
                          </div>
                        </PanelField>

                        <PanelField id={`cta-ratio-${banner.rowId}`} label="Format">
                          <select
                            id={`cta-ratio-${banner.rowId}`}
                            value={banner.horizontalAspectRatio}
                            onChange={(event) =>
                              updateBanner(banner.rowId, (current) => ({
                                ...current,
                                horizontalAspectRatio: event.target
                                  .value as ArticleCTABannerHorizontalAspectRatio,
                              }))
                            }
                            disabled={disabled}
                            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-cobam-dark-blue"
                          >
                            {ARTICLE_CTA_BANNER_ASPECT_RATIOS.map((ratio) => (
                              <option key={ratio.value} value={ratio.value}>
                                {ratio.label}
                              </option>
                            ))}
                          </select>
                        </PanelField>

                        <PanelField id={`cta-bg-${banner.rowId}`} label="Couleur">
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={banner.backgroundColor}
                              onChange={(event) =>
                                updateBanner(banner.rowId, (current) => ({
                                  ...current,
                                  backgroundColor: event.target.value,
                                }))
                              }
                              disabled={disabled}
                              className="h-11 w-14 shrink-0 rounded-xl border-slate-300 p-1"
                            />
                            <PanelInput
                              id={`cta-bg-${banner.rowId}`}
                              value={banner.backgroundColor}
                              onChange={(event) =>
                                updateBanner(banner.rowId, (current) => ({
                                  ...current,
                                  backgroundColor: event.target.value,
                                }))
                              }
                              disabled={disabled}
                              fullWidth
                            />
                          </div>
                        </PanelField>
                      </div>

                      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-cobam-dark-blue">Boutons</p>
                            <p className="text-xs text-slate-500">
                              Le premier bouton est principal, le second est secondaire.
                            </p>
                          </div>
                          <AnimatedUIButton
                            type="button"
                            variant="outline"
                            size="sm"
                            icon="plus"
                            iconPosition="left"
                            onClick={() => addButton(banner.rowId)}
                            disabled={disabled || banner.buttons.length >= 2}
                          >
                            Ajouter
                          </AnimatedUIButton>
                        </div>

                        {banner.buttons.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500">
                            Aucun bouton configuré.
                          </div>
                        ) : (
                          <div className="grid gap-3">
                            {banner.buttons.map((button, buttonIndex) => (
                              <div
                                key={button.rowId}
                                className={cn(
                                  "grid gap-3 rounded-xl border border-slate-200 bg-white p-3",
                                  "lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1.2fr)_auto]",
                                )}
                              >
                                <PanelInput
                                  value={button.text}
                                  onChange={(event) =>
                                    updateButton(banner.rowId, button.rowId, (current) => ({
                                      ...current,
                                      text: event.target.value,
                                    }))
                                  }
                                  placeholder="Texte"
                                  disabled={disabled}
                                  fullWidth
                                />
                                <PanelInput
                                  value={button.iconCode}
                                  onChange={(event) =>
                                    updateButton(banner.rowId, button.rowId, (current) => ({
                                      ...current,
                                      iconCode: event.target.value,
                                    }))
                                  }
                                  placeholder="arrow-right"
                                  disabled={disabled}
                                  fullWidth
                                />
                                <PanelInput
                                  value={button.href}
                                  onChange={(event) =>
                                    updateButton(banner.rowId, button.rowId, (current) => ({
                                      ...current,
                                      href: event.target.value,
                                    }))
                                  }
                                  placeholder="/contact"
                                  disabled={disabled}
                                  fullWidth
                                />
                                <div className="flex items-center gap-2">
                                  <AnimatedUIButton
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    icon="arrow-up"
                                    onClick={() => moveButton(banner.rowId, button.rowId, -1)}
                                    disabled={disabled || buttonIndex === 0}
                                  />
                                  <AnimatedUIButton
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    icon="arrow-down"
                                    onClick={() => moveButton(banner.rowId, button.rowId, 1)}
                                    disabled={disabled || buttonIndex === banner.buttons.length - 1}
                                  />
                                  <AnimatedUIButton
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    icon="trash"
                                    onClick={() => removeButton(banner.rowId, button.rowId)}
                                    disabled={disabled}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
