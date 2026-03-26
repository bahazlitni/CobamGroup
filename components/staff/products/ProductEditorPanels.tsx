"use client";

import type { ReactNode } from "react";
import Panel from "@/components/staff/ui/Panel";
import PanelInput from "@/components/staff/ui/PanelInput";
import StaffField from "@/components/staff/ui/field";
import StaffSelect from "@/components/staff/ui/PanelSelect";
import StaffTagInput from "@/components/staff/ui/tag-input";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import { slugifyProductName } from "@/features/products/slug";
import type { ProductEditorFormState } from "@/features/products/form";
import type { ProductFormOptionsDto } from "@/features/products/types";

type EditableField = keyof ProductEditorFormState;

export default function ProductEditorPanels({
  form,
  options,
  isSaving,
  saveLabel,
  onFieldChange,
  onSave,
  summary,
  sidebarFooter,
  disableSave = false,
}: {
  form: ProductEditorFormState;
  options: ProductFormOptionsDto;
  isSaving: boolean;
  saveLabel: string;
  onFieldChange: (
    field: EditableField,
    value: ProductEditorFormState[EditableField],
  ) => void;
  onSave: () => void;
  summary?: {
    variantCount?: number;
    createdAt?: string | null;
    updatedAt?: string | null;
  };
  sidebarFooter?: ReactNode;
  disableSave?: boolean;
}) {
  const selectedBrand = options.brands.find(
    (item) => item.id === Number(form.brandId),
  );
  const selectedCategory = options.productCategories.find(
    (item) => item.id === Number(form.productCategoryId),
  );

  const missingDependencies: string[] = [];
  if (options.brands.length === 0) missingDependencies.push("une marque");
  if (options.productCategories.length === 0) {
    missingDependencies.push("une categorie produit");
  }

  const canSave = !disableSave && missingDependencies.length === 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <Panel
        pretitle="Edition"
        title="Informations du produit"
        description="Le produit catalogue relie une marque, une categorie produit et des tags de recherche."
      >
        <div className="grid gap-6">
          {missingDependencies.length > 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Creez d&apos;abord {missingDependencies.join(" et ")} pour pouvoir
              enregistrer ce produit.
            </div>
          ) : null}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[15px] font-semibold text-cobam-dark-blue">
                Nom de base
              </label>
              <PanelInput
                value={form.baseName}
                onChange={(event) => {
                  const nextName = event.target.value;
                  onFieldChange("baseName", nextName);
                  if (
                    form.baseSlug === "" ||
                    form.baseSlug === slugifyProductName(form.baseName)
                  ) {
                    onFieldChange("baseSlug", slugifyProductName(nextName));
                  }
                }}
                placeholder="Ex. Mitigeur mural Atlas"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[15px] font-semibold text-cobam-dark-blue">
                Slug de base
              </label>
              <PanelInput
                value={form.baseSlug}
                onChange={(event) =>
                  onFieldChange("baseSlug", slugifyProductName(event.target.value))
                }
                placeholder="mitigeur-mural-atlas"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <StaffField id="brandId" label="Marque">
              <StaffSelect
                value={form.brandId}
                onValueChange={(value) => onFieldChange("brandId", value)}
                emptyLabel="Selectionner une marque"
                options={options.brands.map((option) => ({
                  value: String(option.id),
                  label: option.name,
                }))}
                triggerClassName="h-12 rounded-2xl border-slate-300 px-4 text-base"
              />
            </StaffField>

            <StaffField id="productCategoryId" label="Categorie produit">
              <StaffSelect
                value={form.productCategoryId}
                onValueChange={(value) =>
                  onFieldChange("productCategoryId", value)
                }
                emptyLabel="Selectionner une categorie"
                options={options.productCategories.map((option) => ({
                  value: String(option.id),
                  label: option.name,
                }))}
                triggerClassName="h-12 rounded-2xl border-slate-300 px-4 text-base"
              />
            </StaffField>
          </div>

          <StaffField id="isActive" label="Visibilite catalogue">
            <StaffSelect
              value={String(form.isActive)}
              onValueChange={(value) =>
                onFieldChange("isActive", value === "true")
              }
              options={[
                { value: "true", label: "Actif" },
                { value: "false", label: "Masque" },
              ]}
              triggerClassName="h-12 rounded-2xl border-slate-300 px-4 text-base"
            />
          </StaffField>

          <div className="space-y-2">
            <label className="text-[15px] font-semibold text-cobam-dark-blue">
              Description
            </label>
            <Textarea
              value={form.description}
              onChange={(event) => onFieldChange("description", event.target.value)}
              placeholder="Description commerciale ou technique du produit..."
              className="min-h-32 rounded-md border-slate-300 px-4 py-3 text-base"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[15px] font-semibold text-cobam-dark-blue">
              Description SEO
            </label>
            <Textarea
              value={form.descriptionSeo}
              onChange={(event) =>
                onFieldChange("descriptionSeo", event.target.value)
              }
              placeholder="Resume court optimise pour les moteurs de recherche..."
              className="min-h-24 rounded-md border-slate-300 px-4 py-3 text-base"
            />
          </div>

          <div className="flex justify-end">
            <AnimatedUIButton
              type="button"
              onClick={() => onSave()}
              disabled={isSaving || !canSave}
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
          pretitle="Taxonomies"
          title="Assignations"
          description="Rattachez ce produit aux tags de recherche utiles au catalogue."
        >
          <div className="space-y-5">
            <StaffField
              id="product-tags"
              label="Tags"
              hint="Tapez un tag puis espace. Les suggestions existantes se valident avec Tab."
            >
              <StaffTagInput
                value={form.tagNames}
                onChange={(nextTags) => onFieldChange("tagNames", nextTags)}
                placeholder="Ex. douche, mitigeur, laiton brosse"
              />
            </StaffField>
          </div>
        </Panel>

        <Panel
          pretitle="Resume"
          title="Vue rapide"
          description="Controlez les rattachements principaux avant validation."
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Nom affiche
              </p>
              <p className="mt-1 text-lg font-semibold text-cobam-dark-blue">
                {form.baseName.trim() || "Nom du produit"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Slug
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {form.baseSlug.trim() || "slug-du-produit"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Marque
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {selectedBrand?.name || "Aucune"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Categorie produit
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {selectedCategory?.name || "Aucune"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Etat
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {form.isActive ? "Actif" : "Masque"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Tags
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {form.tagNames.length > 0
                  ? `${form.tagNames.length} tag(s)`
                  : "Aucun tag"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Variantes
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {summary?.variantCount ?? 0}
              </p>
            </div>

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
          </div>
        </Panel>

        {sidebarFooter}
      </div>
    </div>
  );
}
