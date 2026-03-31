"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import ArticleRichTextEditor from "@/components/staff/articles/article-rich-text-editor";
import { Accordion } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import StaffBadge from "@/components/staff/ui/StaffBadge";
import {
  StaffEditorActionsPanel,
  StaffEditorInfoPanel,
  StaffEditorLayout,
} from "@/components/staff/ui";
import Panel from "@/components/staff/ui/Panel";
import PanelField from "@/components/staff/ui/PanelField";
import PanelInput from "@/components/staff/ui/PanelInput";
import StaffSearchSelect from "@/components/staff/ui/search-select";
import StaffSelect from "@/components/staff/ui/PanelSelect";
import StaffTagInput from "@/components/staff/ui/tag-input";
import ProductAttributeMetadataInput from "./ProductAttributeMetadataInput";
import ProductMainImageField from "./ProductMainImageField";
import ProductVariantCard from "./ProductVariantCard";
import { PRODUCT_PRICE_UNIT_SELECT_OPTIONS } from "@/features/products/price-units";
import { type ProductFormOptionsDto } from "@/features/products/types";
import type {
  ProductAttributeEditorState,
  ProductEditorFormState,
  ProductVariantEditorState,
} from "@/features/products/form";
import { getComputedFamilySlug } from "@/features/products/form";
import { getProductAttributeDataTypeLabel } from "@/features/products/attribute-values";

type EditableField = keyof ProductEditorFormState;
type EditableAttributeField = keyof ProductAttributeEditorState;
type EditableVariantField = keyof ProductVariantEditorState;

function RequirementRow({
  label,
  complete,
  optional = false,
}: {
  label: string;
  complete: boolean;
  optional?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-300 bg-slate-50/70 px-3 py-2">
      <span className="text-sm text-slate-600">{label}</span>
      <StaffBadge size="sm" color={complete ? "success" : optional ? "default" : "warning"}>
        {complete ? "OK" : optional ? "Optionnel" : "À compléter"}
      </StaffBadge>
    </div>
  );
}

function isVariantComplete(variant: ProductVariantEditorState) {
  return (
    variant.sku.trim().length > 0 &&
    variant.name.trim().length > 0 &&
    variant.description.trim().length > 0 &&
    variant.descriptionSeo.trim().length > 0
  );
}

function isDefaultVariantConfigured(variant: ProductVariantEditorState | undefined) {
  if (!variant) {
    return false;
  }

  return (
    isVariantComplete(variant) &&
    variant.lifecycleStatus != null &&
    variant.visibility != null &&
    variant.commercialMode != null &&
    variant.priceVisibility != null
  );
}

export default function ProductEditorPanels({
  mode,
  form,
  options,
  isSaving,
  isDeleting = false,
  onFieldChange,
  onAttributeAdd,
  onAttributeRemove,
  onAttributeChange,
  onVariantAdd,
  onVariantRemove,
  onVariantDuplicate,
  onVariantMove,
  onVariantChange,
  onVariantAttributeValueChange,
  onSave,
  onDelete,
  summary: rawSummary = {},
  sidebarFooter,
  disableSave = false,
}: {
  mode: "create" | "edit";
  form: ProductEditorFormState;
  options: ProductFormOptionsDto;
  isSaving: boolean;
  isDeleting?: boolean;
  onFieldChange: (field: EditableField, value: ProductEditorFormState[EditableField]) => void;
  onAttributeAdd: () => void;
  onAttributeRemove: (formKey: string) => void;
  onAttributeChange: <Field extends EditableAttributeField>(
    formKey: string,
    field: Field,
    value: ProductAttributeEditorState[Field],
  ) => void;
  onVariantAdd: () => void;
  onVariantRemove: (formKey: string) => void;
  onVariantDuplicate: (formKey: string) => void;
  onVariantMove: (formKey: string, direction: "up" | "down") => void;
  onVariantChange: <Field extends EditableVariantField>(
    formKey: string,
    field: Field,
    value: ProductVariantEditorState[Field],
  ) => void;
  onVariantAttributeValueChange: (formKey: string, attributeFormKey: string, value: string) => void;
  onSave: () => void;
  onDelete?: () => void;
  summary?: {
    variantCount?: number;
    createdAt?: string | null;
    updatedAt?: string | null;
  };
  sidebarFooter?: ReactNode;
  disableSave?: boolean;
}) {
  const [openVariantKeys, setOpenVariantKeys] = useState<string[]>(() =>
    form.variants.slice(0, 1).map((variant) => variant.formKey),
  );
  const hasObservedVariantKeysRef = useRef(false);
  const previousVariantKeysRef = useRef<string[]>([]);

  const selectedProductSubcategories = useMemo(
    () =>
      options.productSubcategories.filter((item) =>
        form.productSubcategoryIds.includes(String(item.id)),
      ),
    [form.productSubcategoryIds, options.productSubcategories],
  );

  const remainingProductSubcategories = useMemo(
    () =>
      options.productSubcategories.filter(
        (item) => !form.productSubcategoryIds.includes(String(item.id)),
      ),
    [form.productSubcategoryIds, options.productSubcategories],
  );

  const selectedBrand = useMemo(
    () => options.brands.find((brand) => String(brand.id) === form.brandId) ?? null,
    [form.brandId, options.brands],
  );

  const variantKeys = useMemo(() => form.variants.map((variant) => variant.formKey), [form.variants]);
  const normalizedOpenVariantKeys = useMemo(
    () => openVariantKeys.filter((key) => variantKeys.includes(key)),
    [openVariantKeys, variantKeys],
  );

  useEffect(() => {
    if (!hasObservedVariantKeysRef.current) {
      previousVariantKeysRef.current = variantKeys;
      hasObservedVariantKeysRef.current = true;
      return;
    }

    const previousVariantKeys = previousVariantKeysRef.current;
    const addedVariantKeys = variantKeys.filter((variantKey) => !previousVariantKeys.includes(variantKey));

    if (addedVariantKeys.length > 0) {
      setOpenVariantKeys((currentKeys) => Array.from(new Set([...addedVariantKeys, ...currentKeys])));
    }

    previousVariantKeysRef.current = variantKeys;
  }, [variantKeys]);

  const missingDependencies: string[] = [];
  if (options.productSubcategories.length === 0) {
    missingDependencies.push("au moins une sous-catégorie produit");
  }

  const defaultVariant = form.variants[0];
  const hasCompleteDefaultVariant = isDefaultVariantConfigured(defaultVariant);
  const areAllVariantsComplete = form.variants.every(isVariantComplete);
  const requiredItems = [
    { label: "Nom de la famille", complete: form.name.trim().length > 0 },
    { label: "Sous-catégorie liée", complete: form.productSubcategoryIds.length > 0 },
  ];
  const optionalItems = [
    { label: "Marque", complete: Boolean(form.brandId) },
    { label: "Image principale", complete: form.mainImage != null },
  ];

  const canSave =
    !disableSave &&
    missingDependencies.length === 0 &&
    requiredItems.every((item) => item.complete) &&
    hasCompleteDefaultVariant &&
    areAllVariantsComplete;

  const summary = {
    variantCount: rawSummary.variantCount,
    createdAt: rawSummary.createdAt ?? "",
    updatedAt: rawSummary.updatedAt ?? "",
  };
  const hasSummary =
    rawSummary.variantCount != null || rawSummary.createdAt != null || rawSummary.updatedAt != null;

  return (
    <StaffEditorLayout
      sidebar={
        <>
          <StaffEditorActionsPanel
            mode={mode}
            onSave={onSave}
            isSaving={isSaving}
            saveDisabled={!canSave}
            onDelete={onDelete}
            isDeleting={isDeleting}
            description="Pour enregistrer, il faut un nom, au moins une sous-catégorie et une variante par défaut complète."
            topContent={
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <StaffBadge size="sm" color="default" icon="folder">
                    {form.productSubcategoryIds.length} sous-catégorie
                    {form.productSubcategoryIds.length > 1 ? "s" : ""}
                  </StaffBadge>
                  <StaffBadge size="sm" color="secondary" icon="package">
                    {form.variants.length} variante
                    {form.variants.length > 1 ? "s" : ""}
                  </StaffBadge>
                  <StaffBadge size="sm" color="info">
                    {form.attributes.length} attribut
                    {form.attributes.length > 1 ? "s" : ""}
                  </StaffBadge>
                </div>

                <div className="space-y-2">
                  {requiredItems.map((item) => (
                    <RequirementRow key={item.label} label={item.label} complete={item.complete} />
                  ))}
                  <RequirementRow label="Variante par défaut" complete={hasCompleteDefaultVariant} />
                  <RequirementRow label="Toutes les variantes" complete={areAllVariantsComplete} />
                  {optionalItems.map((item) => (
                    <RequirementRow
                      key={item.label}
                      label={item.label}
                      complete={item.complete}
                      optional
                    />
                  ))}
                </div>
              </div>
            }
          />

          <StaffEditorInfoPanel
            title="Aperçu rapide"
            description="Une vue compacte pour valider rapidement la structure de la famille."
          >
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Nom affiché</p>
              <p className="text-cobam-dark-blue mt-1 text-lg font-semibold">
                {form.name.trim() || "Nom de la famille"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Slug</p>
              <p className="mt-1 text-sm text-slate-600">
                {getComputedFamilySlug(form.name) || "slug-famille"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">Marque</p>
              <p className="mt-1 text-sm text-slate-600">{selectedBrand?.name ?? "Aucune marque"}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedProductSubcategories.length > 0 ? (
                selectedProductSubcategories.slice(0, 4).map((subcategory) => (
                  <StaffBadge key={subcategory.id} size="sm" color="secondary" icon="folder">
                    {subcategory.categoryName} / {subcategory.name}
                  </StaffBadge>
                ))
              ) : (
                <StaffBadge size="sm" color="default">Aucune sous-catégorie</StaffBadge>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <StaffBadge size="sm" color="default">
                {form.tagNames.length} tag{form.tagNames.length > 1 ? "s" : ""}
              </StaffBadge>
              <StaffBadge size="sm" color="secondary">
                {form.attributes.length} attribut{form.attributes.length > 1 ? "s" : ""}
              </StaffBadge>
              <StaffBadge size="sm" color="info">
                TVA {form.vatRate || "19"}%
              </StaffBadge>
            </div>

            {hasSummary ? (
              <div className="flex flex-wrap gap-2">
                <StaffBadge size="sm" color="default" icon="package">
                  {summary.variantCount ?? form.variants.length} variante
                  {(summary.variantCount ?? form.variants.length) > 1 ? "s" : ""}
                </StaffBadge>
                {summary.createdAt ? (
                  <StaffBadge size="sm" color="default" icon="calendar">
                    Créé le {new Date(summary.createdAt).toLocaleDateString("fr-FR")}
                  </StaffBadge>
                ) : null}
                {summary.updatedAt ? (
                  <StaffBadge size="sm" color="info" icon="clock">
                    Mis à jour le {new Date(summary.updatedAt).toLocaleDateString("fr-FR")}
                  </StaffBadge>
                ) : null}
              </div>
            ) : null}
          </StaffEditorInfoPanel>

          {sidebarFooter}
        </>
      }
    >
      <Panel pretitle="Famille" title="Identité et référencement" allowOverflow>
        <div className="grid gap-6 xl:grid-cols-2">
          <PanelField id="name" label="Nom">
            <PanelInput
              id="name"
              fullWidth
              value={form.name}
              onChange={(event) => onFieldChange("name", event.target.value)}
              placeholder="Ex. Collection Atlas"
            />
          </PanelField>

          <PanelField id="subtitle" label="Sous-titre">
            <PanelInput
              id="subtitle"
              fullWidth
              value={form.subtitle}
              onChange={(event) => onFieldChange("subtitle", event.target.value)}
              placeholder="Ex. Robinetterie haut de gamme"
            />
          </PanelField>

          <PanelField id="family-slug-preview" label="Slug">
            <PanelInput
              id="family-slug-preview"
              fullWidth
              value={getComputedFamilySlug(form.name)}
              readOnly
              placeholder="slug-famille"
            />
          </PanelField>

          <PanelField id="brandId" label="Marque">
            <StaffSearchSelect
              id="brandId"
              fullWidth
              value={form.brandId}
              onValueChange={(value) => onFieldChange("brandId", value)}
              emptyLabel="Aucune marque"
              placeholder="Sélectionner une marque"
              searchPlaceholder="Rechercher une marque..."
              noResultsLabel="Aucune marque trouvée"
              options={options.brands.map((option) => ({
                value: String(option.id),
                label: option.name,
              }))}
              triggerClassName="h-10 rounded-2xl border-slate-300 px-4 text-base"
            />
          </PanelField>

          <PanelField id="productSubcategoryIds" label="Sous-catégories" className="xl:col-span-2">
            <div className="space-y-3">
              <StaffSearchSelect
                value=""
                onValueChange={(value) => {
                  if (!value) {
                    return;
                  }

                  onFieldChange("productSubcategoryIds", [...form.productSubcategoryIds, value]);
                }}
                emptyLabel="Ajouter une sous-catégorie"
                placeholder="Ajouter une sous-catégorie"
                searchPlaceholder="Rechercher une sous-catégorie..."
                noResultsLabel="Aucune autre sous-catégorie disponible"
                options={remainingProductSubcategories.map((option) => ({
                  value: String(option.id),
                  label: `${option.categoryName} / ${option.name}`,
                }))}
                fullWidth
                disabled={
                  options.productSubcategories.length === 0 ||
                  remainingProductSubcategories.length === 0
                }
                triggerClassName="h-10 rounded-2xl border-slate-300 px-4 text-base"
              />

              {selectedProductSubcategories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedProductSubcategories.map((subcategory) => (
                    <button
                      key={subcategory.id}
                      type="button"
                      onClick={() =>
                        onFieldChange(
                          "productSubcategoryIds",
                          form.productSubcategoryIds.filter(
                            (subcategoryId) => subcategoryId !== String(subcategory.id),
                          ),
                        )
                      }
                      className="text-cobam-dark-blue inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium transition-colors hover:border-slate-300 hover:bg-slate-100"
                    >
                      <span>
                        {subcategory.categoryName} / {subcategory.name}
                      </span>
                      <X className="h-3.5 w-3.5 text-slate-400" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </PanelField>

          <PanelField id="description" label="Description" className="xl:col-span-2">
            <ArticleRichTextEditor
              editorId="product-family-description"
              value={form.description}
              onChange={(nextValue) => onFieldChange("description", nextValue)}
              placeholder="Présentez la famille produit, ses usages et ses points forts."
              className="overflow-hidden rounded-[28px]"
            />
          </PanelField>

          <PanelField id="description-seo" label="Description SEO" className="xl:col-span-2">
            <Textarea
              id="description-seo"
              value={form.descriptionSeo}
              onChange={(event) => onFieldChange("descriptionSeo", event.target.value)}
              placeholder="Résumé court optimisé pour les moteurs de recherche..."
              className="min-h-32 rounded-md border-slate-300 px-4 py-3 text-base"
            />
          </PanelField>

          <PanelField id="product-tags" label="Tags" className="xl:col-span-2">
            <StaffTagInput
              id="product-tags"
              value={form.tagNames}
              onChange={(nextTags) => onFieldChange("tagNames", nextTags)}
              placeholder="Ex. douche, mitigeur, laiton brossé"
            />
          </PanelField>

          <div className="xl:col-span-2">
            <ProductMainImageField
              value={form.mainImage}
              onChange={(media) => onFieldChange("mainImage", media)}
            />
          </div>
        </div>
      </Panel>

      <Panel pretitle="Tarification" title="Unité et TVA">
        <div className="grid gap-6 xl:grid-cols-2">
          <PanelField id="product-price-unit" label="Unité du prix">
            <StaffSelect
              id="product-price-unit"
              fullWidth
              value={form.priceUnit}
              onValueChange={(value) =>
                onFieldChange("priceUnit", value as ProductEditorFormState["priceUnit"])
              }
              options={PRODUCT_PRICE_UNIT_SELECT_OPTIONS}
              triggerClassName="h-10 rounded-2xl border-slate-300 px-4 text-base"
            />
          </PanelField>

          <PanelField id="family-vat-rate" label="TVA (%)">
            <PanelInput
              id="family-vat-rate"
              fullWidth
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={form.vatRate}
              onChange={(event) => onFieldChange("vatRate", event.target.value)}
              placeholder="19"
            />
          </PanelField>
        </div>
      </Panel>

      <Panel pretitle="Variantes" title="Attributs partagés" description="Définissez les attributs que chaque variante pourra renseigner.">
        <div className="space-y-4">
          {form.attributes.length > 0 ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {form.attributes.map((attribute, index) => (
                <div
                  key={attribute.formKey}
                  className="rounded-2xl border border-slate-300 bg-slate-50/70 p-4"
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-cobam-dark-blue text-sm font-semibold">Attribut {index + 1}</p>
                    <AnimatedUIButton
                      size="sm"
                      type="button"
                      variant="light"
                      color="error"
                      icon="close"
                      iconPosition="left"
                      onClick={() => onAttributeRemove(attribute.formKey)}
                    />
                  </div>

                  <div className="grid gap-4">
                    <PanelField id={`attribute-name-${attribute.formKey}`} label="Nom">
                      <ProductAttributeMetadataInput
                        id={`attribute-name-${attribute.formKey}`}
                        value={attribute.name}
                        onValueChange={(nextValue) => onAttributeChange(attribute.formKey, "name", nextValue)}
                        onMetadataSelect={(metadata) => {
                          onAttributeChange(attribute.formKey, "name", metadata.name);
                          onAttributeChange(attribute.formKey, "dataType", metadata.dataType);
                          onAttributeChange(attribute.formKey, "unit", metadata.unit ?? "");
                        }}
                        placeholder="Nom de l'attribut"
                      />
                    </PanelField>

                    <PanelField id={`attribute-type-${attribute.formKey}`} label="Type">
                      <StaffSelect
                        fullWidth
                        id={`attribute-type-${attribute.formKey}`}
                        value={attribute.dataType}
                        onValueChange={(value) =>
                          onAttributeChange(
                            attribute.formKey,
                            "dataType",
                            value as ProductAttributeEditorState["dataType"],
                          )
                        }
                        options={[
                          { value: "TEXT", label: getProductAttributeDataTypeLabel("TEXT") },
                          { value: "NUMBER", label: getProductAttributeDataTypeLabel("NUMBER") },
                          { value: "BOOLEAN", label: getProductAttributeDataTypeLabel("BOOLEAN") },
                        ]}
                        triggerClassName="h-10 rounded-2xl border-slate-300 px-4 text-base"
                      />
                    </PanelField>

                    {attribute.dataType === "NUMBER" ? (
                      <PanelField id={`attribute-unit-${attribute.formKey}`} label="Unité">
                        <PanelInput
                          id={`attribute-unit-${attribute.formKey}`}
                          fullWidth
                          value={attribute.unit}
                          onChange={(event) => onAttributeChange(attribute.formKey, "unit", event.target.value)}
                          placeholder="Ex. mm, kg, L"
                        />
                      </PanelField>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-6 text-sm text-slate-500">
              Aucun attribut partagé pour le moment.
            </div>
          )}

          <AnimatedUIButton
            type="button"
            variant="outline"
            icon="plus"
            iconPosition="left"
            onClick={onAttributeAdd}
          >
            Ajouter un attribut
          </AnimatedUIButton>
        </div>
      </Panel>

      <Panel pretitle="Variantes" title="Structure des variantes">
        <div className="space-y-4">
          <Accordion
            type="multiple"
            value={normalizedOpenVariantKeys}
            onValueChange={(value) => setOpenVariantKeys(value)}
            className="space-y-4"
          >
            {form.variants.map((variant, index) => (
              <ProductVariantCard
                key={variant.formKey}
                family={form}
                variant={variant}
                index={index}
                isOpen={normalizedOpenVariantKeys.includes(variant.formKey)}
                isDefault={index === 0}
                isFirst={index <= 1}
                isLast={index === form.variants.length - 1}
                attributes={form.attributes}
                onVariantRemove={onVariantRemove}
                onVariantDuplicate={onVariantDuplicate}
                onVariantMove={onVariantMove}
                onVariantChange={onVariantChange}
                onVariantAttributeValueChange={onVariantAttributeValueChange}
              />
            ))}
          </Accordion>

          <AnimatedUIButton
            type="button"
            variant="outline"
            icon="plus"
            iconPosition="left"
            onClick={onVariantAdd}
          >
            Ajouter une variante
          </AnimatedUIButton>
        </div>
      </Panel>
    </StaffEditorLayout>
  );
}
