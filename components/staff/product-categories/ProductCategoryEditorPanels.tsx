"use client";

import type { ReactNode } from "react";
import MediaImageField from "@/components/staff/media/importers/media-image-field";
import ImagePreview from "@/components/staff/media/importers/ImagePreview";
import Panel from "@/components/staff/ui/Panel";
import PanelInput from "@/components/staff/ui/PanelInput";
import StaffField from "@/components/staff/ui/field";
import StaffSelect from "@/components/staff/ui/PanelSelect";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import { slugifyProductCategoryName } from "@/features/product-categories/slug";
import type { ProductCategoryEditorFormState } from "@/features/product-categories/form";
import type { ProductCategoryParentOptionDto } from "@/features/product-categories/types";

type EditableField = keyof ProductCategoryEditorFormState;

function buildExcerpt(value: string, maxLength = 140) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 1).trimEnd()}...`;
}

export default function ProductCategoryEditorPanels({
  form,
  parentOptions,
  isSaving,
  saveLabel,
  onFieldChange,
  onSave,
  summary,
  sidebarFooter,
  disableSave = false,
}: {
  form: ProductCategoryEditorFormState;
  parentOptions: ProductCategoryParentOptionDto[];
  isSaving: boolean;
  saveLabel: string;
  onFieldChange: (
    field: EditableField,
    value: ProductCategoryEditorFormState[EditableField],
  ) => void;
  onRegenerateSlug?: () => void;
  onSave: () => void;
  summary?: {
    childCount?: number;
    productModelCount?: number;
    createdAt?: string | null;
    updatedAt?: string | null;
  };
  sidebarFooter?: ReactNode;
  disableSave?: boolean;
}) {
  const selectedParent =
    parentOptions.find((item) => String(item.id) === form.parentId) ?? null;
  const previewSlug = form.slug.trim() || slugifyProductCategoryName(form.name);
  const hasImage = form.imageMediaId != null;
  const previewDescription =
    buildExcerpt(form.description) ?? buildExcerpt(form.descriptionSeo);

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <Panel
        pretitle="Edition"
        title="Informations de la categorie"
        description="La categorie produit unifie maintenant la structure catalogue, le contenu et les metadonnees du site."
      >
        <div className="grid gap-6">
          <div className="grid gap-6 md:grid-cols-2">
            <StaffField id="category-name" label="Nom">
              <PanelInput
                fullWidth
                id="category-name"
                value={form.name}
                onChange={(event) => {
                  onFieldChange("name", event.target.value)
                  onFieldChange("slug", slugifyProductCategoryName(event.target.value))
                }}
                placeholder="Ex. Robinetterie cuisine"
              />
            </StaffField>

            <StaffField
              id="category-subtitle"
              label="Sous-titre"
              hint="Visible dans les interfaces catalogue ou les blocs d'introduction."
            >
              <PanelInput
                fullWidth
                id="category-subtitle"
                value={form.subtitle}
                onChange={(event) =>
                  onFieldChange("subtitle", event.target.value)
                }
                placeholder="Ex. Mitigeurs, colonnes et accessoires"
              />
            </StaffField>
          </div>


          <div className="grid gap-6 md:grid-cols-2">
            <StaffField id="category-parent" label="Categorie parente">
              <StaffSelect
                fullWidth
                value={form.parentId}
                onValueChange={(value) => onFieldChange("parentId", value)}
                emptyLabel="Aucune (niveau racine)"
                options={parentOptions.map((option) => ({
                  value: String(option.id),
                  label: option.name,
                }))}
              />
            </StaffField>

            <StaffField id="category-status" label="Etat">
              <StaffSelect
                fullWidth
                value={String(form.isActive)}
                onValueChange={(value) =>
                  onFieldChange("isActive", value === "true")
                }
                options={[
                  { value: "true", label: "Active" },
                  { value: "false", label: "Inactive" },
                ]}
              />
            </StaffField>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <StaffField
              id="category-sort-order"
              label="Ordre d'affichage"
              hint="Les valeurs les plus basses remontent en premier dans l'arborescence."
            >
              <PanelInput
                id="category-sort-order"
                type="number"
                value={form.sortOrder}
                onChange={(event) =>
                  onFieldChange("sortOrder", event.target.value)
                }
                placeholder="0"
                inputMode="numeric"
              />
            </StaffField>
          </div>

          <MediaImageField
            label="Image principale"
            description="Selectionnez une image existante ou importez-en une nouvelle pour cette categorie produit."
            dialogTitle="Choisir l'image de categorie"
            dialogDescription="Parcourez les images de la mediatheque ou importez-en une nouvelle pour cette categorie."
            mediaId={form.imageMediaId}
            onChange={(value) => onFieldChange("imageMediaId", value)}
          />

          <StaffField
            id="category-description"
            label="Description"
            hint="Resume editorial ou commercial visible dans les fiches et pages categorie."
          >
            <Textarea
              id="category-description"
              value={form.description}
              onChange={(event) =>
                onFieldChange("description", event.target.value)
              }
              placeholder="Description principale de la categorie..."
              className="min-h-32 rounded-md border-slate-300 px-4 py-3 text-base"
            />
          </StaffField>

          <StaffField
            id="category-description-seo"
            label="Description SEO"
            hint="Texte court optimise pour les moteurs de recherche."
          >
            <Textarea
              id="category-description-seo"
              value={form.descriptionSeo}
              onChange={(event) =>
                onFieldChange("descriptionSeo", event.target.value)
              }
              placeholder="Resume SEO de la categorie..."
              className="min-h-24 rounded-md border-slate-300 px-4 py-3 text-base"
            />
          </StaffField>

          <div className="flex justify-end">
            <AnimatedUIButton
              type="button"
              onClick={() => onSave()}
              disabled={isSaving || disableSave}
              loading={isSaving}
              loadingText="Enregistrement..."
              variant="primary"
            >
              {saveLabel}
            </AnimatedUIButton>
          </div>
        </div>
      </Panel>

      <div className="flex flex-col gap-6">
        <Panel
          pretitle="Resume"
          title="Vue rapide"
          description="Controlez la structure, le contenu et la visibilite avant validation."
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Nom affiche
              </p>
              <p className="mt-1 text-lg font-semibold text-cobam-dark-blue">
                {form.name.trim() || "Nom de la categorie"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Slug
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {previewSlug || "slug-de-la-categorie"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Parent
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {selectedParent?.name || "Categorie racine"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Etat
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {form.isActive ? "Active" : "Inactive"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Ordre
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {form.sortOrder.trim() || "0"}
              </p>
            </div>

            {form.subtitle.trim() ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Sous-titre
                </p>
                <p className="mt-1 text-sm text-slate-600">{form.subtitle}</p>
              </div>
            ) : null}

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Media
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {hasImage ? "Image configuree" : "Aucune image"}
              </p>
              {hasImage ? (
                <div className="mt-3">
                  <ImagePreview
                    mediaId={form.imageMediaId}
                    alt="Image de la categorie"
                    className="h-24 w-24 rounded-2xl"
                  />
                </div>
              ) : null}
            </div>

            {previewDescription ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Aperçu editorial
                </p>
                <p className="mt-1 text-sm text-slate-600">{previewDescription}</p>
              </div>
            ) : null}

            {summary?.childCount != null ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Sous-categories
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {summary.childCount}
                </p>
              </div>
            ) : null}

            {summary?.productModelCount != null ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Modeles produits
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {summary.productModelCount}
                </p>
              </div>
            ) : null}

            {summary?.updatedAt ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Derniere mise a jour
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {new Date(summary.updatedAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            ) : null}

            {!summary?.updatedAt && summary?.createdAt ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Creee le
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {new Date(summary.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
            ) : null}
          </div>
        </Panel>

        {sidebarFooter}
      </div>
    </div>
  );
}
