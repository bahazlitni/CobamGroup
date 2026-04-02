"use client";

import type { Dispatch, SetStateAction } from "react";
import { useMemo, useState } from "react";
import Image from "next/image";
import { Package } from "lucide-react";
import ArticleRichTextEditor from "@/components/staff/articles/article-rich-text-editor";
import Panel from "@/components/staff/ui/Panel";
import PanelField from "@/components/staff/ui/PanelField";
import PanelInput from "@/components/staff/ui/PanelInput";
import {
  StaffBadge,
  StaffEditorActionsPanel,
  StaffEditorInfoPanel,
  StaffEditorLayout,
  StaffSelect,
} from "@/components/staff/ui";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import type { AllProductListItemDto } from "@/features/all-products/types";
import { slugifyProductName } from "@/features/products/slug";
import {
  PRODUCT_COMMERCIAL_MODE_OPTIONS,
  PRODUCT_LIFECYCLE_STATUS_OPTIONS,
  PRODUCT_PRICE_VISIBILITY_OPTIONS,
  PRODUCT_VISIBILITY_OPTIONS,
  type ProductFormOptionsDto,
  type ProductCommercialMode,
  type ProductLifecycleStatus,
  type ProductPriceVisibility,
  type ProductVisibility,
} from "@/features/products/types";
import ProductMainImageField from "@/components/staff/products/ProductMainImageField";
import ProductMediaGrid from "@/components/staff/products/ProductMediaGrid";
import ProductSubcategoriesField from "@/components/staff/products/ProductSubcategoriesField";
import {
  addVariantLinesToPackForm,
  type ProductPackEditorFormState,
} from "@/features/product-packs/form";
import type { ProductPackDetailDto, ProductPackOverrideMode } from "@/features/product-packs/types";
import ProductPackVariantSelectorDialog from "./ProductPackVariantSelectorDialog";

const COMMERCIAL_MODE_LABELS: Record<ProductCommercialMode, string> = {
  SELLABLE: "En vente",
  QUOTE_ONLY: "Sur demande",
  REFERENCE_ONLY: "Reference",
};

const LIFECYCLE_LABELS: Record<ProductLifecycleStatus, string> = {
  ACTIVE: "Active",
  DRAFT: "Brouillon",
  ARCHIVED: "Archivee",
};

const VISIBILITY_LABELS: Record<ProductVisibility, string> = {
  PUBLIC: "Publique",
  HIDDEN: "Masquee",
};

const PRICE_VISIBILITY_LABELS: Record<ProductPriceVisibility, string> = {
  VISIBLE: "Visible",
  HIDDEN: "Masque",
};

const OVERRIDE_MODE_LABELS: Record<ProductPackOverrideMode, string> = {
  AUTO: "Auto",
  MANUAL: "Manuel",
};

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("fr-TN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatVatRate(value: number) {
  return new Intl.NumberFormat("fr-TN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(value);
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-cobam-dark-blue">{value}</span>
    </div>
  );
}

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: "green" | "blue" | "default" | "amber";
}) {
  return (
    <StaffBadge
      size="sm"
      color={tone}
      icon={
        tone === "green"
          ? "check-circle"
          : tone === "blue"
            ? "eye"
            : tone === "amber"
              ? "pause"
              : "modify"
      }
    >
      {label}
    </StaffBadge>
  );
}

export default function ProductPackEditorPanels({
  mode,
  form,
  options,
  onFormChange,
  pack,
  isSaving,
  isDeleting = false,
  onSave,
  onDelete,
}: {
  mode: "create" | "edit";
  form: ProductPackEditorFormState;
  options: ProductFormOptionsDto;
  onFormChange: Dispatch<SetStateAction<ProductPackEditorFormState>>;
  pack?: ProductPackDetailDto | null;
  isSaving: boolean;
  isDeleting?: boolean;
  onSave: () => void;
  onDelete?: () => void;
}) {
  const [isVariantSelectorOpen, setIsVariantSelectorOpen] = useState(false);
  const slugPreview = useMemo(() => slugifyProductName(form.name), [form.name]);
  const totalQuantity = useMemo(
    () =>
      form.lines.reduce((sum, line) => {
        const quantity = Number(line.quantity);
        return sum + (Number.isInteger(quantity) && quantity > 0 ? quantity : 1);
      }, 0),
    [form.lines],
  );

  const setField = <Field extends keyof ProductPackEditorFormState>(
    field: Field,
    value: ProductPackEditorFormState[Field],
  ) => {
    onFormChange((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const appendVariants = (items: AllProductListItemDto[]) => {
    onFormChange((current) => ({
      ...current,
      lines: addVariantLinesToPackForm(current.lines, items),
    }));
  };

  const updateLine = (
    formKey: string,
    patch: Partial<ProductPackEditorFormState["lines"][number]>,
  ) => {
    onFormChange((current) => ({
      ...current,
      lines: current.lines.map((line) =>
        line.formKey === formKey ? { ...line, ...patch } : line,
      ),
    }));
  };

  const removeLine = (formKey: string) => {
    onFormChange((current) => ({
      ...current,
      lines: current.lines.filter((line) => line.formKey !== formKey),
    }));
  };

  const moveLine = (formKey: string, direction: "up" | "down") => {
    onFormChange((current) => {
      const index = current.lines.findIndex((line) => line.formKey === formKey);

      if (index < 0) {
        return current;
      }

      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= current.lines.length) {
        return current;
      }

      const nextLines = [...current.lines];
      const [moved] = nextLines.splice(index, 1);
      nextLines.splice(targetIndex, 0, moved);

      return {
        ...current,
        lines: nextLines,
      };
    });
  };

  return (
    <>
      <StaffEditorLayout
        sidebar={
          <>
            <StaffEditorActionsPanel
              mode={mode}
              onSave={onSave}
              isSaving={isSaving}
              saveDisabled={form.lines.length === 0 || form.productSubcategoryIds.length === 0}
              onDelete={onDelete}
              isDeleting={isDeleting}
              description="Composez le pack puis enregistrez-le. Les valeurs dérivées seront recalculees automatiquement."
            >
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {form.lines.length === 0
                  ? "Ajoutez au moins une variante pour enregistrer ce pack."
                  : form.productSubcategoryIds.length === 0
                    ? "Ajoutez au moins une sous-categorie pour enregistrer ce pack."
                  : `${form.lines.length} ligne(s) et ${totalQuantity} article(s) composent actuellement ce pack.`}
              </div>
            </StaffEditorActionsPanel>

            <Panel
              pretitle="Media"
              title="Image du pack"
              description="Cette image est propre au pack. Elle est optionnelle."
            >
              <ProductMainImageField
                value={form.mainImage}
                onChange={(media) => setField("mainImage", media)}
              />
            </Panel>

            <StaffEditorInfoPanel
              title="Projection actuelle"
              description={
                pack
                  ? "Cette synthese vient de la projection calculee a partir des variantes du pack."
                  : "La projection apparaitra apres le premier enregistrement du pack."
              }
            >
              <SummaryRow label="Slug genere" value={slugPreview || "-"} />
              <SummaryRow label="Lignes" value={String(form.lines.length)} />
              <SummaryRow label="Articles au total" value={String(totalQuantity)} />
              <SummaryRow
                label="Sous-categories"
                value={String(form.productSubcategoryIds.length)}
              />

              {pack ? (
                <>
                  <SummaryRow
                    label="Prix dérivé"
                    value={
                      pack.basePriceAmount && pack.priceVisibility === "VISIBLE"
                        ? `${pack.basePriceAmount} TND`
                        : "Masque ou indisponible"
                    }
                  />
                  <SummaryRow label="TVA moyenne" value={`${formatVatRate(pack.vatRate)} %`} />
                  <SummaryRow label="Unite prix" value="Par article" />
                  <SummaryRow
                    label="Marques dérivées"
                    value={
                      pack.brandIds.length > 0
                        ? `${pack.brandIds.length} marque(s)`
                        : "Aucune marque dérivée"
                    }
                  />
                  <SummaryRow
                    label="Derniere mise a jour"
                    value={formatTimestamp(pack.updatedAt)}
                  />

                  <div className="flex flex-wrap gap-2">
                    <StatusBadge
                      label={LIFECYCLE_LABELS[pack.lifecycleStatus]}
                      tone={
                        pack.lifecycleStatus === "ACTIVE"
                          ? "green"
                          : pack.lifecycleStatus === "ARCHIVED"
                            ? "amber"
                            : "default"
                      }
                    />
                    <StatusBadge
                      label={VISIBILITY_LABELS[pack.visibility]}
                      tone={pack.visibility === "PUBLIC" ? "blue" : "default"}
                    />
                    <StatusBadge
                      label={PRICE_VISIBILITY_LABELS[pack.priceVisibility]}
                      tone={pack.priceVisibility === "VISIBLE" ? "green" : "default"}
                    />
                  </div>

                  {pack.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {pack.tags.map((tag) => (
                        <StaffBadge key={tag} size="sm" color="secondary" icon="folder">
                          {tag}
                        </StaffBadge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Aucun tag dérivé pour le moment.</p>
                  )}
                </>
              ) : (
                <p className="text-sm leading-6 text-slate-500">
                  Le prix, la TVA, les tags et les marques seront dérivés automatiquement a partir
                  des variantes ajoutees au pack.
                </p>
              )}
            </StaffEditorInfoPanel>
          </>
        }
      >
        <Panel
          pretitle="Identite"
          title="Informations du pack"
          description="Renseignez les informations propres au pack. Le slug est genere a partir du nom."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <PanelField id="pack-name" label="Nom">
              <PanelInput
                id="pack-name"
                fullWidth
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
                placeholder="Ex. Pack chantier facade"
              />
            </PanelField>

            <PanelField id="pack-sku" label="SKU">
              <PanelInput
                id="pack-sku"
                fullWidth
                value={form.sku}
                onChange={(event) => setField("sku", event.target.value)}
                placeholder="Ex. PACK-FACADE-01"
              />
            </PanelField>
          </div>
          
          <div className="grid gap-5 md:grid-cols-2">
            <PanelField id="pack-commercial-mode" label="Mode commercial">
              <StaffSelect
                id="pack-commercial-mode"
                fullWidth
                value={form.commercialMode}
                onValueChange={(value) =>
                  setField("commercialMode", value as ProductCommercialMode)
                }
                options={PRODUCT_COMMERCIAL_MODE_OPTIONS.map((option) => ({
                  value: option,
                  label: COMMERCIAL_MODE_LABELS[option],
                }))}
              />
            </PanelField>
            <ProductSubcategoriesField
              id="pack-product-subcategories"
              value={form.productSubcategoryIds}
              options={options.productSubcategories}
              onChange={(nextValue) => setField("productSubcategoryIds", nextValue)}
            />
          </div>

          <PanelField id="pack-description" label="Description" className="md:col-span-2">
            <ArticleRichTextEditor
              editorId="product-pack-description"
              value={form.description}
              onChange={(nextValue) => setField("description", nextValue)}
              placeholder="Presentez le pack, son usage et ce qu'il contient."
              className="overflow-hidden rounded-[28px]"
            />
          </PanelField>

          <PanelField id="pack-description-seo" label="Description SEO" className="md:col-span-2">
            <Textarea
              id="pack-description-seo"
              value={form.descriptionSeo}
              onChange={(event) => setField("descriptionSeo", event.target.value)}
              className="min-h-24 border-slate-300 bg-white"
              placeholder="Version SEO ou courte description"
            />
          </PanelField>
        </Panel>

        <Panel
          pretitle="Composition"
          title="Galerie du pack"
          description="Ajoutez des medias propres a ce pack. Ils ne sont pas dérivés des variantes."
        >
          <ProductMediaGrid
            items={form.media}
            onChange={(items) => setField("media", items)}
            title="Galerie"
            description="Optionnel : ajoutez des images, videos ou documents specifiques au pack."
          />
        </Panel>

        <Panel
          pretitle="Composition"
          title="Variantes contenues"
          description="Ajoutez ici les variantes qui composent le pack. Une variante ne peut apparaitre qu'une seule fois."
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-slate-500">
              {form.lines.length === 0
                ? "Aucune variante n'a encore ete ajoutee."
                : `${form.lines.length} ligne(s) actuellement dans ce pack.`}
            </div>

            <AnimatedUIButton
              type="button"
              variant="secondary"
              icon="plus"
              iconPosition="left"
              onClick={() => setIsVariantSelectorOpen(true)}
            >
              Ajouter des variantes
            </AnimatedUIButton>
          </div>

          {form.lines.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-sm text-slate-500">
              Ouvrez le selecteur pour constituer la composition de ce pack a partir des variantes
              deja materialisees dans le catalogue.
            </div>
          ) : (
            <div className="space-y-4">
              {form.lines.map((line, index) => (
                <div
                  key={line.formKey}
                  className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 lg:grid-cols-[minmax(0,1fr)_9rem_auto]"
                >
                  <div className="flex min-w-0 gap-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      {line.coverMediaId != null ? (
                        <Image
                          src={`/api/staff/medias/${line.coverMediaId}/file?variant=thumbnail`}
                          alt={line.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <Package className="h-5 w-5" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-cobam-dark-blue">
                          {line.name}
                        </p>
                      </div>

                      <span className="text-xs rounded-full bg-white px-2 py-1 ring-1 ring-slate-200">
                        {line.sku}
                      </span>
                    </div>
                  </div>

                  <PanelField id={`pack-line-qty-${line.formKey}`} label="Quantite">
                    <PanelInput
                      id={`pack-line-qty-${line.formKey}`}
                      fullWidth
                      type="number"
                      min={1}
                      step={1}
                      value={line.quantity}
                      onChange={(event) =>
                        updateLine(line.formKey, { quantity: event.target.value })
                      }
                    />
                  </PanelField>

                  <div className="flex items-start justify-end gap-2">
                    <AnimatedUIButton
                      type="button"
                      size="xs"
                      variant="light"
                      disabled={index === 0}
                      onClick={() => moveLine(line.formKey, "up")}
                      icon="chevron-up"
                    />
                    <AnimatedUIButton
                      type="button"
                      size="xs"
                      variant="light"
                      disabled={index === form.lines.length - 1}
                      icon="chevron-down"
                      onClick={() => moveLine(line.formKey, "down")}
                    />
                    <AnimatedUIButton
                      type="button"
                      size="xs"
                      variant="light"
                      onClick={() => removeLine(line.formKey)}
                      icon="close"
                      color="error"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel
          pretitle="Pilotage"
          title="Regles dérivées"
          description="Choisissez si le pack suit automatiquement la composition ou si vous imposez une valeur manuelle."
        >
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <PanelField id="pack-lifecycle-mode" label="Cycle de vie">
                <StaffSelect
                  id="pack-lifecycle-mode"
                  fullWidth
                  value={form.lifecycleStatusMode}
                  onValueChange={(value) =>
                    setField("lifecycleStatusMode", value as ProductPackOverrideMode)
                  }
                  options={[
                    { value: "AUTO", label: OVERRIDE_MODE_LABELS.AUTO },
                    { value: "MANUAL", label: OVERRIDE_MODE_LABELS.MANUAL },
                  ]}
                />
              </PanelField>

              {form.lifecycleStatusMode === "MANUAL" ? (
                <PanelField id="pack-manual-lifecycle" label="Valeur manuelle">
                  <StaffSelect
                    id="pack-manual-lifecycle"
                    fullWidth
                    value={form.manualLifecycleStatus}
                    onValueChange={(value) =>
                      setField("manualLifecycleStatus", value as ProductLifecycleStatus | "")
                    }
                    emptyLabel="Selectionner"
                    options={PRODUCT_LIFECYCLE_STATUS_OPTIONS.map((option) => ({
                      value: option,
                      label: LIFECYCLE_LABELS[option],
                    }))}
                  />
                </PanelField>
              ) : (
                <p className="text-sm leading-6 text-slate-500">
                  En mode auto, le cycle de vie suit la composition du pack.
                </p>
              )}
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <PanelField id="pack-visibility-mode" label="Visibilite">
                <StaffSelect
                  id="pack-visibility-mode"
                  fullWidth
                  value={form.visibilityMode}
                  onValueChange={(value) =>
                    setField("visibilityMode", value as ProductPackOverrideMode)
                  }
                  options={[
                    { value: "AUTO", label: OVERRIDE_MODE_LABELS.AUTO },
                    { value: "MANUAL", label: OVERRIDE_MODE_LABELS.MANUAL },
                  ]}
                />
              </PanelField>

              {form.visibilityMode === "MANUAL" ? (
                <PanelField id="pack-manual-visibility" label="Valeur manuelle">
                  <StaffSelect
                    id="pack-manual-visibility"
                    fullWidth
                    value={form.manualVisibility}
                    onValueChange={(value) =>
                      setField("manualVisibility", value as ProductVisibility | "")
                    }
                    emptyLabel="Selectionner"
                    options={PRODUCT_VISIBILITY_OPTIONS.map((option) => ({
                      value: option,
                      label: VISIBILITY_LABELS[option],
                    }))}
                  />
                </PanelField>
              ) : (
                <p className="text-sm leading-6 text-slate-500">
                  En mode auto, la visibilite suit la composition du pack.
                </p>
              )}
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <PanelField id="pack-price-visibility-mode" label="Affichage du prix">
                <StaffSelect
                  id="pack-price-visibility-mode"
                  fullWidth
                  value={form.priceVisibilityMode}
                  onValueChange={(value) =>
                    setField("priceVisibilityMode", value as ProductPackOverrideMode)
                  }
                  options={[
                    { value: "AUTO", label: OVERRIDE_MODE_LABELS.AUTO },
                    { value: "MANUAL", label: OVERRIDE_MODE_LABELS.MANUAL },
                  ]}
                />
              </PanelField>

              {form.priceVisibilityMode === "MANUAL" ? (
                <PanelField id="pack-manual-price-visibility" label="Valeur manuelle">
                  <StaffSelect
                    id="pack-manual-price-visibility"
                    fullWidth
                    value={form.manualPriceVisibility}
                    onValueChange={(value) =>
                      setField("manualPriceVisibility", value as ProductPriceVisibility | "")
                    }
                    emptyLabel="Selectionner"
                    options={PRODUCT_PRICE_VISIBILITY_OPTIONS.map((option) => ({
                      value: option,
                      label: PRICE_VISIBILITY_LABELS[option],
                    }))}
                  />
                </PanelField>
              ) : (
                <p className="text-sm leading-6 text-slate-500">
                  En mode auto, l&apos;affichage du prix suit la composition du pack.
                </p>
              )}
            </div>
          </div>
        </Panel>
      </StaffEditorLayout>

      <ProductPackVariantSelectorDialog
        open={isVariantSelectorOpen}
        onOpenChange={setIsVariantSelectorOpen}
        selectedVariantIds={form.lines.map((line) => line.variantId)}
        onSelect={appendVariants}
      />
    </>
  );
}
