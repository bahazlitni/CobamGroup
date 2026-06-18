"use client";

import { useMemo, useState } from "react";
import { GripVertical, Plus } from "lucide-react";
import ArticleCTABannerRenderer from "@/components/public/articles/article-cta-banner-renderer";
import MediaImageField from "@/components/staff/media/importers/media-image-field";
import PanelField from "@/components/staff/ui/PanelField";
import PanelInput from "@/components/staff/ui/PanelInput";
import StaffSelect from "@/components/staff/ui/PanelSelect";
import AnchorPicker from "@/components/ui/custom/AnchorPicker";
import AnimatedIconPicker from "@/components/ui/custom/AnimatedIconPicker";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ARTICLE_CTA_BANNER_ASPECT_RATIOS,
  getArticleCtaBannerAspectRatioCss,
} from "@/features/articles/cta-banners";
import { MEDIA_FOLDER_SCOPE_IDS, MEDIA_FOLDER_SCOPE_LABELS } from "@/features/media/folder-scopes";
import type {
  ArticleEditorCTABanner,
  ArticleEditorCTABannerButton,
} from "@/features/articles/hooks/use-article-editor";
import type {
  ArticleCTABannerAnchor,
  ArticleCTABannerHorizontalAspectRatio,
} from "@/features/articles/types";
import { cn } from "@/lib/utils";
import ArticleEditorCardHeader from "./article-editor-card-header";

type ArticleCTABannersEditorProps = {
  value: ArticleEditorCTABanner[];
  onChange: (value: ArticleEditorCTABanner[]) => void;
  disabled?: boolean;
};

const ASPECT_RATIO_OPTIONS = ARTICLE_CTA_BANNER_ASPECT_RATIOS.map((ratio) => ({
  value: ratio.value,
  label: ratio.label,
}));

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
    anchor: "CENTER_CENTER" as ArticleCTABannerAnchor,
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
    anchor: banner.anchor,
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
  const [draggedButton, setDraggedButton] = useState<{
    bannerRowId: string;
    buttonRowId: string;
  } | null>(null);
  const [dragOverButtonRowId, setDragOverButtonRowId] = useState<string | null>(null);
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

  const reorderButton = (bannerRowId: string, fromButtonRowId: string, toButtonRowId: string) => {
    if (fromButtonRowId === toButtonRowId) {
      return;
    }

    updateBanner(bannerRowId, (banner) => {
      const fromIndex = banner.buttons.findIndex((button) => button.rowId === fromButtonRowId);
      const toIndex = banner.buttons.findIndex((button) => button.rowId === toButtonRowId);

      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
        return banner;
      }

      const nextButtons = [...banner.buttons];
      const [moved] = nextButtons.splice(fromIndex, 1);
      nextButtons.splice(toIndex, 0, moved);

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

  const addCTABanner = () => onChange([...value, createDefaultBanner(value.length)]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">Bannières CTA</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Elles seront affichées dans le contenu de l&apos;article.
          </p>
        </div>
        <AnimatedUIButton
          type="button"
          variant="outline"
          icon="plus"
          iconPosition="left"
          onClick={addCTABanner}
          disabled={disabled}
        >
          Ajouter une bannière
        </AnimatedUIButton>
      </div>
      {sortedBanners.length === 0 ? (
        <button
          type="button"
          onClick={addCTABanner}
          disabled={disabled}
          className="flex min-h-32 w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm font-medium text-slate-500 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="mr-2 size-4" />
          Ajouter la première bannière
        </button>
      ) : (
        <div className="space-y-5">
          {sortedBanners.map((banner, index) => {
            const isPreview = previewRows.has(banner.rowId);

            return (
              <section
                key={banner.rowId}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <ArticleEditorCardHeader
                  value={banner.title}
                  onChange={(title) =>
                    updateBanner(banner.rowId, (current) => ({
                      ...current,
                      title,
                    }))
                  }
                  placeholder="Titre de la bannière"
                  disabled={disabled}
                  dragHandleLabel={`Bannière CTA ${index + 1}`}
                  actions={[
                    {
                      key: "duplicate",
                      label: "Dupliquer",
                      icon: "copy",
                      onClick: () => duplicateBanner(banner),
                      disabled,
                    },
                    {
                      key: "preview",
                      label: isPreview ? "Éditer" : "Aperçu",
                      icon: isPreview ? "modify" : "eye",
                      variant: isPreview ? "primary" : "outline",
                      onClick: () => togglePreview(banner.rowId),
                    },
                    {
                      key: "remove",
                      label: "Retirer",
                      icon: "trash",
                      tone: "danger",
                      onClick: () => removeBanner(banner.rowId),
                      disabled,
                    },
                  ]}
                />

                <div className="p-4 sm:p-5">
                  {isPreview ? (
                    <ArticleCTABannerRenderer banner={toPreviewBanner(banner, index)} />
                  ) : (
                    <div className="grid gap-5">
                      <div className="grid gap-5">
                        <div className="grid gap-4">
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
                          folderId={MEDIA_FOLDER_SCOPE_IDS.ARTICLES}
                          folderLabel={MEDIA_FOLDER_SCOPE_LABELS[MEDIA_FOLDER_SCOPE_IDS.ARTICLES]}
                          onChange={(mediaId) =>
                            updateBanner(banner.rowId, (current) => ({
                              ...current,
                              imageId: mediaId != null ? String(mediaId) : "",
                            }))
                          }
                          aspectRatio={getArticleCtaBannerAspectRatioCss(
                            banner.horizontalAspectRatio,
                          )}
                          warnOnAspectRatioMismatch
                          aspectMismatchMessage="Cette image ne correspond pas au format sélectionné. Elle pourra être recadrée dans la bannière."
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
                          <StaffSelect
                            id={`cta-ratio-${banner.rowId}`}
                            value={banner.horizontalAspectRatio}
                            onValueChange={(nextValue) =>
                              updateBanner(banner.rowId, (current) => ({
                                ...current,
                                horizontalAspectRatio:
                                  nextValue as ArticleCTABannerHorizontalAspectRatio,
                              }))
                            }
                            options={ASPECT_RATIO_OPTIONS}
                            placeholder="Choisir un format"
                            disabled={disabled}
                            fullWidth
                            triggerClassName="!h-11 rounded-xl text-sm font-medium text-cobam-dark-blue"
                          />
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

                      <PanelField id={`cta-anchor-${banner.rowId}`} label="Ancrage du contenu">
                        <AnchorPicker
                          value={banner.anchor}
                          onValueChange={(nextAnchor) =>
                            updateBanner(banner.rowId, (current) => ({
                              ...current,
                              anchor: nextAnchor,
                            }))
                          }
                          aspectRatio={getArticleCtaBannerAspectRatioCss(
                            banner.horizontalAspectRatio,
                          )}
                          disabled={disabled}
                          className="w-full"
                        />
                      </PanelField>

                      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-cobam-dark-blue text-sm font-semibold">Boutons</p>
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
                                onDragOver={(event) => {
                                  if (disabled || draggedButton?.bannerRowId !== banner.rowId) {
                                    return;
                                  }

                                  event.preventDefault();
                                  setDragOverButtonRowId(button.rowId);
                                }}
                                onDrop={(event) => {
                                  event.preventDefault();

                                  if (disabled || draggedButton?.bannerRowId !== banner.rowId) {
                                    return;
                                  }

                                  reorderButton(
                                    banner.rowId,
                                    draggedButton.buttonRowId,
                                    button.rowId,
                                  );
                                  setDraggedButton(null);
                                  setDragOverButtonRowId(null);
                                }}
                                className={cn(
                                  "grid gap-3 rounded-xl border border-slate-200 bg-white p-3 transition",
                                  "xl:grid-cols-[auto_minmax(0,1fr)_minmax(0,0.85fr)_minmax(0,1.2fr)_auto]",
                                  draggedButton?.buttonRowId === button.rowId &&
                                    "scale-[0.99] opacity-70",
                                  dragOverButtonRowId === button.rowId &&
                                    draggedButton?.buttonRowId !== button.rowId &&
                                    "border-cobam-water-blue ring-cobam-water-blue/15 ring-2",
                                )}
                              >
                                <button
                                  type="button"
                                  draggable={!disabled}
                                  onDragStart={(event) => {
                                    if (disabled) {
                                      return;
                                    }

                                    event.dataTransfer.effectAllowed = "move";
                                    setDraggedButton({
                                      bannerRowId: banner.rowId,
                                      buttonRowId: button.rowId,
                                    });
                                    setDragOverButtonRowId(button.rowId);
                                  }}
                                  onDragEnd={() => {
                                    setDraggedButton(null);
                                    setDragOverButtonRowId(null);
                                  }}
                                  disabled={disabled}
                                  className={cn(
                                    "flex h-10 min-w-28 items-center justify-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-500 transition",
                                    "hover:border-cobam-water-blue/30 hover:bg-cobam-water-blue/5 hover:text-cobam-water-blue",
                                    disabled &&
                                      "cursor-not-allowed opacity-60 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-500",
                                  )}
                                  aria-label={`Glisser le bouton ${buttonIndex + 1}`}
                                >
                                  <GripVertical className="h-4 w-4" />#{buttonIndex + 1}
                                </button>
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
                                <AnimatedIconPicker
                                  value={button.iconCode}
                                  onValueChange={(nextIcon) =>
                                    updateButton(banner.rowId, button.rowId, (current) => ({
                                      ...current,
                                      iconCode: nextIcon,
                                    }))
                                  }
                                  disabled={disabled}
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
                                <div className="flex items-center justify-end gap-2">
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
