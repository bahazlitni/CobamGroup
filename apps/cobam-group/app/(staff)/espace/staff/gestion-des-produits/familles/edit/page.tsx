"use client";

import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ExternalLink, Package, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Loading from "@/components/staff/Loading";
import ArticleRichTextEditor from "@/components/staff/articles/article-rich-text-editor";
import ProductCertificateSelector from "@/components/staff/products/ProductCertificateSelector";
import ProductMediaGrid from "@/components/staff/products/ProductMediaGrid";
import ProductSubcategoriesField from "@/components/staff/products/ProductSubcategoriesField";
import PanelAttributesInput from "@/components/staff/ui/PanelAttributesInput";
import Panel from "@/components/staff/ui/Panel";
import PanelField from "@/components/staff/ui/PanelField";
import PanelInput from "@/components/staff/ui/PanelInput";
import { normalizeProductAttributeKind } from "@/features/products/attribute-definitions";
import {
  PanelAttributeKindsInput,
  DescriptionSEOTextArea,
  StaffImageImporter,
  StaffPageHeader,
  StaffSelect,
  StaffStateCard,
  UnsavedChangesGuard,
  StaffTagInput,
} from "@/components/staff/ui";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  ProductTypeOptionDto,
  ProductVariantInputDto,
} from "@/features/products/types";
import { slugify } from "@/lib/slugify";
import formatEnumLabel from "@/lib/formatEnumLabel";
import {
  createDefaultProductEditFields,
  PRODUCT_AVAILABILITY_VALUES,
  PRODUCT_INVENTORY_VISIBILITY_VALUES,
  PRODUCT_PRICING_VISIBILITY_VALUES,
  STOCK_UNIT_VALUES,
} from "@/features/products/product-edit-fields";
import { PRODUCT_LIFECYCLE_VALUES } from "@/features/products/lifecycle";

type VariantEditorState = ProductVariantInputDto & { formKey: string };
type FamilyEditorState = Omit<ProductFamilyUpsertInput, "variants"> & {
  variants: VariantEditorState[];
};
type FamilyCommonValuesState = {
  productTypeId: number | null;
  brand: string;
  subcategoryIds: number[];
  visibleEcommerce: boolean;
  visibleVitrine: boolean;
  stockAlertThreshold: string;
  stockUnit: ProductVariantInputDto["stockUnit"];
  stockVisibility: ProductVariantInputDto["stockVisibility"];
  vatRate: string;
  guaranteeMonths: number;
  priceVisibility: ProductVariantInputDto["priceVisibility"];
  attributeKinds: string[];
  attributeTemplates: ProductAttributeInputDto[];
};
type LinkedProductFields = {
  displayName: boolean;
  slug: boolean;
  titleSeo: boolean;
  currentPriceTtcTnd: boolean;
};

const TITLE_SEO_MAX_LENGTH = 60;
const TITLE_SEO_SUFFIX = " | COBAM GROUP";

function buildLinkedTitleSeo(name: string) {
  const baseName = name.trim();

  if (!baseName) {
    return "";
  }

  const maxNameLength = TITLE_SEO_MAX_LENGTH - TITLE_SEO_SUFFIX.length;
  return `${baseName.slice(0, maxNameLength).trimEnd()}${TITLE_SEO_SUFFIX}`;
}

function truncateTitleSeo(value: string) {
  return value.slice(0, TITLE_SEO_MAX_LENGTH);
}

function nullableText(value: string) {
  return value.trim() ? value : null;
}

function nullableDecimalText(value: string) {
  return value.trim() ? value : null;
}

function getLinkedProductFields(variant: ProductVariantInputDto): LinkedProductFields {
  return {
    displayName: variant.displayName === variant.name,
    slug: variant.slug === slugify(variant.name),
    titleSeo: (variant.titleSeo ?? "") === buildLinkedTitleSeo(variant.name),
    currentPriceTtcTnd: (variant.currentPriceTtcTnd ?? "") === (variant.basePriceTtcTnd ?? ""),
  };
}

function buildVariantLinkState(variants: VariantEditorState[]) {
  return Object.fromEntries(
    variants.map((variant) => [variant.formKey, getLinkedProductFields(variant)]),
  );
}

function ProductFlagCheckbox({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="text-cobam-dark-blue flex min-h-11 items-center gap-3 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium"
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(Boolean(value))}
      />
      <span>{label}</span>
    </label>
  );
}

function LinkedFieldControl({
  isLinked,
  onLink,
  children,
}: {
  isLinked: boolean;
  onLink: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      {isLinked ? null : (
        <button
          type="button"
          className="border-cobam-water-blue/40 bg-cobam-water-blue/10 text-cobam-dark-blue hover:bg-cobam-water-blue/20 h-10 shrink-0 rounded-md border px-3 text-xs font-semibold transition"
          onClick={onLink}
        >
          lier
        </button>
      )}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function createEmptyVariant(index: number): VariantEditorState {
  return {
    formKey: `variant-${Date.now()}-${index}`,
    ...createDefaultProductEditFields(),
    sku: "",
    slug: "",
    name: "",
    description: null,
    descriptionSeo: null,
    brand: null,
    lifecycle: "DRAFT",
    tags: "",
    subcategoryIds: [],
    datasheets: [],
    certificates: [],
    certificateIds: [],
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
    productTypeId: null,
    brand: "",
    subcategoryIds: [],
    visibleEcommerce: true,
    visibleVitrine: true,
    stockAlertThreshold: "0",
    stockUnit: "PIECE",
    stockVisibility: "AUTO",
    vatRate: "19.000",
    guaranteeMonths: 0,
    priceVisibility: "AUTO",
    attributeKinds: [],
    attributeTemplates: [],
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

function flattenProductTypes(options: ProductFormOptionsDto) {
  return options.productTypeGroups.flatMap((group) => group.productTypes);
}

function buildTemplateAttributes(productType: ProductTypeOptionDto): ProductAttributeInputDto[] {
  return productType.attributes.map((attribute) => ({
    attributeDefId: attribute.attributeDefinitionId,
    attributeGroupId: attribute.groupId,
    kind: attribute.name,
    name: attribute.name,
    label: attribute.label,
    value: "",
    unit: attribute.unit,
    inputType: attribute.inputType,
    selectOptions: attribute.selectOptions,
    isRequired: attribute.isRequired,
    isFilterable: attribute.isFilterable,
    groupName: attribute.groupName,
    groupSortOrder: attribute.groupSortOrder,
    sortOrder: attribute.sortOrder,
  }));
}

function clearAttributeValues(attributes: ProductAttributeInputDto[]) {
  return attributes.map((attribute) => ({
    ...attribute,
    value: "",
  }));
}

function syncAttributesToKinds(
  attributes: ProductAttributeInputDto[],
  attributeKinds: string[],
): ProductAttributeInputDto[] {
  const attributeMap = new Map(
    attributes.map((attribute) => [normalizeProductAttributeKind(attribute.kind), attribute]),
  );

  return attributeKinds
    .map((kind) => normalizeProductAttributeKind(kind))
    .filter((kind, index, kinds) => Boolean(kind) && kinds.indexOf(kind) === index)
    .map((kind) => {
      const existingAttribute = attributeMap.get(kind);

      return {
        ...existingAttribute,
        kind,
        name: existingAttribute?.name ?? kind,
        label: existingAttribute?.label ?? existingAttribute?.name ?? kind,
        value: existingAttribute?.value ?? "",
      };
    });
}

function syncAttributesToTemplates(
  attributes: ProductAttributeInputDto[],
  templates: ProductAttributeInputDto[],
): ProductAttributeInputDto[] {
  const attributeMap = new Map(
    attributes.map((attribute) => [normalizeProductAttributeKind(attribute.kind), attribute]),
  );

  return templates.map((template) => {
    const existingAttribute = attributeMap.get(normalizeProductAttributeKind(template.kind));

    return {
      ...template,
      id: existingAttribute?.id,
      value: existingAttribute?.value ?? "",
    };
  });
}

function syncAttributesToCommonValues(
  attributes: ProductAttributeInputDto[],
  commonValues: FamilyCommonValuesState,
) {
  return commonValues.attributeTemplates.length > 0
    ? syncAttributesToTemplates(attributes, commonValues.attributeTemplates)
    : syncAttributesToKinds(attributes, commonValues.attributeKinds);
}

function deriveCommonValues(form: FamilyEditorState): FamilyCommonValuesState {
  const defaultVariant = getDefaultVariant(form);
  const productTypeId = defaultVariant.productTypeId ?? null;

  return {
    productTypeId,
    brand: defaultVariant.brand ?? "",
    subcategoryIds: [...defaultVariant.subcategoryIds],
    visibleEcommerce: defaultVariant.visibleEcommerce,
    visibleVitrine: defaultVariant.visibleVitrine,
    stockAlertThreshold: defaultVariant.stockAlertThreshold,
    stockUnit: defaultVariant.stockUnit,
    stockVisibility: defaultVariant.stockVisibility,
    vatRate: defaultVariant.vatRate,
    guaranteeMonths: defaultVariant.guaranteeMonths,
    priceVisibility: defaultVariant.priceVisibility,
    attributeKinds: buildSharedAttributeKinds(form.variants),
    attributeTemplates: clearAttributeValues(defaultVariant.attributes),
  };
}

function applyCommonValuesToVariant(
  variant: VariantEditorState,
  commonValues: FamilyCommonValuesState,
): VariantEditorState {
  return {
    ...variant,
    productTypeId: commonValues.productTypeId,
    brand: commonValues.brand.trim() ? commonValues.brand.trim() : null,
    subcategoryIds: [...commonValues.subcategoryIds],
    visibleEcommerce: commonValues.visibleEcommerce,
    visibleVitrine: commonValues.visibleVitrine,
    stockAlertThreshold: commonValues.stockAlertThreshold,
    stockUnit: commonValues.stockUnit,
    stockVisibility: commonValues.stockVisibility,
    vatRate: commonValues.vatRate,
    guaranteeMonths: commonValues.guaranteeMonths,
    priceVisibility: commonValues.priceVisibility,
    attributes: syncAttributesToCommonValues(variant.attributes, commonValues),
  };
}

function applyProductTypeTemplateToVariant(
  variant: VariantEditorState,
  productType: ProductTypeOptionDto,
): VariantEditorState {
  return {
    ...variant,
    productTypeId: productType.id,
    tags: productType.presetTags || variant.tags,
    subcategoryIds: productType.presetSubcategoryIds.length
      ? productType.presetSubcategoryIds
      : variant.subcategoryIds,
    stockUnit: productType.presetStockUnit ?? variant.stockUnit,
    vatRate: productType.presetVatRate ?? variant.vatRate,
    guaranteeMonths: productType.presetGuaranteeMonths ?? variant.guaranteeMonths,
    attributes: buildTemplateAttributes(productType),
  };
}

function applyProductTypeTemplateToForm(
  form: FamilyEditorState,
  productType: ProductTypeOptionDto,
): FamilyEditorState {
  return {
    ...form,
    variants: form.variants.map((variant) =>
      applyProductTypeTemplateToVariant(variant, productType),
    ),
  };
}

function toPayload(
  form: FamilyEditorState,
  commonValues: FamilyCommonValuesState,
): ProductFamilyUpsertInput {
  return {
    ...form,
    variants: form.variants.map((variant) => {
      const { formKey, ...nextVariant } = applyCommonValuesToVariant(variant, commonValues);
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
    variants: current.variants.map(
      (entry): VariantEditorState => (entry.formKey === formKey ? updater(entry) : entry),
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
  const requestedProductTypeId = Number(searchParams.get("type") ?? "");
  const isEdit = Number.isInteger(familyId) && familyId > 0;
  const requestedProductTypeIsValid =
    Number.isInteger(requestedProductTypeId) && requestedProductTypeId > 0;
  const canCreate = user ? canCreateProducts(user) : false;
  const canManage = user ? canManageProducts(user) : false;
  const [form, setForm] = useState<FamilyEditorState>(createEmptyFormState);
  const [commonValues, setCommonValues] = useState<FamilyCommonValuesState>(
    createEmptyCommonValuesState,
  );
  const [variantLinks, setVariantLinks] = useState<Record<string, LinkedProductFields>>({});
  const [initialSnapshot, setInitialSnapshot] = useState("");
  const [options, setOptions] = useState<ProductFormOptionsDto>({
    productSubcategories: [],
    productTypeGroups: [],
    productBrandOptions: [],
    certificates: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const lockSharedAttributes = commonValues.productTypeId != null;

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
          setVariantLinks(buildVariantLinkState(nextForm.variants));
          setInitialSnapshot(JSON.stringify(toPayload(nextForm, nextCommonValues)));
        } else {
          const selectedProductType = requestedProductTypeIsValid
            ? flattenProductTypes(formOptions).find(
                (productType) => productType.id === requestedProductTypeId,
              )
            : null;
          const emptyForm = createEmptyFormState();
          const nextForm = selectedProductType
            ? applyProductTypeTemplateToForm(emptyForm, selectedProductType)
            : emptyForm;
          const nextCommonValues = deriveCommonValues(nextForm);
          setForm(nextForm);
          setCommonValues(nextCommonValues);
          setVariantLinks(buildVariantLinkState(nextForm.variants));
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
  }, [familyId, isEdit, requestedProductTypeId, requestedProductTypeIsValid]);

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
      setVariantLinks(buildVariantLinkState(nextForm.variants));
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

  const handleSharedAttributeKindsChange = (
    attributeKinds: string[],
    attributeTemplates: ProductAttributeInputDto[],
  ) => {
    if (lockSharedAttributes) {
      return;
    }

    setCommonValues((current) => ({
      ...current,
      attributeKinds,
      attributeTemplates,
    }));
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant) => ({
        ...variant,
        attributes: syncAttributesToTemplates(variant.attributes, attributeTemplates),
      })),
    }));
  };

  const handleVariantAttributesChange = (
    formKey: string,
    attributes: ProductAttributeInputDto[],
  ) => {
    if (lockSharedAttributes) {
      setForm((current) =>
        updateVariantState(current, formKey, (entry) => ({
          ...entry,
          attributes: syncAttributesToTemplates(attributes, commonValues.attributeTemplates),
        })),
      );
      return;
    }

    const nextAttributeKinds = attributes.map((attribute) => attribute.kind);
    const nextAttributeTemplates = clearAttributeValues(attributes);

    setCommonValues((current) => ({
      ...current,
      attributeKinds: nextAttributeKinds,
      attributeTemplates: nextAttributeTemplates,
    }));
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant) => ({
        ...variant,
        attributes:
          variant.formKey === formKey
            ? syncAttributesToTemplates(attributes, nextAttributeTemplates)
            : syncAttributesToTemplates(variant.attributes, nextAttributeTemplates),
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

  const updateVariantLinkedFields = (
    formKey: string,
    updater: (fields: LinkedProductFields) => LinkedProductFields,
  ) => {
    setVariantLinks((current) => {
      const variant = form.variants.find((entry) => entry.formKey === formKey);
      const currentFields =
        current[formKey] ??
        (variant
          ? getLinkedProductFields(variant)
          : {
              displayName: true,
              slug: true,
              titleSeo: true,
              currentPriceTtcTnd: true,
            });

      return {
        ...current,
        [formKey]: updater(currentFields),
      };
    });
  };

  const getVariantLinks = (variant: VariantEditorState) =>
    variantLinks[variant.formKey] ?? getLinkedProductFields(variant);

  const handleVariantNameChanged = (formKey: string, name: string) => {
    const links = variantLinks[formKey];

    setForm((current) =>
      updateVariantState(current, formKey, (entry) => {
        const currentLinks = links ?? getLinkedProductFields(entry);

        return {
          ...entry,
          name,
          displayName: currentLinks.displayName ? name : entry.displayName,
          slug: currentLinks.slug ? slugify(name) : entry.slug,
          titleSeo: currentLinks.titleSeo
            ? nullableText(buildLinkedTitleSeo(name))
            : entry.titleSeo,
        };
      }),
    );
  };

  const handleVariantDisplayNameChanged = (formKey: string, displayName: string) => {
    updateVariantLinkedFields(formKey, (fields) => ({ ...fields, displayName: false }));
    setForm((current) =>
      updateVariantState(current, formKey, (entry) => ({
        ...entry,
        displayName,
      })),
    );
  };

  const handleVariantSlugChanged = (formKey: string, slug: string) => {
    updateVariantLinkedFields(formKey, (fields) => ({ ...fields, slug: false }));
    setForm((current) =>
      updateVariantState(current, formKey, (entry) => ({
        ...entry,
        slug,
      })),
    );
  };

  const handleVariantTitleSeoChanged = (formKey: string, titleSeo: string) => {
    updateVariantLinkedFields(formKey, (fields) => ({ ...fields, titleSeo: false }));
    setForm((current) =>
      updateVariantState(current, formKey, (entry) => ({
        ...entry,
        titleSeo: nullableText(truncateTitleSeo(titleSeo)),
      })),
    );
  };

  const handleVariantBasePriceChanged = (formKey: string, basePrice: string) => {
    const links = variantLinks[formKey];
    const basePriceTtcTnd = nullableDecimalText(basePrice);

    setForm((current) =>
      updateVariantState(current, formKey, (entry) => {
        const currentLinks = links ?? getLinkedProductFields(entry);

        return {
          ...entry,
          basePriceTtcTnd,
          currentPriceTtcTnd: currentLinks.currentPriceTtcTnd
            ? basePriceTtcTnd
            : entry.currentPriceTtcTnd,
        };
      }),
    );
  };

  const handleVariantCurrentPriceChanged = (formKey: string, currentPrice: string) => {
    updateVariantLinkedFields(formKey, (fields) => ({
      ...fields,
      currentPriceTtcTnd: false,
    }));
    setForm((current) =>
      updateVariantState(current, formKey, (entry) => ({
        ...entry,
        currentPriceTtcTnd: nullableDecimalText(currentPrice),
      })),
    );
  };

  const relinkVariantField = (formKey: string, field: keyof LinkedProductFields) => {
    updateVariantLinkedFields(formKey, (fields) => ({ ...fields, [field]: true }));
    setForm((current) =>
      updateVariantState(current, formKey, (entry) => {
        switch (field) {
          case "displayName":
            return { ...entry, displayName: entry.name };
          case "slug":
            return { ...entry, slug: slugify(entry.name) };
          case "titleSeo":
            return {
              ...entry,
              titleSeo: nullableText(buildLinkedTitleSeo(entry.name)),
            };
          case "currentPriceTtcTnd":
            return { ...entry, currentPriceTtcTnd: entry.basePriceTtcTnd };
          default:
            return entry;
        }
      }),
    );
  };

  if (isLoading) {
    return <EditorLoading />;
  }

  if (!canCreate && !isEdit) {
    return (
      <StaffStateCard
        title="Accès refusé"
        description="Vous ne pouvez pas créer de famille produit."
      />
    );
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
          const subcategory = options.productSubcategories.find((s) =>
            commonValues.subcategoryIds.includes(s.id),
          );
          const publicUrl =
            subcategory && isEdit
              ? `/produits/${subcategory.categorySlug}/${subcategory.slug}/famille/${form.slug}`
              : null;

          if (!publicUrl) return null;

          return (
            <AnimatedUIButton href={publicUrl} target="_blank" variant="ghost" size="sm">
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
              <PanelInput
                id="family-name"
                fullWidth
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                    slug: slugify(event.target.value),
                  }))
                }
              />
            </PanelField>
            <PanelField className="flex-2" id="family-subtitle" label="Sous-titre">
              <PanelInput
                id="family-subtitle"
                fullWidth
                value={form.subtitle ?? ""}
                onChange={(event) =>
                  setForm((current) => ({ ...current, subtitle: event.target.value || null }))
                }
              />
            </PanelField>
            <PanelField className="flex-1" id="family-default" label="Variante par défaut">
              <StaffSelect
                id="family-default"
                value={String(form.defaultVariantIndex)}
                onValueChange={(value) =>
                  setForm((current) => ({ ...current, defaultVariantIndex: Number(value) }))
                }
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
            <DescriptionSEOTextArea
              id="family-description-seo"
              value={form.descriptionSeo ?? ""}
              onValueChange={(value) =>
                setForm((current) => ({ ...current, descriptionSeo: value || null }))
              }
            />
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <PanelField id="family-common-brand" label="Marque">
              <StaffSelect
                id="family-common-brand"
                fullWidth
                value={commonValues.brand || null}
                placeholder="Selectionner une marque"
                emptyLabel="Aucune marque"
                options={options.productBrandOptions.map((brand) => ({
                  value: brand,
                  label: brand,
                }))}
                onValueChange={(value) =>
                  setCommonValues((current) => ({
                    ...current,
                    brand: value || "",
                  }))
                }
              />
            </PanelField>

            <PanelField id="family-common-stock-unit" label="Unité de stock">
              <StaffSelect
                id="family-common-stock-unit"
                fullWidth
                value={commonValues.stockUnit}
                onValueChange={(stockUnit) =>
                  setCommonValues((current) => ({
                    ...current,
                    stockUnit: stockUnit as typeof current.stockUnit,
                  }))
                }
                options={STOCK_UNIT_VALUES.map((value) => ({
                  value,
                  label: formatEnumLabel(value),
                }))}
              />
            </PanelField>

            <PanelField id="family-common-stock-alert" label="Seuil d'alerte">
              <PanelInput
                id="family-common-stock-alert"
                fullWidth
                inputMode="decimal"
                value={commonValues.stockAlertThreshold}
                onChange={(event) =>
                  setCommonValues((current) => ({
                    ...current,
                    stockAlertThreshold: event.target.value,
                  }))
                }
              />
            </PanelField>

            <PanelField id="family-common-stock-visibility" label="Affichage stock">
              <StaffSelect
                id="family-common-stock-visibility"
                fullWidth
                value={commonValues.stockVisibility}
                onValueChange={(stockVisibility) =>
                  setCommonValues((current) => ({
                    ...current,
                    stockVisibility: stockVisibility as typeof current.stockVisibility,
                  }))
                }
                options={PRODUCT_INVENTORY_VISIBILITY_VALUES.map((value) => ({
                  value,
                  label: formatEnumLabel(value),
                }))}
              />
            </PanelField>

            <PanelField id="family-common-vat-rate" label="TVA">
              <PanelInput
                id="family-common-vat-rate"
                fullWidth
                inputMode="decimal"
                value={commonValues.vatRate}
                onChange={(event) =>
                  setCommonValues((current) => ({
                    ...current,
                    vatRate: event.target.value,
                  }))
                }
              />
            </PanelField>

            <PanelField id="family-common-guarantee" label="Garantie (mois)">
              <PanelInput
                id="family-common-guarantee"
                fullWidth
                type="number"
                min={0}
                value={commonValues.guaranteeMonths}
                onChange={(event) =>
                  setCommonValues((current) => ({
                    ...current,
                    guaranteeMonths: Number(event.target.value || 0),
                  }))
                }
              />
            </PanelField>

            <PanelField id="family-common-price-visibility" label="Affichage prix">
              <StaffSelect
                id="family-common-price-visibility"
                fullWidth
                value={commonValues.priceVisibility}
                onValueChange={(priceVisibility) =>
                  setCommonValues((current) => ({
                    ...current,
                    priceVisibility: priceVisibility as typeof current.priceVisibility,
                  }))
                }
                options={PRODUCT_PRICING_VISIBILITY_VALUES.map((value) => ({
                  value,
                  label: formatEnumLabel(value),
                }))}
              />
            </PanelField>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <ProductFlagCheckbox
              id="family-common-visible-ecommerce"
              label="Visibilité e-commerce"
              checked={commonValues.visibleEcommerce}
              onCheckedChange={(visibleEcommerce) =>
                setCommonValues((current) => ({
                  ...current,
                  visibleEcommerce,
                }))
              }
            />
            <ProductFlagCheckbox
              id="family-common-visible-vitrine"
              label="Visibilité vitrine"
              checked={commonValues.visibleVitrine}
              onCheckedChange={(visibleVitrine) =>
                setCommonValues((current) => ({
                  ...current,
                  visibleVitrine,
                }))
              }
            />
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

          <Panel
            pretitle="Attributs"
            title={lockSharedAttributes ? "Modèle appliqué" : "Types partagés"}
            description={
              lockSharedAttributes
                ? "Les attributs proviennent du modèle choisi. Les variantes peuvent uniquement renseigner les valeurs."
                : undefined
            }
          >
            {lockSharedAttributes ? (
              <div className="flex flex-wrap gap-2">
                {commonValues.attributeTemplates.length > 0 ? (
                  commonValues.attributeTemplates.map((attribute) => (
                    <span
                      key={`${attribute.attributeDefId ?? attribute.kind}-${attribute.kind}`}
                      className="text-cobam-dark-blue rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-medium"
                    >
                      {attribute.label || attribute.name || attribute.kind}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">
                    Ce modèle ne configure aucun attribut.
                  </span>
                )}
              </div>
            ) : (
              <PanelAttributeKindsInput
                attributeKinds={commonValues.attributeKinds}
                onAttributeKindsChange={handleSharedAttributeKindsChange}
              />
            )}
          </Panel>
        </Panel>

        {form.variants.map((variant, index) => {
          const linkedFields = getVariantLinks(variant);

          return (
            <Panel
              key={variant.formKey}
              pretitle={`Variante ${index + 1}`}
              title={variant.name || variant.sku || `Variante ${index + 1}`}
              description="Chaque variante est un produit concret rattaché à la famille."
              allowOverflow
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

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <PanelField id={`${variant.formKey}-sku`} label="SKU">
                  <PanelInput
                    fullWidth
                    id={`${variant.formKey}-sku`}
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

                <PanelField className="xl:col-span-2" id={`${variant.formKey}-name`} label="Nom">
                  <PanelInput
                    fullWidth
                    id={`${variant.formKey}-name`}
                    value={variant.name}
                    onChange={(event) =>
                      handleVariantNameChanged(variant.formKey, event.target.value)
                    }
                  />
                </PanelField>

                <PanelField id={`${variant.formKey}-display-name`} label="Nom affiché">
                  <LinkedFieldControl
                    isLinked={linkedFields.displayName}
                    onLink={() => relinkVariantField(variant.formKey, "displayName")}
                  >
                    <PanelInput
                      id={`${variant.formKey}-display-name`}
                      fullWidth
                      value={variant.displayName}
                      onChange={(event) =>
                        handleVariantDisplayNameChanged(variant.formKey, event.target.value)
                      }
                    />
                  </LinkedFieldControl>
                </PanelField>

                <PanelField id={`${variant.formKey}-lifecycle`} label="Cycle de vie">
                  <StaffSelect
                    id={`${variant.formKey}-lifecycle`}
                    fullWidth
                    value={variant.lifecycle}
                    onValueChange={(lifecycle) =>
                      setForm((current) =>
                        updateVariantState(current, variant.formKey, (entry) => ({
                          ...entry,
                          lifecycle: lifecycle as typeof entry.lifecycle,
                        })),
                      )
                    }
                    options={PRODUCT_LIFECYCLE_VALUES.map((value) => ({
                      value,
                      label: formatEnumLabel(value),
                    }))}
                  />
                </PanelField>

                <PanelField id={`${variant.formKey}-slug`} label="Slug">
                  <LinkedFieldControl
                    isLinked={linkedFields.slug}
                    onLink={() => relinkVariantField(variant.formKey, "slug")}
                  >
                    <PanelInput
                      id={`${variant.formKey}-slug`}
                      fullWidth
                      value={variant.slug}
                      onChange={(event) =>
                        handleVariantSlugChanged(variant.formKey, event.target.value)
                      }
                    />
                  </LinkedFieldControl>
                </PanelField>

                <PanelField
                  id={`${variant.formKey}-title-seo`}
                  label="Titre SEO"
                  hint={`${(variant.titleSeo ?? "").length}/${TITLE_SEO_MAX_LENGTH}`}
                >
                  <LinkedFieldControl
                    isLinked={linkedFields.titleSeo}
                    onLink={() => relinkVariantField(variant.formKey, "titleSeo")}
                  >
                    <PanelInput
                      id={`${variant.formKey}-title-seo`}
                      fullWidth
                      maxLength={TITLE_SEO_MAX_LENGTH}
                      value={variant.titleSeo ?? ""}
                      onChange={(event) =>
                        handleVariantTitleSeoChanged(variant.formKey, event.target.value)
                      }
                    />
                  </LinkedFieldControl>
                </PanelField>

                <PanelField
                  className="md:col-span-2"
                  id={`${variant.formKey}-description-seo`}
                  label="Description SEO"
                >
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

                <PanelField className="md:col-span-4" id={`${variant.formKey}-tags`} label="Tags">
                  <StaffTagInput
                    id={`${variant.formKey}-tags`}
                    value={variant.tags.split(" ").filter((tag) => tag.trim() !== "")}
                    onChange={(tags: string[]) =>
                      setForm((current) =>
                        updateVariantState(current, variant.formKey, (entry) => ({
                          ...entry,
                          tags: tags.join(" "),
                        })),
                      )
                    }
                  />
                </PanelField>
              </div>

              <div className="grid gap-6">
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

                <div className="space-y-3">
                  <h3 className="text-cobam-dark-blue text-sm font-semibold">Mise en avant</h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <ProductFlagCheckbox
                      id={`${variant.formKey}-featured`}
                      label="Mis en avant"
                      checked={variant.isFeatured}
                      onCheckedChange={(isFeatured) =>
                        setForm((current) =>
                          updateVariantState(current, variant.formKey, (entry) => ({
                            ...entry,
                            isFeatured,
                          })),
                        )
                      }
                    />
                    <ProductFlagCheckbox
                      id={`${variant.formKey}-new`}
                      label="Nouveau"
                      checked={variant.isNew}
                      onCheckedChange={(isNew) =>
                        setForm((current) =>
                          updateVariantState(current, variant.formKey, (entry) => ({
                            ...entry,
                            isNew,
                          })),
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-cobam-dark-blue text-sm font-semibold">Stock</h3>
                  <div className="grid gap-5 md:grid-cols-2">
                    <PanelField id={`${variant.formKey}-stock-available`} label="Stock disponible">
                      <PanelInput
                        id={`${variant.formKey}-stock-available`}
                        fullWidth
                        inputMode="decimal"
                        value={variant.stockAvailable}
                        onChange={(event) =>
                          setForm((current) =>
                            updateVariantState(current, variant.formKey, (entry) => ({
                              ...entry,
                              stockAvailable: event.target.value,
                            })),
                          )
                        }
                      />
                    </PanelField>
                    <PanelField id={`${variant.formKey}-stock-availability`} label="Disponibilité">
                      <StaffSelect
                        id={`${variant.formKey}-stock-availability`}
                        fullWidth
                        value={variant.stockAvailability}
                        onValueChange={(stockAvailability) =>
                          setForm((current) =>
                            updateVariantState(current, variant.formKey, (entry) => ({
                              ...entry,
                              stockAvailability:
                                stockAvailability as typeof entry.stockAvailability,
                            })),
                          )
                        }
                        options={PRODUCT_AVAILABILITY_VALUES.map((value) => ({
                          value,
                          label: formatEnumLabel(value),
                        }))}
                      />
                    </PanelField>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-cobam-dark-blue text-sm font-semibold">Tarification</h3>
                  <div className="grid gap-5 md:grid-cols-2">
                    <PanelField id={`${variant.formKey}-base-price`} label="Prix de base TTC">
                      <PanelInput
                        id={`${variant.formKey}-base-price`}
                        fullWidth
                        inputMode="decimal"
                        value={variant.basePriceTtcTnd ?? ""}
                        onChange={(event) =>
                          handleVariantBasePriceChanged(variant.formKey, event.target.value)
                        }
                      />
                    </PanelField>
                    <PanelField id={`${variant.formKey}-current-price`} label="Prix actuel TTC">
                      <LinkedFieldControl
                        isLinked={linkedFields.currentPriceTtcTnd}
                        onLink={() => relinkVariantField(variant.formKey, "currentPriceTtcTnd")}
                      >
                        <PanelInput
                          id={`${variant.formKey}-current-price`}
                          fullWidth
                          inputMode="decimal"
                          value={variant.currentPriceTtcTnd ?? ""}
                          onChange={(event) =>
                            handleVariantCurrentPriceChanged(variant.formKey, event.target.value)
                          }
                        />
                      </LinkedFieldControl>
                    </PanelField>
                  </div>
                </div>

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
                  title="Galerie"
                  description="Le premier média devient la couverture de la variante."
                />

                <div className="space-y-8">
                  <ProductMediaGrid
                    items={variant.datasheets}
                    onChange={(datasheets) =>
                      setForm((current) =>
                        updateVariantState(current, variant.formKey, (entry) => ({
                          ...entry,
                          datasheets,
                        })),
                      )
                    }
                    title="Fiches techniques"
                    description="Ajoutez une ou plusieurs fiches techniques PDF, puis glissez-les pour definir leur ordre."
                    pickerTitle="Ajouter une fiche technique"
                    pickerDescription="Choisissez un PDF existant ou importez-en un nouveau pour cette variante."
                    addButtonLabel="Ajouter une fiche"
                    addButtonHint="PDF uniquement"
                    mediaKind="DOCUMENT"
                    documentExtensions={["pdf"]}
                    role="TECHNICAL"
                  />

                  <ProductMediaGrid
                    items={variant.certificates}
                    onChange={(certificates) =>
                      setForm((current) =>
                        updateVariantState(current, variant.formKey, (entry) => ({
                          ...entry,
                          certificates,
                        })),
                      )
                    }
                    title="Certificats"
                    description="Ajoutez un ou plusieurs certificats PDF, puis glissez-les pour definir leur ordre."
                    pickerTitle="Ajouter un certificat"
                    pickerDescription="Choisissez un PDF existant ou importez-en un nouveau pour cette variante."
                    addButtonLabel="Ajouter un certificat"
                    addButtonHint="PDF uniquement"
                    mediaKind="DOCUMENT"
                    documentExtensions={["pdf"]}
                    role="CERTIFICATE"
                  />

                  <ProductCertificateSelector
                    options={options.certificates}
                    selectedIds={variant.certificateIds}
                    onChange={(certificateIds) =>
                      setForm((current) =>
                        updateVariantState(current, variant.formKey, (entry) => ({
                          ...entry,
                          certificateIds,
                        })),
                      )
                    }
                  />
                </div>

                {variant.attributes.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="text-cobam-dark-blue text-sm font-semibold">
                      Valeurs de la variante
                    </h3>
                    <PanelAttributesInput
                      attributes={variant.attributes}
                      onAttributesChange={(attributes: ProductAttributeInputDto[]) =>
                        handleVariantAttributesChange(variant.formKey, attributes)
                      }
                      lockKinds
                      canAddAttributes={false}
                      canRemoveAttributes={false}
                    />
                  </div>
                ) : null}
              </div>
            </Panel>
          );
        })}

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
          <AnimatedUIButton
            type="button"
            variant="primary"
            onClick={() => void handleSave()}
            loading={isSaving}
            loadingText="Enregistrement..."
          >
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
      <div className="inline-flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-5 py-4 shadow-sm">
        <Loading />
      </div>
    </div>
  );
}
