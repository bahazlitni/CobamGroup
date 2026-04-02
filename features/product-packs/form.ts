import type { AllProductListItemDto } from "@/features/all-products/types";
import type {
  ProductCommercialMode,
  ProductLifecycleStatus,
  ProductMediaDto,
  ProductPriceVisibility,
  ProductVisibility,
} from "@/features/products/types";
import type {
  ProductPackCreateInput,
  ProductPackDetailDto,
  ProductPackOverrideMode,
  ProductPackUpdateInput,
} from "./types";

function createFormKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `pack-line-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export type ProductPackLineEditorState = {
  formKey: string;
  variantId: number;
  familyId: number | null;
  name: string;
  slug: string | null;
  sku: string;
  quantity: string;
  coverMediaId: number | null;
  basePriceAmount: string | null;
};

export type ProductPackEditorFormState = {
  name: string;
  sku: string;
  description: string;
  descriptionSeo: string;
  commercialMode: ProductCommercialMode;
  lifecycleStatusMode: ProductPackOverrideMode;
  manualLifecycleStatus: ProductLifecycleStatus | "";
  visibilityMode: ProductPackOverrideMode;
  manualVisibility: ProductVisibility | "";
  priceVisibilityMode: ProductPackOverrideMode;
  manualPriceVisibility: ProductPriceVisibility | "";
  productSubcategoryIds: string[];
  mainImage: ProductMediaDto | null;
  media: ProductMediaDto[];
  lines: ProductPackLineEditorState[];
};

export function createEmptyProductPackEditorFormState(): ProductPackEditorFormState {
  return {
    name: "",
    sku: "",
    description: "",
    descriptionSeo: "",
    commercialMode: "SELLABLE",
    lifecycleStatusMode: "AUTO",
    manualLifecycleStatus: "",
    visibilityMode: "AUTO",
    manualVisibility: "",
    priceVisibilityMode: "AUTO",
    manualPriceVisibility: "",
    productSubcategoryIds: [],
    mainImage: null,
    media: [],
    lines: [],
  };
}

export function productPackDetailToFormState(
  pack: ProductPackDetailDto,
): ProductPackEditorFormState {
  return {
    name: pack.name,
    sku: pack.sku,
    description: pack.description ?? "",
    descriptionSeo: pack.descriptionSeo ?? "",
    commercialMode: pack.commercialMode,
    lifecycleStatusMode: pack.lifecycleStatusMode,
    manualLifecycleStatus: pack.manualLifecycleStatus ?? "",
    visibilityMode: pack.visibilityMode,
    manualVisibility: pack.manualVisibility ?? "",
    priceVisibilityMode: pack.priceVisibilityMode,
    manualPriceVisibility: pack.manualPriceVisibility ?? "",
    productSubcategoryIds: pack.productSubcategories.map((subcategory) => String(subcategory.id)),
    mainImage: pack.mainImage,
    media: pack.media,
    lines: pack.lines.map((line) => ({
      formKey: createFormKey(),
      variantId: line.variantId,
      familyId: line.familyId,
      name: line.name,
      slug: line.slug,
      sku: line.sku,
      quantity: String(line.quantity),
      coverMediaId: null,
      basePriceAmount: null,
    })),
  };
}

export function addVariantLinesToPackForm(
  currentLines: readonly ProductPackLineEditorState[],
  variants: readonly AllProductListItemDto[],
): ProductPackLineEditorState[] {
  const existingIds = new Set(currentLines.map((line) => line.variantId));
  const additions = variants
    .filter((variant) => variant.sourceType === "VARIANT" && !existingIds.has(variant.sourceId))
    .map((variant) => ({
      formKey: createFormKey(),
      variantId: variant.sourceId,
      familyId: variant.productFamilyId,
      name: variant.name,
      slug: variant.slug,
      sku: variant.sku,
      quantity: "1",
      coverMediaId: variant.coverMediaId,
      basePriceAmount: variant.basePriceAmount,
    }));

  return [...currentLines, ...additions];
}

function normalizeNullableText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizePositiveInteger(value: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export function productPackEditorFormToPayload(
  form: ProductPackEditorFormState,
): ProductPackCreateInput | ProductPackUpdateInput {
  return {
    name: form.name.trim(),
    sku: form.sku.trim(),
    description: normalizeNullableText(form.description),
    descriptionSeo: normalizeNullableText(form.descriptionSeo),
    productSubcategoryIds: form.productSubcategoryIds
      .map((productSubcategoryId) => Number(productSubcategoryId))
      .filter((productSubcategoryId) => Number.isInteger(productSubcategoryId) && productSubcategoryId > 0),
    commercialMode: form.commercialMode,
    lifecycleStatusMode: form.lifecycleStatusMode,
    manualLifecycleStatus:
      form.lifecycleStatusMode === "MANUAL" && form.manualLifecycleStatus
        ? form.manualLifecycleStatus
        : null,
    visibilityMode: form.visibilityMode,
    manualVisibility:
      form.visibilityMode === "MANUAL" && form.manualVisibility
        ? form.manualVisibility
        : null,
    priceVisibilityMode: form.priceVisibilityMode,
    manualPriceVisibility:
      form.priceVisibilityMode === "MANUAL" && form.manualPriceVisibility
        ? form.manualPriceVisibility
        : null,
    mainImageMediaId: form.mainImage?.id ?? null,
    mediaIds: form.media
      .map((media) => media.id)
      .filter((mediaId) => mediaId !== form.mainImage?.id),
    lines: form.lines.map((line, index) => ({
      variantId: line.variantId,
      quantity: normalizePositiveInteger(line.quantity),
      sortOrder: index,
    })),
  };
}
