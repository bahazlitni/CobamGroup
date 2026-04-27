"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ProductCommercialMode,
  ProductLifecycle,
  ProductStockUnit,
} from "@prisma/client";
import { ExternalLink, Package, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Loading from "@/components/staff/Loading";
import ArticleRichTextEditor from "@/components/staff/articles/article-rich-text-editor";
import ProductMediaGrid from "@/components/staff/products/ProductMediaGrid";
import ProductSubcategoriesField from "@/components/staff/products/ProductSubcategoriesField";
import PanelAttributesInput from "@/components/staff/ui/PanelAttributesInput";
import Panel from "@/components/staff/ui/Panel";
import PanelField from "@/components/staff/ui/PanelField";
import PanelInput from "@/components/staff/ui/PanelInput";
import { normalizeProductAttributeKind } from "@/lib/static_tables/attributes";
import {
  PanelAutoCompleteInput,
  PanelAttributeKindsInput,
  DescriptionSEOTextArea,
  StaffImageImporter,
  StaffPageHeader,
  StaffPdfImporter,
  StaffSelect,
  StaffStateCard,
  UnsavedChangesGuard,
  StaffTagInput,
} from "@/components/staff/ui";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";
import { canCreateProducts, canManageProducts } from "@/features/products/access";
import {
  createProductClient,
  deleteProductClient,
  getProductClient,
  getProductFormOptionsClient,
  ProductsClientError,
  updateProductClient,
} from "@/features/products/client";
import type {
  ProductAttributeInputDto,
  ProductFamilyUpsertInput,
  ProductFormOptionsDto,
  ProductVariantInputDto,
} from "@/features/products/types";
import { getProductBrandSuggestions } from "@/lib/static_tables/brands";
import { slugify } from "@/lib/slugify";
import formatEnumLabel from "@/lib/formatEnumLabel";

type VariantEditorState = ProductVariantInputDto & { formKey: string };
type FamilyEditorState = Omit<ProductFamilyUpsertInput, "variants"> & {
  variants: VariantEditorState[];
};
type FamilyCommonValuesState = {
  brand: string;
  subcategoryIds: number[];
  lifecycle: ProductLifecycle;
  priceVisibility: boolean;
  stockVisibility: boolean;
  visibility: boolean;
  stockUnit: ProductStockUnit | null;
  vatRate: string;
  commercialMode: ProductCommercialMode;
  attributeKinds: string[];
};

function createEmptyVariant(index: number): VariantEditorState {
  return {
    formKey: `variant-${Date.now()}-${index}`,
    sku: "",
    slug: "",
    name: "",
    description: null,
    descriptionSeo: null,
    brand: null,
    basePriceAmount: null,
    vatRate: 19,
    stock: null,
    stockUnit: "ITEM",
    visibility: true,
    priceVisibility: false,
    stockVisibility: false,
    lifecycle: "DRAFT",
    commercialMode: "ON_REQUEST_ONLY",
    tags: "",
    subcategoryIds: [],
    datasheet: null,
    media: [],
    attributes: [],
  };
}

function createEmptyFormState(): FamilyEditorState {
  return {
    name: "",
    slug: "",
    subtitle: null,
    description: null,
    descriptionSeo: null,
    mainImageMediaId: null,
    defaultVariantIndex: 0,
    variants: [createEmptyVariant(0)],
  };
}

function createEmptyCommonValuesState(): FamilyCommonValuesState {
  return {
    brand: "",
    subcategoryIds: [],
    lifecycle: "DRAFT",
    priceVisibility: false,
    stockVisibility: false,
    visibility: true,
    stockUnit: "ITEM",
    vatRate: "19",
    commercialMode: "ON_REQUEST_ONLY",
    attributeKinds: [],
  };
}



function getDefaultVariant(form: FamilyEditorState) {
  return form.variants[form.defaultVariantIndex] ?? form.variants[0] ?? createEmptyVariant(0);
}

function buildSharedAttributeKinds(variants: VariantEditorState[]) {
  const seenKinds = new Set<string>();
  const orderedKinds: string[] = [];

  for (const variant of variants) {
    for (const attribute of variant.attributes) {
      const normalizedKind = normalizeProductAttributeKind(attribute.kind);
      if (!normalizedKind || seenKinds.has(normalizedKind)) {
        continue;
      }

      seenKinds.add(normalizedKind);
      orderedKinds.push(normalizedKind);
    }
  }

  return orderedKinds;
}

function syncAttributesToKinds(
  attributes: ProductAttributeInputDto[],
  attributeKinds: string[],
): ProductAttributeInputDto[] {
  const attributeMap = new Map(
    attributes.map((attribute) => [
      normalizeProductAttributeKind(attribute.kind),
      attribute,
    ]),
  );

  return attributeKinds
    .map((kind) => normalizeProductAttributeKind(kind))
    .filter((kind, index, kinds) => Boolean(kind) && kinds.indexOf(kind) === index)
    .map((kind) => {
      const existingAttribute = attributeMap.get(kind);

      return {
        kind,
        value: existingAttribute?.value ?? "",
      };
    });
}

function deriveCommonValues(form: FamilyEditorState): FamilyCommonValuesState {
  const defaultVariant = getDefaultVariant(form);

  return {
    brand: defaultVariant.brand ?? "",
    subcategoryIds: [...defaultVariant.subcategoryIds],
    lifecycle: defaultVariant.lifecycle,
    priceVisibility: defaultVariant.priceVisibility,
    stockVisibility: defaultVariant.stockVisibility,
    visibility: defaultVariant.visibility,
    stockUnit: defaultVariant.stockUnit,
    vatRate: defaultVariant.vatRate == null ? "" : String(defaultVariant.vatRate),
    commercialMode: defaultVariant.commercialMode,
    attributeKinds: buildSharedAttributeKinds(form.variants),
  };
}

function parseCommonVatRate(value: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function applyCommonValuesToVariant(
  variant: VariantEditorState,
  commonValues: FamilyCommonValuesState,
): VariantEditorState {
  return {
    ...variant,
    brand: commonValues.brand.trim() ? commonValues.brand.trim() : null,
    subcategoryIds: [...commonValues.subcategoryIds],
    lifecycle: commonValues.lifecycle,
    priceVisibility: commonValues.priceVisibility,
    stockVisibility: commonValues.stockVisibility,
    visibility: commonValues.visibility,
    stockUnit: commonValues.stockUnit,
    vatRate: parseCommonVatRate(commonValues.vatRate),
    commercialMode: commonValues.commercialMode,
    attributes: syncAttributesToKinds(variant.attributes, commonValues.attributeKinds),
  };
}

function toPayload(
  form: FamilyEditorState,
  commonValues: FamilyCommonValuesState,
): ProductFamilyUpsertInput {
  return {
    ...form,
    variants: form.variants.map((variant) => {
      const { formKey, ...nextVariant } = applyCommonValuesToVariant(
        variant,
        commonValues,
      );
      void formKey;
      return nextVariant;
    }),
  };
}

function withVariantFormKeys(variants: ProductVariantInputDto[]): VariantEditorState[] {
  return variants.map((variant, index) => ({
    ...variant,
    formKey: `variant-${variant.id ?? index}`,
  }));
}

function updateVariantState(
  current: FamilyEditorState,
  formKey: string,
  updater: (variant: VariantEditorState) => VariantEditorState,
): FamilyEditorState {
  return {
    ...current,
    variants: current.variants.map((entry): VariantEditorState =>
      entry.formKey === formKey ? updater(entry) : entry,
    ),
  };
}

export default function ProductEditPage() {
  return (
    <Suspense fallback={<EditorLoading />}>
      <ProductEditPageContent />
    </Suspense>
  );
}

function ProductEditPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useStaffSessionContext();
  const familyId = Number(searchParams.get("id") ?? "");
  const isEdit = Number.isInteger(familyId) && familyId > 0;
  const canCreate = user ? canCreateProducts(user) : false;
  const canManage = user ? canManageProducts(user) : false;
  const [form, setForm] = useState<FamilyEditorState>(createEmptyFormState);
  const [commonValues, setCommonValues] = useState<FamilyCommonValuesState>(
    createEmptyCommonValuesState,
  );
  const [initialSnapshot, setInitialSnapshot] = useState("");
  const [options, setOptions] = useState<ProductFormOptionsDto>({ productSubcategories: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    void (async () => {
      try {
        const [formOptions, family] = await Promise.all([
          getProductFormOptionsClient(),
          isEdit ? getProductClient(familyId) : Promise.resolve(null),
        ]);

        if (cancelled) {
          return;
        }

        setOptions(formOptions);

        if (family) {
          const nextForm: FamilyEditorState = {
            ...family,
            variants: withVariantFormKeys(family.variants),
          };
          const nextCommonValues = deriveCommonValues(nextForm);
          setForm(nextForm);
          setCommonValues(nextCommonValues);
          setInitialSnapshot(JSON.stringify(toPayload(nextForm, nextCommonValues)));
        } else {
          const nextForm = createEmptyFormState();
          const nextCommonValues = deriveCommonValues(nextForm);
          setForm(nextForm);
          setCommonValues(nextCommonValues);
          setInitialSnapshot(JSON.stringify(toPayload(nextForm, nextCommonValues)));
        }
      } catch (err: unknown) {
        toast.error(
          err instanceof ProductsClientError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Impossible de charger l'éditeur produit.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [familyId, isEdit]);

  const isDirty = useMemo(
    () => JSON.stringify(toPayload(form, commonValues)) !== initialSnapshot,
    [commonValues, form, initialSnapshot],
  );

  const canSave = isEdit ? canManage : canCreate;

  const handleSave = async () => {
    if (!canSave) {
      toast.error("Accès refusé.");
      return false;
    }

    setIsSaving(true);
    try {
      const payload = toPayload(form, commonValues);
      const result = isEdit
        ? await updateProductClient(familyId, payload)
        : await createProductClient(payload);
      const nextForm: FamilyEditorState = {
        ...result,
        variants: withVariantFormKeys(result.variants),
      };
      const nextCommonValues = deriveCommonValues(nextForm);
      setForm(nextForm);
      setCommonValues(nextCommonValues);
      setInitialSnapshot(JSON.stringify(toPayload(nextForm, nextCommonValues)));
      toast.success(isEdit ? "Famille mise à jour." : "Famille créée.");
      if (!isEdit) {
        router.replace(`/espace/staff/gestion-des-produits/familles/edit?id=${result.id}`);
      }
      return true;
    } catch (err: unknown) {
      toast.error(
        err instanceof ProductsClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Impossible d'enregistrer la famille.",
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit || !canManage) {
      return;
    }

    const confirmed = window.confirm(`Supprimer la famille "${form.name}" ?`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteProductClient(familyId);
      toast.success("Famille supprimée.");
      router.replace("/espace/staff/gestion-des-produits/familles");
    } catch (err: unknown) {
      toast.error(
        err instanceof ProductsClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Impossible de supprimer la famille.",
      );
    }
  };

  const handleSharedAttributeKindsChange = (attributeKinds: string[]) => {
    setCommonValues((current) => ({
      ...current,
      attributeKinds,
    }));
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant) => ({
        ...variant,
        attributes: syncAttributesToKinds(variant.attributes, attributeKinds),
      })),
    }));
  };

  const handleVariantAttributesChange = (
    formKey: string,
    attributes: ProductAttributeInputDto[],
  ) => {
    const nextAttributeKinds = attributes.map((attribute) => attribute.kind);

    setCommonValues((current) => ({
      ...current,
      attributeKinds: nextAttributeKinds,
    }));
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant) => ({
        ...variant,
        attributes:
          variant.formKey === formKey
            ? syncAttributesToKinds(attributes, nextAttributeKinds)
            : syncAttributesToKinds(variant.attributes, nextAttributeKinds),
      })),
    }));
  };

  const moveVariant = (index: number, direction: "up" | "down") => {
    setForm((current) => {
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= current.variants.length) {
        return current;
      }

      const nextVariants = [...current.variants];
      [nextVariants[index], nextVariants[nextIndex]] = [
        nextVariants[nextIndex],
        nextVariants[index],
      ];

      let nextDefaultIndex = current.defaultVariantIndex;
      if (nextDefaultIndex === index) {
        nextDefaultIndex = nextIndex;
      } else if (nextDefaultIndex === nextIndex) {
        nextDefaultIndex = index;
      }

      return {
        ...current,
        variants: nextVariants,
        defaultVariantIndex: nextDefaultIndex,
      };
    });
  };

  if (isLoading) {
    return <EditorLoading />;
  }

  if (!canCreate && !isEdit) {
    return <StaffStateCard title="Accès refusé" description="Vous ne pouvez pas créer de famille produit." />;
  }

  return (
    <div className="space-y-6">
      <UnsavedChangesGuard isDirty={isDirty} onSaveAndContinue={handleSave} />

      <StaffPageHeader
        backHref="/espace/staff/gestion-des-produits/familles"
        eyebrow="Produits"
        title={isEdit ? form.name || "Famille produit" : "Nouvelle famille produit"}
        icon={Package}
      >
        {(() => {
          const subcategory = options.productSubcategories.find(s => commonValues.subcategoryIds.includes(s.id));
          const publicUrl = subcategory && isEdit
            ? `/produits/${subcategory.categorySlug}/${subcategory.slug}/famille/${form.slug}`
            : null;

          if (!publicUrl) return null;

          return (
            <AnimatedUIButton
              href={publicUrl}
              target="_blank"
              variant="ghost"
              size="sm"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Voir sur le site
              </span>
            </AnimatedUIButton>
          );
        })()}
      </StaffPageHeader>

      <div className="space-y-6">
        <Panel pretitle="Famille" title="Informations principales">
          <div className="flex flex-col gap-6 md:flex-row">
            <PanelField className="flex-2" id="family-name" label="Nom">
              <PanelInput id="family-name" fullWidth value={form.name} 
              onChange={(event) => setForm((current) => ({ 
                ...current, name: event.target.value, slug: slugify(event.target.value) 
              }))} />
            </PanelField>
            <PanelField className="flex-2" id="family-subtitle" label="Sous-titre">
              <PanelInput id="family-subtitle" fullWidth value={form.subtitle ?? ""} onChange={(event) => setForm((current) => ({ ...current, subtitle: event.target.value || null }))} />
            </PanelField>
            <PanelField className="flex-1" id="family-default" label="Variante par défaut">
              <StaffSelect
                id="family-default"
                
                value={String(form.defaultVariantIndex)}
                onValueChange={(value) => setForm((current) => ({ ...current, defaultVariantIndex: Number(value) }))}
                options={form.variants.map((variant, index) => ({
                  value: String(index),
                  label: variant.name || variant.sku || `Variante ${index + 1}`,
                }))}
              />
            </PanelField>
          </div>

          <PanelField id="family-description" label="Description">
            <Textarea
              id="family-description"
              value={form.description ?? ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value || null,
                }))
              }
              placeholder="Description de la famille..."
            />
          </PanelField>

          <PanelField id="family-description-seo" label="Description SEO">
            <DescriptionSEOTextArea id="family-description-seo" value={form.descriptionSeo ?? ""} onValueChange={(value) => setForm((current) => ({ ...current, descriptionSeo: value || null }))} />
          </PanelField>

          <StaffImageImporter
            label="Image principale"
            description="Optionnel : cette image represente la famille dans le catalogue."
            dialogTitle="Choisir l'image principale"
            dialogDescription="Selectionnez une image existante ou importez-en une nouvelle pour cette famille."
            mediaId={form.mainImageMediaId}
            onChange={(mediaId) =>
              setForm((current) => ({
                ...current,
                mainImageMediaId: mediaId,
              }))
            }
          />
        </Panel>

        <Panel
          pretitle="Famille"
          title="Valeurs communes"
          description="Ces valeurs seront appliquées à toutes les variantes lors de l'enregistrement."
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <PanelField id="family-common-brand" label="Marque">
              <PanelAutoCompleteInput
                id="family-common-brand"
                fullWidth
                value={commonValues.brand}
                suggestions={getProductBrandSuggestions(commonValues.brand)}
                onValueChange={(value) =>
                  setCommonValues((current) => ({
                    ...current,
                    brand: value ?? "",
                  }))
                }
              />
            </PanelField>

            <PanelField id="family-common-vat" label="TVA">
              <PanelInput
                id="family-common-vat"
                type="number"
                fullWidth
                value={commonValues.vatRate}
                onChange={(event) =>
                  setCommonValues((current) => ({
                    ...current,
                    vatRate: event.target.value,
                  }))
                }
              />
            </PanelField>

            <PanelField id="family-common-lifecycle" label="Cycle de vie">
              <StaffSelect
                id="family-common-lifecycle"
                fullWidth
                value={commonValues.lifecycle}
                onValueChange={(value) =>
                  setCommonValues((current) => ({
                    ...current,
                    lifecycle: value as ProductLifecycle,
                  }))
                }
                options={Object.values(ProductLifecycle).map((value) => ({
                  value,
                  label: formatEnumLabel(value),
                }))}
              />
            </PanelField>

            <PanelField id="family-common-commercial" label="Mode commercial">
              <StaffSelect
                id="family-common-commercial"
                fullWidth
                value={commonValues.commercialMode}
                onValueChange={(value) =>
                  setCommonValues((current) => ({
                    ...current,
                    commercialMode: value as ProductCommercialMode,
                  }))
                }
                options={Object.values(ProductCommercialMode).map((value) => ({
                  value,
                  label: formatEnumLabel(value),
                }))}
              />
            </PanelField>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <PanelField id="family-common-visibility" label="Visible">
              <StaffSelect
                id="family-common-visibility"
                fullWidth
                value={String(commonValues.visibility)}
                onValueChange={(value) =>
                  setCommonValues((current) => ({
                    ...current,
                    visibility: value === "true",
                  }))
                }
                options={[
                  { value: "true", label: "Oui" },
                  { value: "false", label: "Non" },
                ]}
              />
            </PanelField>

            <PanelField id="family-common-price-visible" label="Prix visible">
              <StaffSelect
                id="family-common-price-visible"
                fullWidth
                value={String(commonValues.priceVisibility)}
                onValueChange={(value) =>
                  setCommonValues((current) => ({
                    ...current,
                    priceVisibility: value === "true",
                  }))
                }
                options={[
                  { value: "true", label: "Oui" },
                  { value: "false", label: "Non" },
                ]}
              />
            </PanelField>

            <PanelField id="family-common-stock-visible" label="Stock visible">
              <StaffSelect
                id="family-common-stock-visible"
                fullWidth
                value={String(commonValues.stockVisibility)}
                onValueChange={(value) =>
                  setCommonValues((current) => ({
                    ...current,
                    stockVisibility: value === "true",
                  }))
                }
                options={[
                  { value: "true", label: "Oui" },
                  { value: "false", label: "Non" },
                ]}
              />
            </PanelField>

            <PanelField id="family-common-stock-unit" label="Unité de stock">
              <StaffSelect
                id="family-common-stock-unit"
                fullWidth
                value={commonValues.stockUnit ?? ""}
                onValueChange={(value) =>
                  setCommonValues((current) => ({
                    ...current,
                    stockUnit: value ? (value as ProductStockUnit) : null,
                  }))
                }
                options={Object.values(ProductStockUnit).map((value) => ({
                  value,
                  label: formatEnumLabel(value),
                }))}
              />
            </PanelField>
          </div>

          <ProductSubcategoriesField
            label="Sous-catégories communes"
            value={commonValues.subcategoryIds.map(String)}
            options={options.productSubcategories}
            onChange={(nextValue) =>
              setCommonValues((current) => ({
                ...current,
                subcategoryIds: nextValue.map(Number),
              }))
            }
          />

          <Panel pretitle="Attributs" title="Types partagés">
            <PanelAttributeKindsInput
              attributeKinds={commonValues.attributeKinds}
              onAttributeKindsChange={handleSharedAttributeKindsChange}
            />
          </Panel>
        </Panel>

        {form.variants.map((variant, index) => (
          <Panel
            key={variant.formKey}
            pretitle={`Variante ${index + 1}`}
            title={variant.name || variant.sku || `Variante ${index + 1}`}
            description="Chaque variante est un produit concret rattaché à la famille."
          >
            <div className="flex flex-wrap justify-end gap-2">
              <AnimatedUIButton
                type="button"
                variant="outline"
                icon="chevron-up"
                onClick={() => moveVariant(index, "up")}
                disabled={index === 0}
              >
                Monter
              </AnimatedUIButton>
              <AnimatedUIButton
                type="button"
                variant="outline"
                icon="chevron-down"
                onClick={() => moveVariant(index, "down")}
                disabled={index === form.variants.length - 1}
              >
                Descendre
              </AnimatedUIButton>
              <AnimatedUIButton
                type="button"
                variant="light"
                onClick={() =>
                  setForm((current) => {
                    if (current.variants.length === 1) {
                      return current;
                    }

                    const nextVariants = current.variants.filter(
                      (entry) => entry.formKey !== variant.formKey,
                    );

                    return {
                      ...current,
                      variants: nextVariants,
                      defaultVariantIndex:
                        current.defaultVariantIndex >= nextVariants.length
                          ? 0
                          : current.defaultVariantIndex,
                    };
                  })
                }
                disabled={form.variants.length === 1}
              >
                <span className="inline-flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Retirer
                </span>
              </AnimatedUIButton>
            </div>

            <div className="flex gap-6">
              <PanelField className="flex-3" id={`product-sku`} label="SKU">
                <PanelInput
                  fullWidth
                  id={`product-sku`}
                  
                  value={variant.sku}
                  onChange={(event) =>
                      setForm((current) =>
                        updateVariantState(current, variant.formKey, (entry) => ({
                          ...entry,
                          sku: event.target.value,
                        })),
                      )
                    }
                />
              </PanelField>

              <PanelField className="flex-4" id={`product-name`} label="Nom">
                <PanelInput
                fullWidth
                  id={`product-name`}
                  value={variant.name}
                  onChange={(event) =>
                    setForm((current) =>
                      updateVariantState(current, variant.formKey, (entry) => ({
                        ...entry,
                        slug: slugify(event.target.value),
                        name: event.target.value,
                      })),
                    )
                  }
                />
              </PanelField>

              <PanelField className="flex-2" id={`${variant.formKey}-price`} label="Prix de base">
                <PanelInput
                fullWidth
                  id={`${variant.formKey}-price`}
                  value={variant.basePriceAmount ?? ""}
                  onChange={(event) =>
                    setForm((current) =>
                      updateVariantState(current, variant.formKey, (entry) => ({
                        ...entry,
                        basePriceAmount: event.target.value || null,
                      })),
                    )
                  }
                />
              </PanelField>

              <PanelField className="flex-2" id={`${variant.formKey}-stock`} label="Stock">
                <PanelInput
                fullWidth
                  id={`${variant.formKey}-stock`}
                  value={variant.stock ?? ""}
                  onChange={(event) =>
                    setForm((current) =>
                      updateVariantState(current, variant.formKey, (entry) => ({
                        ...entry,
                        stock: event.target.value || null,
                      })),
                    )
                  }
                />
              </PanelField>
            </div>

            <div className="grid gap-6">
              <PanelField id="product-tags" label="Tags">
                <StaffTagInput
                  id="product-tags"
                  value={variant.tags.split(" ").filter((tag) => tag.trim() !== "")}
                  onChange={(s: string[]) =>
                    setForm((current) =>
                      updateVariantState(current, variant.formKey, (entry) => ({
                        ...entry,
                        tags: s.join(" "),
                      })),
                    )
                  }
                />
              </PanelField>

              <PanelField id={`${variant.formKey}-description`} label="Description">
                <ArticleRichTextEditor
                  editorId={`${variant.formKey}-description`}
                  value={variant.description ?? ""}
                  onChange={(value) =>
                    setForm((current) =>
                      updateVariantState(current, variant.formKey, (entry) => ({
                        ...entry,
                        description: value,
                      })),
                    )
                  }
                  placeholder="Description de la variante..."
                />
              </PanelField>

              <PanelField id={`${variant.formKey}-description-seo`} label="Description SEO">
                <DescriptionSEOTextArea
                  id={`${variant.formKey}-description-seo`}
                  value={variant.descriptionSeo ?? ""}
                  onValueChange={(value) =>
                    setForm((current) =>
                      updateVariantState(current, variant.formKey, (entry) => ({
                        ...entry,
                        descriptionSeo: value || null,
                      })),
                    )
                  }
                />
              </PanelField>

              <ProductMediaGrid
                items={variant.media}
                onChange={(nextMedia) =>
                  setForm((current) =>
                    updateVariantState(current, variant.formKey, (entry) => ({
                      ...entry,
                      media: nextMedia,
                    })),
                  )
                }
              />

              <StaffPdfImporter
                label="Fiche technique"
                description="Optionnel : associez une fiche technique PDF a cette variante."
                dialogTitle="Ajouter une fiche technique"
                dialogDescription="Choisissez un PDF existant ou importez-en un nouveau pour cette variante."
                value={variant.datasheet}
                onChange={(datasheet) =>
                  setForm((current) =>
                    updateVariantState(current, variant.formKey, (entry) => ({
                      ...entry,
                      datasheet,
                    })),
                  )
                }
              />

              {variant.attributes.length > 0 ? (
                <Panel pretitle="Attributs" title="Valeurs de la variante">
                  <PanelAttributesInput
                    attributes={variant.attributes}
                    onAttributesChange={(attributes: ProductAttributeInputDto[]) =>
                      handleVariantAttributesChange(variant.formKey, attributes)
                    }
                    lockKinds
                    canAddAttributes={false}
                    canRemoveAttributes={false}
                  />
                </Panel>
              ) : null}
            </div>
          </Panel>
        ))}

        <div className="flex flex-wrap gap-3">
          <AnimatedUIButton
            type="button"
            variant="outline"
            icon="plus"
            iconPosition="left"
            onClick={() =>
              setForm((current) => ({
                ...current,
                variants: [
                  ...current.variants,
                  applyCommonValuesToVariant(
                    createEmptyVariant(current.variants.length),
                    commonValues,
                  ),
                ],
              }))
            }
          >
            Ajouter une variante
          </AnimatedUIButton>
          <AnimatedUIButton type="button" variant="primary" onClick={() => void handleSave()} loading={isSaving} loadingText="Enregistrement...">
            Enregistrer
          </AnimatedUIButton>
          {isEdit ? (
            <AnimatedUIButton type="button" variant="light" onClick={() => void handleDelete()}>
              Supprimer
            </AnimatedUIButton>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function EditorLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-300 bg-white px-5 py-4 shadow-sm">
        <Loading />
      </div>
    </div>
  );
}
