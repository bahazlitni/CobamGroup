"use client";

import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ProductLifecycle } from "@prisma/client";
import { ExternalLink, Package } from "lucide-react";
import { toast } from "sonner";
import Loading from "@/components/staff/Loading";
import ProductMediaGrid from "@/components/staff/products/ProductMediaGrid";
import ProductSubcategoriesField from "@/components/staff/products/ProductSubcategoriesField";
import Panel from "@/components/staff/ui/Panel";
import PanelField from "@/components/staff/ui/PanelField";
import PanelInput from "@/components/staff/ui/PanelInput";
import {
  AiPanelAttributesInput,
  AiPanelRichText,
  AiPanelTagsInput,
  DescriptionSEOTextArea,
  StaffPageHeader,
  StaffPdfImporter,
  StaffSelect,
  StaffStateCard,
  UnsavedChangesGuard,
} from "@/components/staff/ui";
import {
  AiSuggestionActionsRow,
  AI_SUGGESTION_TOKEN_CLASS,
} from "@/components/staff/ui/ai-suggestion";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";
import type { ProductAttributeInputDto, ProductTypeOptionDto } from "@/features/products/types";
import {
  createDefaultProductEditFields,
  PRODUCT_AVAILABILITY_VALUES,
  PRODUCT_INVENTORY_VISIBILITY_VALUES,
  PRODUCT_PRICING_VISIBILITY_VALUES,
  STOCK_UNIT_VALUES,
} from "@/features/products/product-edit-fields";
import { canCreateProducts, canManageProducts } from "@/features/products/access";
import {
  createSingleProductClient,
  deleteSingleProductClient,
  getSingleProductClient,
  getSingleProductFormOptionsClient,
  SingleProductsClientError,
  suggestSingleProductAiClient,
  updateSingleProductClient,
} from "@/features/single-products/client";
import type {
  SingleProductAiSuggestionResponse,
  SingleProductDetailDto,
  SingleProductFormOptionsDto,
  SingleProductUpsertInput,
} from "@/features/single-products/types";
import { slugify } from "@/lib/slugify";
import ProductEssentialEntries from "@/components/staff/products/ProductEssentialEntries";
import { getArticlePlainText } from "@/features/articles/document";
import { cn } from "@/lib/utils";
import formatEnumLabel from "@/lib/formatEnumLabel";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

type SimpleProductAiSuggestions = {
  descriptionPreview: string | null;
  descriptionRichText: string | null;
  descriptionSeo: string | null;
  tags: string[] | null;
  attributes: ProductAttributeInputDto[] | null;
  subcategoryIds: number[] | null;
};

type LinkedProductFields = {
  displayName: boolean;
  slug: boolean;
  titleSeo: boolean;
  currentPriceTtcTnd: boolean;
};

const TITLE_SEO_MAX_LENGTH = 60;
const TITLE_SEO_SUFFIX = " | COBAM GROUP";

function emptyAiSuggestions(): SimpleProductAiSuggestions {
  return {
    descriptionPreview: null,
    descriptionRichText: null,
    descriptionSeo: null,
    tags: null,
    attributes: null,
    subcategoryIds: null,
  };
}

function hasActiveAiSuggestions(suggestions: SimpleProductAiSuggestions) {
  return Boolean(
    suggestions.descriptionRichText ||
    suggestions.descriptionSeo ||
    suggestions.tags?.length ||
    suggestions.attributes?.length ||
    suggestions.subcategoryIds?.length,
  );
}

function mapAiResponseToSuggestions(
  response: SingleProductAiSuggestionResponse,
): SimpleProductAiSuggestions {
  return {
    descriptionPreview:
      getArticlePlainText(response.descriptionRichText) || response.descriptionText || null,
    descriptionRichText: response.descriptionRichText || null,
    descriptionSeo: response.descriptionSeo || null,
    tags: response.tags.length > 0 ? response.tags : null,
    attributes: response.attributes.length > 0 ? response.attributes : null,
    subcategoryIds: response.subcategoryIds.length > 0 ? response.subcategoryIds : null,
  };
}

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

function getLinkedProductFields(form: SingleProductUpsertInput): LinkedProductFields {
  return {
    displayName: form.displayName === form.name,
    slug: form.slug === slugify(form.name),
    titleSeo: (form.titleSeo ?? "") === buildLinkedTitleSeo(form.name),
    currentPriceTtcTnd: (form.currentPriceTtcTnd ?? "") === (form.basePriceTtcTnd ?? ""),
  };
}

function normalizeText(value: string | null | undefined) {
  return (value ?? "").trim().toLocaleLowerCase("fr-FR");
}

function splitTags(value: string) {
  return value.split(" ").filter((tag) => tag.trim() !== "");
}

function mergeTags(currentTags: string[], suggestedTags: string[]) {
  const seen = new Set<string>();

  return [...currentTags, ...suggestedTags].filter((tag) => {
    const key = normalizeText(tag);

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function areAttributesEqual(left: ProductAttributeInputDto[], right: ProductAttributeInputDto[]) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((attribute, index) => {
    const other = right[index];

    return (
      normalizeText(attribute.kind) === normalizeText(other?.kind) &&
      normalizeText(attribute.value) === normalizeText(other?.value)
    );
  });
}

function areNumberArraysEqual(left: number[], right: number[]) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

function createEmptyFormState(): SingleProductUpsertInput {
  return {
    ...createDefaultProductEditFields(),
    productTypeId: null,
    sku: "",
    slug: "",
    name: "",
    description: null,
    descriptionSeo: null,
    brand: null,
    lifecycle: "ACTIVE",
    tags: "",
    subcategoryIds: [],
    datasheet: null,
    media: [],
    attributes: [],
  };
}

function mapProductToForm(product: SingleProductDetailDto): SingleProductUpsertInput {
  return {
    ...createDefaultProductEditFields(product),
    productTypeId: product.productTypeId ?? null,
    sku: product.sku,
    slug: product.slug,
    name: product.name,
    displayName: product.displayName,
    description: product.description,
    shortDescription: product.shortDescription,
    titleSeo: product.titleSeo,
    descriptionSeo: product.descriptionSeo,
    guaranteeMonths: product.guaranteeMonths,
    brand: product.brand,
    lifecycle: product.lifecycle,
    visibleEcommerce: product.visibleEcommerce,
    visibleVitrine: product.visibleVitrine,
    isFeatured: product.isFeatured,
    isPromoted: product.isPromoted,
    isNew: product.isNew,
    stockAvailable: product.stockAvailable,
    stockAlertThreshold: product.stockAlertThreshold,
    stockUnit: product.stockUnit,
    stockAvailability: product.stockAvailability,
    stockVisibility: product.stockVisibility,
    basePriceTtcTnd: product.basePriceTtcTnd,
    currentPriceTtcTnd: product.currentPriceTtcTnd,
    vatRate: product.vatRate,
    priceVisibility: product.priceVisibility,
    tags: product.tags,
    subcategoryIds: product.subcategoryIds,
    datasheet: product.datasheet,
    media: product.media,
    attributes: product.attributes,
  };
}

function flattenProductTypes(options: SingleProductFormOptionsDto) {
  return options.productTypeGroups.flatMap((group) => group.productTypes);
}

function buildTemplateAttributes(productType: ProductTypeOptionDto): ProductAttributeInputDto[] {
  return productType.attributes.map((attribute) => ({
    attributeDefId: attribute.id,
    attributeGroupId: attribute.groupId,
    kind: attribute.name,
    name: attribute.name,
    label: attribute.label,
    value: "",
    unit: attribute.unit,
    inputType: attribute.inputType,
    isRequired: attribute.isRequired,
    isFilterable: attribute.isFilterable,
    groupName: attribute.groupName,
    groupSortOrder: attribute.groupSortOrder,
    sortOrder: attribute.sortOrder,
  }));
}

function applyProductTypeTemplate(
  baseForm: SingleProductUpsertInput,
  productType: ProductTypeOptionDto,
): SingleProductUpsertInput {
  return {
    ...baseForm,
    productTypeId: productType.id,
    tags: productType.presetTags || baseForm.tags,
    subcategoryIds: productType.presetSubcategoryIds.length
      ? productType.presetSubcategoryIds
      : baseForm.subcategoryIds,
    stockUnit: productType.presetStockUnit ?? baseForm.stockUnit,
    vatRate: productType.presetVatRate ?? baseForm.vatRate,
    guaranteeMonths: productType.presetGuaranteeMonths ?? baseForm.guaranteeMonths,
    attributes: buildTemplateAttributes(productType),
  };
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

export default function SingleProductEditPage() {
  return (
    <Suspense fallback={<EditorLoading />}>
      <SingleProductEditPageContent />
    </Suspense>
  );
}

function SingleProductEditPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useStaffSessionContext();
  const productId = Number(searchParams.get("id") ?? "");
  const requestedProductTypeId = Number(searchParams.get("type") ?? "");
  const isEdit = Number.isInteger(productId) && productId > 0;
  const requestedProductTypeIsValid =
    Number.isInteger(requestedProductTypeId) && requestedProductTypeId > 0;
  const canCreate = user ? canCreateProducts(user) : false;
  const canManage = user ? canManageProducts(user) : false;
  const [form, setForm] = useState<SingleProductUpsertInput>(createEmptyFormState);
  const [linkedFields, setLinkedFields] = useState<LinkedProductFields>({
    displayName: true,
    slug: true,
    titleSeo: true,
    currentPriceTtcTnd: true,
  });
  const [initialSnapshot, setInitialSnapshot] = useState("");
  const [options, setOptions] = useState<SingleProductFormOptionsDto>({
    productSubcategories: [],
    productTypeGroups: [],
    productBrandOptions: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [aiSuggestions, setAiSuggestions] =
    useState<SimpleProductAiSuggestions>(emptyAiSuggestions);
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [aiSuggestionError, setAiSuggestionError] = useState<string | null>(null);

  const onAttributesChange = (attributes: ProductAttributeInputDto[]) => {
    setForm((current) => ({ ...current, attributes }));
  };

  const canSave = isEdit ? canManage : canCreate;
  const selectedProductType = useMemo(
    () =>
      form.productTypeId == null
        ? null
        : (flattenProductTypes(options).find(
            (productType) => productType.id === form.productTypeId,
          ) ?? null),
    [form.productTypeId, options],
  );
  const lockAttributes = form.productTypeId != null;

  const rejectAiSuggestion = (field: keyof SimpleProductAiSuggestions) => {
    setAiSuggestions((current) => ({
      ...current,
      [field]: null,
      ...(field === "descriptionPreview"
        ? {
            descriptionRichText: null,
          }
        : {}),
      ...(field === "descriptionRichText"
        ? {
            descriptionPreview: null,
          }
        : {}),
    }));
  };

  const rejectAllAiSuggestions = () => {
    setAiSuggestions(emptyAiSuggestions());
  };

  const acceptAllAiSuggestions = () => {
    setForm((current) => ({
      ...(() => {
        const nextForm = {
          ...current,
          description: aiSuggestions.descriptionRichText ?? current.description,
          descriptionSeo: aiSuggestions.descriptionSeo ?? current.descriptionSeo,
          tags: aiSuggestions.tags?.length
            ? mergeTags(splitTags(current.tags), aiSuggestions.tags).join(" ")
            : current.tags,
          attributes:
            !current.productTypeId && aiSuggestions.attributes?.length
              ? aiSuggestions.attributes
              : current.attributes,
          subcategoryIds: aiSuggestions.subcategoryIds?.length
            ? aiSuggestions.subcategoryIds
            : current.subcategoryIds,
        };
        return nextForm;
      })(),
    }));
    setAiSuggestions(emptyAiSuggestions());
  };

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    void (async () => {
      try {
        const [formOptions, product] = await Promise.all([
          getSingleProductFormOptionsClient(),
          isEdit ? getSingleProductClient(productId) : Promise.resolve(null),
        ]);

        if (cancelled) {
          return;
        }

        setOptions(formOptions);

        if (product) {
          const nextForm = mapProductToForm(product);
          setForm(nextForm);
          setLinkedFields(getLinkedProductFields(nextForm));
          setInitialSnapshot(JSON.stringify(nextForm));
        } else {
          const selectedProductType = requestedProductTypeIsValid
            ? flattenProductTypes(formOptions).find(
                (productType) => productType.id === requestedProductTypeId,
              )
            : null;
          const emptyForm = createEmptyFormState();
          const nextForm = selectedProductType
            ? applyProductTypeTemplate(emptyForm, selectedProductType)
            : emptyForm;
          setForm(nextForm);
          setLinkedFields(getLinkedProductFields(nextForm));
          setInitialSnapshot(JSON.stringify(nextForm));
        }
      } catch (err: unknown) {
        toast.error(
          err instanceof SingleProductsClientError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Impossible de charger l'éditeur du produit simple.",
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
  }, [isEdit, productId, requestedProductTypeId, requestedProductTypeIsValid]);

  const isDirty = useMemo(() => JSON.stringify(form) !== initialSnapshot, [form, initialSnapshot]);

  const handleGenerateAiSuggestions = async () => {
    if (!canSave) {
      toast.error("Acces refuse.");
      return;
    }

    if (!form.name.trim()) {
      toast.error("Le nom du produit est requis pour utiliser l'IA.");
      return;
    }

    setIsAiSuggesting(true);
    setAiSuggestionError(null);

    try {
      const response = await suggestSingleProductAiClient({
        name: form.name,
        description: getArticlePlainText(form.description),
        descriptionSeo: form.descriptionSeo,
        tags: splitTags(form.tags),
        attributes: form.attributes,
        datasheetUrl: form.datasheet?.url ?? null,
        mediaUrls: form.media.map((media) => media.url),
        brand: form.brand,
        subcategoryOptions: options.productSubcategories,
      });
      const nextSuggestions = mapAiResponseToSuggestions(response);
      const nextForm = { ...form };
      const pendingSuggestions = emptyAiSuggestions();
      const currentDescription = getArticlePlainText(form.description);
      const currentTags = splitTags(form.tags);
      const mergedTags = nextSuggestions.tags?.length
        ? mergeTags(currentTags, nextSuggestions.tags)
        : currentTags;
      const allowedSubcategoryIds = new Set(
        options.productSubcategories.map((option) => option.id),
      );
      const validSuggestedSubcategoryIds =
        nextSuggestions.subcategoryIds?.filter((id) => allowedSubcategoryIds.has(id)) ?? [];

      if (nextSuggestions.descriptionRichText) {
        if (!currentDescription.trim()) {
          nextForm.description = nextSuggestions.descriptionRichText;
        } else if (form.description !== nextSuggestions.descriptionRichText) {
          pendingSuggestions.descriptionPreview = nextSuggestions.descriptionPreview;
          pendingSuggestions.descriptionRichText = nextSuggestions.descriptionRichText;
        }
      }

      if (nextSuggestions.descriptionSeo) {
        if (!normalizeText(form.descriptionSeo)) {
          nextForm.descriptionSeo = nextSuggestions.descriptionSeo;
        } else if (
          normalizeText(form.descriptionSeo) !== normalizeText(nextSuggestions.descriptionSeo)
        ) {
          pendingSuggestions.descriptionSeo = nextSuggestions.descriptionSeo;
        }
      }

      if (nextSuggestions.tags?.length) {
        if (currentTags.length === 0) {
          nextForm.tags = nextSuggestions.tags.join(" ");
        } else if (
          mergedTags.length !== currentTags.length ||
          mergedTags.some((tag, index) => tag !== currentTags[index])
        ) {
          pendingSuggestions.tags = nextSuggestions.tags;
        }
      }

      if (!form.productTypeId && nextSuggestions.attributes?.length) {
        if (form.attributes.length === 0) {
          nextForm.attributes = nextSuggestions.attributes;
        } else if (!areAttributesEqual(form.attributes, nextSuggestions.attributes)) {
          pendingSuggestions.attributes = nextSuggestions.attributes;
        }
      }

      if (validSuggestedSubcategoryIds.length > 0) {
        if (form.subcategoryIds.length === 0) {
          nextForm.subcategoryIds = validSuggestedSubcategoryIds;
        } else if (!areNumberArraysEqual(form.subcategoryIds, validSuggestedSubcategoryIds)) {
          pendingSuggestions.subcategoryIds = validSuggestedSubcategoryIds;
        }
      }

      setForm(nextForm);
      setAiSuggestions(pendingSuggestions);
      toast.success("L'IA a complete les champs vides et prepare les remplacements utiles.");
    } catch (error: unknown) {
      setAiSuggestions(emptyAiSuggestions());
      const message =
        error instanceof Error ? error.message : "Impossible de generer les suggestions IA.";
      setAiSuggestionError(message);
      toast.error(message);
    } finally {
      setIsAiSuggesting(false);
    }
  };

  const handleSave = async () => {
    if (!canSave) {
      toast.error("Accès refusé.");
      return false;
    }

    setIsSaving(true);
    try {
      const result = isEdit
        ? await updateSingleProductClient(productId, form)
        : await createSingleProductClient(form);
      const nextForm = mapProductToForm(result);
      setForm(nextForm);
      setLinkedFields(getLinkedProductFields(nextForm));
      setInitialSnapshot(JSON.stringify(nextForm));
      toast.success(isEdit ? "Produit simple mis à jour." : "Produit simple créé.");
      if (!isEdit) {
        router.replace(`/espace/staff/gestion-des-produits/produits/edit?id=${result.id}`);
      }
      return true;
    } catch (err: unknown) {
      toast.error(
        err instanceof SingleProductsClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Impossible d'enregistrer le produit simple.",
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

    const confirmed = window.confirm(`Supprimer le produit "${form.name}" ?`);
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteSingleProductClient(productId);
      toast.success("Produit simple supprimé.");
      router.replace("/espace/staff/gestion-des-produits/produits");
    } catch (err: unknown) {
      toast.error(
        err instanceof SingleProductsClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Impossible de supprimer le produit simple.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNameChanged = (name: string) => {
    setForm((current) => ({
      ...current,
      name,
      displayName: linkedFields.displayName ? name : current.displayName,
      slug: linkedFields.slug ? slugify(name) : current.slug,
      titleSeo: linkedFields.titleSeo ? nullableText(buildLinkedTitleSeo(name)) : current.titleSeo,
    }));
  };

  const handleDisplayNameChanged = (displayName: string) => {
    setLinkedFields((current) => ({ ...current, displayName: false }));
    setForm((current) => ({ ...current, displayName }));
  };

  const handleSlugChanged = (slug: string) => {
    setLinkedFields((current) => ({ ...current, slug: false }));
    setForm((current) => ({ ...current, slug }));
  };

  const handleTitleSeoChanged = (titleSeo: string) => {
    setLinkedFields((current) => ({ ...current, titleSeo: false }));
    setForm((current) => ({
      ...current,
      titleSeo: nullableText(truncateTitleSeo(titleSeo)),
    }));
  };

  const relinkDisplayName = () => {
    setLinkedFields((current) => ({ ...current, displayName: true }));
    setForm((current) => ({ ...current, displayName: current.name }));
  };

  const relinkSlug = () => {
    setLinkedFields((current) => ({ ...current, slug: true }));
    setForm((current) => ({ ...current, slug: slugify(current.name) }));
  };

  const relinkTitleSeo = () => {
    setLinkedFields((current) => ({ ...current, titleSeo: true }));
    setForm((current) => ({
      ...current,
      titleSeo: nullableText(buildLinkedTitleSeo(current.name)),
    }));
  };

  const handleBasePriceChanged = (basePrice: string) => {
    const basePriceTtcTnd = nullableDecimalText(basePrice);

    setForm((current) => ({
      ...current,
      basePriceTtcTnd,
      currentPriceTtcTnd: linkedFields.currentPriceTtcTnd
        ? basePriceTtcTnd
        : current.currentPriceTtcTnd,
    }));
  };

  const handleCurrentPriceChanged = (currentPrice: string) => {
    setLinkedFields((current) => ({ ...current, currentPriceTtcTnd: false }));
    setForm((current) => ({
      ...current,
      currentPriceTtcTnd: nullableDecimalText(currentPrice),
    }));
  };

  const relinkCurrentPrice = () => {
    setLinkedFields((current) => ({ ...current, currentPriceTtcTnd: true }));
    setForm((current) => ({
      ...current,
      currentPriceTtcTnd: current.basePriceTtcTnd,
    }));
  };

  if (isLoading) {
    return <EditorLoading />;
  }

  if (!canCreate && !isEdit) {
    return (
      <StaffStateCard
        title="Accès refusé"
        description="Vous ne pouvez pas créer de produit simple."
      />
    );
  }

  return (
    <div className="max-w-full space-y-6">
      <UnsavedChangesGuard isDirty={isDirty} onSaveAndContinue={handleSave} />

      <StaffPageHeader
        backHref="/espace/staff/gestion-des-produits/produits"
        eyebrow="Produits"
        title={isEdit ? form.name || "Produit simple" : "Nouveau produit simple"}
        icon={Package}
      >
        {(() => {
          const subcategory = options.productSubcategories.find((s) =>
            form.subcategoryIds.includes(s.id),
          );
          const publicUrl =
            subcategory && isEdit
              ? `/produits/${subcategory.categorySlug}/${subcategory.slug}/${form.slug}`
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

      <Panel pretitle="Produit" title="Informations principales">
        <ProductEssentialEntries
          sku={form.sku}
          name={form.name}
          brand={form.brand}
          brandOptions={options.productBrandOptions}
          lifecycle={form.lifecycle}
          showLifecycle={false}
          onSkuChanged={(sku: string) => setForm((current) => ({ ...current, sku }))}
          onNameChanged={handleNameChanged}
          onBrandChanged={(brand: null | string) => setForm((current) => ({ ...current, brand }))}
          onLifecycleChanged={(lifecycle: null | ProductLifecycle) =>
            setForm((current) => ({ ...current, lifecycle: lifecycle || "DRAFT" }))
          }
        />

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <PanelField id="product-display-name" label="Nom affiché">
            <LinkedFieldControl isLinked={linkedFields.displayName} onLink={relinkDisplayName}>
              <PanelInput
                id="product-display-name"
                fullWidth
                value={form.displayName}
                onChange={(event) => handleDisplayNameChanged(event.target.value)}
              />
            </LinkedFieldControl>
          </PanelField>

          <PanelField id="product-slug" label="Slug">
            <LinkedFieldControl isLinked={linkedFields.slug} onLink={relinkSlug}>
              <PanelInput
                id="product-slug"
                fullWidth
                value={form.slug}
                onChange={(event) => handleSlugChanged(event.target.value)}
              />
            </LinkedFieldControl>
          </PanelField>

          <PanelField
            id="product-title-seo"
            label="Titre SEO"
            hint={`${(form.titleSeo ?? "").length}/${TITLE_SEO_MAX_LENGTH}`}
          >
            <LinkedFieldControl isLinked={linkedFields.titleSeo} onLink={relinkTitleSeo}>
              <PanelInput
                id="product-title-seo"
                fullWidth
                maxLength={TITLE_SEO_MAX_LENGTH}
                value={form.titleSeo ?? ""}
                onChange={(event) => handleTitleSeoChanged(event.target.value)}
              />
            </LinkedFieldControl>
          </PanelField>

          <PanelField
            className="md:col-span-2 xl:col-span-3"
            id="product-description-seo"
            label="Description SEO"
          >
            <DescriptionSEOTextArea
              id="product-description-seo"
              value={form.descriptionSeo ?? ""}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  descriptionSeo: value || null,
                }))
              }
              aiSuggestion={aiSuggestions.descriptionSeo}
              onAcceptAiSuggestion={(value) => {
                setForm((current) => ({
                  ...current,
                  descriptionSeo: value || null,
                }));
                rejectAiSuggestion("descriptionSeo");
              }}
              onRejectAiSuggestion={() => rejectAiSuggestion("descriptionSeo")}
            />
          </PanelField>

          <PanelField className="md:col-span-2 xl:col-span-3" id="product-tags" label="Tags">
            <AiPanelTagsInput
              id="product-tags"
              value={splitTags(form.tags)}
              onChange={(tags) =>
                setForm((current) => ({
                  ...current,
                  tags: tags.join(" "),
                }))
              }
              aiSuggestion={aiSuggestions.tags}
              onAcceptAiSuggestion={(tags) => {
                setForm((current) => ({
                  ...current,
                  tags: tags.join(" "),
                }));
                rejectAiSuggestion("tags");
              }}
              onRejectAiSuggestion={() => rejectAiSuggestion("tags")}
            />
          </PanelField>

          <PanelField
            className="md:col-span-2 xl:col-span-3"
            id="product-short-description"
            label="Description courte"
          >
            <Textarea
              id="product-short-description"
              value={form.shortDescription ?? ""}
              maxLength={500}
              className="min-h-24 rounded-md border-slate-300 bg-white text-sm"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  shortDescription: event.target.value || null,
                }))
              }
            />
          </PanelField>
        </div>

        <ProductSubcategoriesField
          value={form.subcategoryIds.map(String)}
          options={options.productSubcategories}
          onChange={(nextValue) =>
            setForm((current) => ({
              ...current,
              subcategoryIds: nextValue.map(Number),
            }))
          }
        />

        {aiSuggestions.subcategoryIds?.length ? (
          <PanelField id="product-subcategories-ai" label="Suggestion IA de sous-categories">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {options.productSubcategories
                  .filter((option) => aiSuggestions.subcategoryIds?.includes(option.id))
                  .map((subcategory) => (
                    <span
                      key={subcategory.id}
                      className={cn(
                        "inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium",
                        AI_SUGGESTION_TOKEN_CLASS,
                      )}
                    >
                      {subcategory.categoryName} / {subcategory.name}
                    </span>
                  ))}
              </div>
              <AiSuggestionActionsRow
                suggestion={aiSuggestions.subcategoryIds}
                onAcceptSuggestion={(subcategoryIds) => {
                  setForm((current) => ({
                    ...current,
                    subcategoryIds,
                  }));
                  rejectAiSuggestion("subcategoryIds");
                }}
                onRejectSuggestion={() => rejectAiSuggestion("subcategoryIds")}
              />
            </div>
          </PanelField>
        ) : null}

        <PanelField id="product-description" label="Description">
          <AiPanelRichText
            editorId="product-description"
            value={form.description ?? ""}
            onChange={(value) =>
              setForm((current) =>
                current.description === value
                  ? current
                  : {
                      ...current,
                      description: value,
                    },
              )
            }
            aiSuggestion={aiSuggestions.descriptionRichText}
            aiSuggestionPreview={aiSuggestions.descriptionPreview}
            onAcceptAiSuggestion={(value) => {
              setForm((current) => {
                if (current.description === value) {
                  return current;
                }

                const nextForm = {
                  ...current,
                  description: value,
                };
                return nextForm;
              });
              setAiSuggestions((current) => ({
                ...current,
                descriptionPreview: null,
                descriptionRichText: null,
              }));
            }}
            onRejectAiSuggestion={() => rejectAiSuggestion("descriptionRichText")}
            placeholder="Description du produit..."
          />
        </PanelField>
      </Panel>

      <Panel pretitle="Publication" title="Visibilité et mise en avant">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ProductFlagCheckbox
            id="product-visible-ecommerce"
            label="Visible e-commerce"
            checked={form.visibleEcommerce}
            onCheckedChange={(visibleEcommerce) =>
              setForm((current) => ({ ...current, visibleEcommerce }))
            }
          />
          <ProductFlagCheckbox
            id="product-visible-vitrine"
            label="Visible vitrine"
            checked={form.visibleVitrine}
            onCheckedChange={(visibleVitrine) =>
              setForm((current) => ({ ...current, visibleVitrine }))
            }
          />
          <ProductFlagCheckbox
            id="product-featured"
            label="Mis en avant"
            checked={form.isFeatured}
            onCheckedChange={(isFeatured) => setForm((current) => ({ ...current, isFeatured }))}
          />
          <ProductFlagCheckbox
            id="product-promoted"
            label="En promotion"
            checked={form.isPromoted}
            onCheckedChange={(isPromoted) => setForm((current) => ({ ...current, isPromoted }))}
          />
          <ProductFlagCheckbox
            id="product-new"
            label="Nouveau"
            checked={form.isNew}
            onCheckedChange={(isNew) => setForm((current) => ({ ...current, isNew }))}
          />
        </div>
      </Panel>

      <Panel pretitle="Inventaire" title="Stock">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <PanelField id="product-stock-available" label="Stock disponible">
            <PanelInput
              id="product-stock-available"
              fullWidth
              inputMode="decimal"
              value={form.stockAvailable}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  stockAvailable: event.target.value,
                }))
              }
            />
          </PanelField>
          <PanelField id="product-stock-alert-threshold" label="Seuil d'alerte">
            <PanelInput
              id="product-stock-alert-threshold"
              fullWidth
              inputMode="decimal"
              value={form.stockAlertThreshold}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  stockAlertThreshold: event.target.value,
                }))
              }
            />
          </PanelField>
          <PanelField id="product-stock-unit" label="Unité">
            <StaffSelect
              id="product-stock-unit"
              fullWidth
              value={form.stockUnit}
              onValueChange={(stockUnit) =>
                setForm((current) => ({
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
          <PanelField id="product-stock-availability" label="Disponibilité">
            <StaffSelect
              id="product-stock-availability"
              fullWidth
              value={form.stockAvailability}
              onValueChange={(stockAvailability) =>
                setForm((current) => ({
                  ...current,
                  stockAvailability: stockAvailability as typeof current.stockAvailability,
                }))
              }
              options={PRODUCT_AVAILABILITY_VALUES.map((value) => ({
                value,
                label: formatEnumLabel(value),
              }))}
            />
          </PanelField>
          <PanelField id="product-stock-visibility" label="Affichage du stock">
            <StaffSelect
              id="product-stock-visibility"
              fullWidth
              value={form.stockVisibility}
              onValueChange={(stockVisibility) =>
                setForm((current) => ({
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
        </div>
      </Panel>

      <Panel pretitle="Prix" title="Tarification">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          <PanelField id="product-base-price" label="Prix de base TTC">
            <PanelInput
              id="product-base-price"
              fullWidth
              inputMode="decimal"
              value={form.basePriceTtcTnd ?? ""}
              onChange={(event) => handleBasePriceChanged(event.target.value)}
            />
          </PanelField>
          <PanelField id="product-current-price" label="Prix actuel TTC">
            <LinkedFieldControl
              isLinked={linkedFields.currentPriceTtcTnd}
              onLink={relinkCurrentPrice}
            >
              <PanelInput
                id="product-current-price"
                fullWidth
                inputMode="decimal"
                value={form.currentPriceTtcTnd ?? ""}
                onChange={(event) => handleCurrentPriceChanged(event.target.value)}
              />
            </LinkedFieldControl>
          </PanelField>
          <PanelField id="product-vat-rate" label="TVA">
            <PanelInput
              id="product-vat-rate"
              fullWidth
              inputMode="decimal"
              value={form.vatRate}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  vatRate: event.target.value,
                }))
              }
            />
          </PanelField>
          <PanelField id="product-guarantee" label="Garantie (mois)">
            <PanelInput
              id="product-guarantee"
              fullWidth
              type="number"
              min={0}
              value={form.guaranteeMonths}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  guaranteeMonths: Number(event.target.value || 0),
                }))
              }
            />
          </PanelField>
          <PanelField id="product-price-visibility" label="Affichage du prix">
            <StaffSelect
              id="product-price-visibility"
              fullWidth
              value={form.priceVisibility}
              onValueChange={(priceVisibility) =>
                setForm((current) => ({
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
      </Panel>

      <Panel pretitle="Galerie" title="Médias du produit">
        <ProductMediaGrid
          items={form.media}
          onChange={(media) =>
            setForm((current) => ({
              ...current,
              media,
            }))
          }
          title="Galerie"
          description="Le premier média devient la couverture du produit."
        />
      </Panel>

      <Panel pretitle="Documentation" title="Fiche technique">
        <StaffPdfImporter
          label="Document technique"
          description="Optionnel : associez une fiche technique PDF a ce produit simple."
          dialogTitle="Ajouter une fiche technique"
          dialogDescription="Choisissez un PDF existant ou importez-en un nouveau pour ce produit."
          value={form.datasheet}
          onChange={(datasheet) =>
            setForm((current) => ({
              ...current,
              datasheet,
            }))
          }
        />
      </Panel>

      <Panel
        allowOverflow
        pretitle={selectedProductType ? selectedProductType.name : "Attributs"}
        title="Valeurs du produit"
      >
        <AiPanelAttributesInput
          attributes={form.attributes}
          onAttributesChange={onAttributesChange}
          aiSuggestion={lockAttributes ? null : aiSuggestions.attributes}
          onAcceptAiSuggestion={(attributes) => {
            setForm((current) => ({
              ...current,
              attributes,
            }));
            rejectAiSuggestion("attributes");
          }}
          onRejectAiSuggestion={() => rejectAiSuggestion("attributes")}
          lockKinds={lockAttributes}
          canAddAttributes={!lockAttributes}
          canRemoveAttributes={!lockAttributes}
        />
      </Panel>

      {form.name.trim() ||
      isAiSuggesting ||
      aiSuggestionError ||
      hasActiveAiSuggestions(aiSuggestions) ? (
        <div className="border-cobam-water-blue/15 bg-cobam-water-blue/5 text-cobam-dark-blue flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3 text-sm">
          <AnimatedUIButton
            type="button"
            variant="ghost"
            color="secondary"
            size="sm"
            onClick={() => void handleGenerateAiSuggestions()}
            disabled={!form.name.trim() || isAiSuggesting}
            loading={isAiSuggesting}
            loadingText="Generation..."
          >
            Continuer avec l&apos;IA
          </AnimatedUIButton>
          <span className="font-medium">
            {isAiSuggesting
              ? "L'IA prepare des suggestions..."
              : aiSuggestionError
                ? aiSuggestionError
                : "Suggestions IA disponibles."}
          </span>
          {hasActiveAiSuggestions(aiSuggestions) ? (
            <>
              <AnimatedUIButton
                type="button"
                variant="ghost"
                color="secondary"
                size="sm"
                onClick={acceptAllAiSuggestions}
              >
                Accepter tout
              </AnimatedUIButton>
              <AnimatedUIButton
                type="button"
                variant="ghost"
                color="error"
                size="sm"
                onClick={rejectAllAiSuggestions}
              >
                Rejeter tout
              </AnimatedUIButton>
            </>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
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
          <AnimatedUIButton
            type="button"
            variant="light"
            onClick={() => void handleDelete()}
            loading={isDeleting}
            loadingText="Suppression..."
          >
            Supprimer
          </AnimatedUIButton>
        ) : null}
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
