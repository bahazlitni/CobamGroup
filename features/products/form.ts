import type {
  ProductAttributeInput,
  ProductCommercialMode,
  ProductCreateInput,
  ProductDetailDto,
  ProductLifecycleStatus,
  ProductMediaDto,
  ProductPriceVisibility,
  ProductVariantAttributeValueInput,
  ProductVisibility,
} from "./types";
import { resolveVariantEffectiveValues } from "./overrides";
import { slugifyProductName, slugifyProductReference } from "./slug";

export type ProductAttributeEditorState = {
  formKey: string;
  id: number | null;
  name: string;
  dataType: ProductAttributeInput["dataType"];
  unit: string;
  sortOrder: string;
};

export type ProductVariantAttributeValueEditorState = {
  attributeFormKey: string;
  attributeId: number | null;
  value: string;
};

export type ProductVariantAddonState = {
  lifecycleStatus: boolean;
  visibility: boolean;
  commercialMode: boolean;
  priceVisibility: boolean;
  basePriceAmount: boolean;
};

export type ProductVariantEditorState = {
  formKey: string;
  id: number | null;
  sku: string;
  name: string;
  description: string;
  descriptionSeo: string;
  lifecycleStatus: ProductLifecycleStatus | null;
  visibility: ProductVisibility | null;
  commercialMode: ProductCommercialMode | null;
  priceVisibility: ProductPriceVisibility | null;
  basePriceAmount: string | null;
  addons: ProductVariantAddonState;
  media: ProductMediaDto[];
  attributeValues: ProductVariantAttributeValueEditorState[];
};

export type ProductEditorFormState = {
  brandId: string;
  productSubcategoryIds: string[];
  mainImage: ProductMediaDto | null;
  name: string;
  subtitle: string;
  description: string;
  descriptionSeo: string;
  priceUnit: ProductCreateInput["priceUnit"];
  vatRate: string;
  tagNames: string[];
  attributes: ProductAttributeEditorState[];
  variants: ProductVariantEditorState[];
};

function createFormKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeRequiredEditorString(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function normalizeOptionalPrice(value: string | null | undefined) {
  if (value == null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeVatRate(value: string | number | null | undefined) {
  if (value == null) {
    return 19;
  }

  const normalized = String(value).replace(",", ".").trim();
  if (!normalized) {
    return 19;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 19;
}

function createEmptyVariantAddonState(
  overrides: Partial<ProductVariantAddonState> = {},
): ProductVariantAddonState {
  return {
    lifecycleStatus: overrides.lifecycleStatus ?? false,
    visibility: overrides.visibility ?? false,
    commercialMode: overrides.commercialMode ?? false,
    priceVisibility: overrides.priceVisibility ?? false,
    basePriceAmount: overrides.basePriceAmount ?? false,
  };
}

function isSameEditorValue<T>(left: T | null | undefined, right: T | null | undefined) {
  return (left ?? null) === (right ?? null);
}

function buildAddonValue<T>(
  variantValue: T | null | undefined,
  defaultValue: T | null | undefined,
): { active: boolean; value: T | null } {
  if (variantValue == null || isSameEditorValue(variantValue, defaultValue)) {
    return { active: false, value: null };
  }

  return { active: true, value: variantValue };
}

function buildVariantAttributeValues(
  attributes: ProductAttributeEditorState[],
  values: Array<{
    attributeId?: number | null;
    attributeFormKey?: string | null;
    value: string | null;
  }> = [],
): ProductVariantAttributeValueEditorState[] {
  return attributes.map((attribute) => {
    const matchingValue =
      values.find(
        (item) =>
          item.attributeId != null && attribute.id != null && item.attributeId === attribute.id,
      ) ??
      values.find(
        (item) => item.attributeFormKey != null && item.attributeFormKey === attribute.formKey,
      );

    return {
      attributeFormKey: attribute.formKey,
      attributeId: attribute.id,
      value: matchingValue?.value ?? "",
    };
  });
}

function getDefaultVariantInternal(
  variants: ProductVariantEditorState[],
): ProductVariantEditorState | null {
  return variants[0] ?? null;
}

export function getComputedFamilySlug(name: string) {
  return slugifyProductName(name.trim());
}

export function getComputedVariantSlug(name: string) {
  return slugifyProductReference(name.trim());
}

export function createEmptyProductAttributeEditorState(
  overrides: Partial<ProductAttributeEditorState> = {},
): ProductAttributeEditorState {
  return {
    formKey: overrides.formKey ?? createFormKey(),
    id: overrides.id ?? null,
    name: overrides.name ?? "",
    dataType: overrides.dataType ?? "TEXT",
    unit: overrides.unit ?? "",
    sortOrder: overrides.sortOrder ?? "0",
  };
}

export function createEmptyProductVariantEditorState(
  overrides: Partial<ProductVariantEditorState> = {},
): ProductVariantEditorState {
  return {
    formKey: overrides.formKey ?? createFormKey(),
    id: overrides.id ?? null,
    sku: overrides.sku ?? "",
    name: overrides.name ?? "",
    description: overrides.description ?? "",
    descriptionSeo: overrides.descriptionSeo ?? "",
    lifecycleStatus: overrides.lifecycleStatus ?? null,
    visibility: overrides.visibility ?? null,
    commercialMode: overrides.commercialMode ?? null,
    priceVisibility: overrides.priceVisibility ?? null,
    basePriceAmount: overrides.basePriceAmount ?? null,
    addons: createEmptyVariantAddonState(overrides.addons),
    media: overrides.media ?? [],
    attributeValues: overrides.attributeValues ?? [],
  };
}

export function createDefaultProductVariantEditorState(options?: {
  attributes?: ProductAttributeEditorState[];
}) {
  return createEmptyProductVariantEditorState({
    lifecycleStatus: "DRAFT",
    visibility: "HIDDEN",
    commercialMode: "REFERENCE_ONLY",
    priceVisibility: "HIDDEN",
    attributeValues: syncVariantAttributeValueEditorStates(options?.attributes ?? [], []),
  });
}

export function createInheritedProductVariantEditorState(options?: {
  attributes?: ProductAttributeEditorState[];
}) {
  return createEmptyProductVariantEditorState({
    attributeValues: syncVariantAttributeValueEditorStates(options?.attributes ?? [], []),
  });
}

export function duplicateProductVariantEditorState(
  source: ProductVariantEditorState,
  options?: {
    isDefaultSource?: boolean;
  },
): ProductVariantEditorState {
  const duplicatedName = source.name.trim() ? `${source.name.trim()} copie` : "";

  if (options?.isDefaultSource) {
    return createEmptyProductVariantEditorState({
      sku: "",
      name: duplicatedName,
      description: source.description,
      descriptionSeo: source.descriptionSeo,
      addons: createEmptyVariantAddonState(),
      media: [...source.media],
      attributeValues: source.attributeValues.map((attributeValue) => ({
        ...attributeValue,
      })),
    });
  }

  return createEmptyProductVariantEditorState({
    sku: "",
    name: duplicatedName,
    description: source.description,
    descriptionSeo: source.descriptionSeo,
    lifecycleStatus: source.lifecycleStatus,
    visibility: source.visibility,
    commercialMode: source.commercialMode,
    priceVisibility: source.priceVisibility,
    basePriceAmount: source.basePriceAmount,
    addons: { ...source.addons },
    media: [...source.media],
    attributeValues: source.attributeValues.map((attributeValue) => ({
      ...attributeValue,
    })),
  });
}

export function moveProductVariantEditorStates(
  variants: ProductVariantEditorState[],
  formKey: string,
  direction: "up" | "down",
): ProductVariantEditorState[] {
  const currentIndex = variants.findIndex((variant) => variant.formKey === formKey);

  if (currentIndex < 0) {
    return variants;
  }

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (targetIndex <= 0 || targetIndex >= variants.length) {
    return variants;
  }

  const nextVariants = [...variants];
  const [movedVariant] = nextVariants.splice(currentIndex, 1);
  nextVariants.splice(targetIndex, 0, movedVariant);
  return nextVariants;
}

export function syncVariantAttributeValueEditorStates(
  attributes: ProductAttributeEditorState[],
  existingValues: ProductVariantAttributeValueEditorState[],
): ProductVariantAttributeValueEditorState[] {
  return buildVariantAttributeValues(
    attributes,
    existingValues.map((item) => ({
      attributeId: item.attributeId,
      attributeFormKey: item.attributeFormKey,
      value: item.value,
    })),
  );
}

export function createEmptyProductEditorFormState(): ProductEditorFormState {
  return {
    brandId: "",
    productSubcategoryIds: [],
    mainImage: null,
    name: "",
    subtitle: "",
    description: "",
    descriptionSeo: "",
    priceUnit: "ITEM",
    vatRate: "19",
    tagNames: [],
    attributes: [],
    variants: [createDefaultProductVariantEditorState()],
  };
}

export function getDefaultVariantValues(form: ProductEditorFormState) {
  const defaultVariant = getDefaultVariantInternal(form.variants);

  return {
    lifecycleStatus: defaultVariant?.lifecycleStatus ?? "DRAFT",
    visibility: defaultVariant?.visibility ?? "HIDDEN",
    commercialMode: defaultVariant?.commercialMode ?? "REFERENCE_ONLY",
    priceVisibility: defaultVariant?.priceVisibility ?? "HIDDEN",
    basePriceAmount: normalizeOptionalPrice(defaultVariant?.basePriceAmount),
  };
}

export function getEffectiveVariantValues(
  form: ProductEditorFormState,
  variant: ProductVariantEditorState,
) {
  const defaultVariant = getDefaultVariantInternal(form.variants);
  const isDefaultVariant = defaultVariant?.formKey === variant.formKey;

  const defaultValues = getDefaultVariantValues(form);
  const variantValues = {
    lifecycleStatus:
      isDefaultVariant || variant.addons.lifecycleStatus ? variant.lifecycleStatus : null,
    visibility: isDefaultVariant || variant.addons.visibility ? variant.visibility : null,
    commercialMode:
      isDefaultVariant || variant.addons.commercialMode ? variant.commercialMode : null,
    priceVisibility:
      isDefaultVariant || variant.addons.priceVisibility ? variant.priceVisibility : null,
    basePriceAmount:
      isDefaultVariant || variant.addons.basePriceAmount
        ? normalizeOptionalPrice(variant.basePriceAmount)
        : null,
  };

  return {
    effectiveName: normalizeRequiredEditorString(variant.name),
    effectiveDescription: normalizeRequiredEditorString(variant.description),
    effectiveDescriptionSeo: normalizeRequiredEditorString(variant.descriptionSeo),
    ...resolveVariantEffectiveValues(defaultValues, variantValues),
  };
}

export function productDetailToFormState(product: ProductDetailDto | null): ProductEditorFormState {
  if (!product) {
    return createEmptyProductEditorFormState();
  }

  const attributes = product.attributes.map((attribute, index) =>
    createEmptyProductAttributeEditorState({
      id: attribute.id,
      name: attribute.name,
      dataType: attribute.dataType,
      unit: attribute.unit ?? "",
      sortOrder: String(attribute.sortOrder ?? index),
    }),
  );

  const sortedVariants = [...product.variants].sort((left, right) => {
    if (product.defaultVariantId != null) {
      if (left.id === product.defaultVariantId) return -1;
      if (right.id === product.defaultVariantId) return 1;
    }

    return left.sortOrder - right.sortOrder;
  });

  const defaultVariantRecord = sortedVariants[0] ?? null;
  const defaultVariant = defaultVariantRecord
    ? createEmptyProductVariantEditorState({
        id: defaultVariantRecord.id,
        sku: defaultVariantRecord.sku,
        name: defaultVariantRecord.name ?? "",
        description: defaultVariantRecord.description ?? "",
        descriptionSeo: defaultVariantRecord.descriptionSeo ?? "",
        lifecycleStatus: defaultVariantRecord.lifecycleStatus ?? "DRAFT",
        visibility: defaultVariantRecord.visibility ?? "HIDDEN",
        commercialMode: defaultVariantRecord.commercialMode ?? "REFERENCE_ONLY",
        priceVisibility: defaultVariantRecord.priceVisibility ?? "HIDDEN",
        basePriceAmount: defaultVariantRecord.basePriceAmount,
        media: defaultVariantRecord.media,
        attributeValues: buildVariantAttributeValues(
          attributes,
          defaultVariantRecord.attributeValues.map((value) => ({
            attributeId: value.attributeId,
            value: value.value,
          })),
        ),
      })
    : createDefaultProductVariantEditorState({ attributes });

  const remainingVariants = sortedVariants.slice(1).map((variant) => {
    const lifecycleStatus = buildAddonValue(
      variant.lifecycleStatus,
      defaultVariant.lifecycleStatus,
    );
    const visibility = buildAddonValue(variant.visibility, defaultVariant.visibility);
    const commercialMode = buildAddonValue(
      variant.commercialMode,
      defaultVariant.commercialMode,
    );
    const priceVisibility = buildAddonValue(
      variant.priceVisibility,
      defaultVariant.priceVisibility,
    );
    const basePriceAmount = buildAddonValue(
      variant.basePriceAmount,
      normalizeOptionalPrice(defaultVariant.basePriceAmount),
    );

    return createEmptyProductVariantEditorState({
      id: variant.id,
      sku: variant.sku,
      name: variant.name ?? "",
      description: variant.description ?? "",
      descriptionSeo: variant.descriptionSeo ?? "",
      lifecycleStatus: lifecycleStatus.value,
      visibility: visibility.value,
      commercialMode: commercialMode.value,
      priceVisibility: priceVisibility.value,
      basePriceAmount: basePriceAmount.value,
      addons: {
        lifecycleStatus: lifecycleStatus.active,
        visibility: visibility.active,
        commercialMode: commercialMode.active,
        priceVisibility: priceVisibility.active,
        basePriceAmount: basePriceAmount.active,
      },
      media: variant.media,
      attributeValues: buildVariantAttributeValues(
        attributes,
        variant.attributeValues.map((value) => ({
          attributeId: value.attributeId,
          value: value.value,
        })),
      ),
    });
  });

  return {
    brandId: product.brand != null ? String(product.brand.id) : "",
    productSubcategoryIds: product.productSubcategories.map((subcategory) =>
      String(subcategory.id),
    ),
    mainImage: product.mainImage,
    name: product.name,
    subtitle: product.subtitle ?? "",
    description: product.description ?? "",
    descriptionSeo: product.descriptionSeo ?? "",
    priceUnit: product.priceUnit,
    vatRate: String(product.vatRate),
    tagNames: product.tags.map((tag) => tag.name),
    attributes,
    variants: [defaultVariant, ...remainingVariants],
  };
}

export function productEditorFormToPayload(state: ProductEditorFormState): ProductCreateInput {
  return {
    brandId:
      Number.isInteger(Number(state.brandId)) && Number(state.brandId) > 0
        ? Number(state.brandId)
        : null,
    productSubcategoryIds: state.productSubcategoryIds
      .map((subcategoryId) => Number(subcategoryId))
      .filter((subcategoryId) => Number.isInteger(subcategoryId) && subcategoryId > 0),
    mainImageMediaId: state.mainImage?.id ?? null,
    name: state.name.trim(),
    subtitle: state.subtitle.trim() || null,
    description: state.description.trim() || null,
    descriptionSeo: state.descriptionSeo.trim() || null,
    priceUnit: state.priceUnit,
    vatRate: normalizeVatRate(state.vatRate),
    tagNames: state.tagNames.map((tagName) => tagName.trim()).filter(Boolean),
    attributes: state.attributes.map((attribute, index) => ({
      tempKey: attribute.formKey,
      id: attribute.id,
      name: attribute.name.trim(),
      dataType: attribute.dataType,
      unit: attribute.dataType === "NUMBER" ? attribute.unit.trim() || null : null,
      sortOrder:
        Number.isFinite(Number(attribute.sortOrder)) &&
        Number.isInteger(Number(attribute.sortOrder))
          ? Number(attribute.sortOrder)
          : index,
    })),
    variants: state.variants.map((variant, index) => ({
      id: variant.id,
      sku: variant.sku.trim(),
      name: variant.name.trim(),
      description: variant.description.trim(),
      descriptionSeo: variant.descriptionSeo.trim(),
      lifecycleStatus:
        index === 0
          ? (variant.lifecycleStatus ?? "DRAFT")
          : variant.addons.lifecycleStatus
            ? variant.lifecycleStatus
            : null,
      visibility:
        index === 0
          ? (variant.visibility ?? "HIDDEN")
          : variant.addons.visibility
            ? variant.visibility
            : null,
      commercialMode:
        index === 0
          ? (variant.commercialMode ?? "REFERENCE_ONLY")
          : variant.addons.commercialMode
            ? variant.commercialMode
            : null,
      priceVisibility:
        index === 0
          ? (variant.priceVisibility ?? "HIDDEN")
          : variant.addons.priceVisibility
            ? variant.priceVisibility
            : null,
      basePriceAmount:
        index === 0
          ? normalizeOptionalPrice(variant.basePriceAmount)
          : variant.addons.basePriceAmount
            ? normalizeOptionalPrice(variant.basePriceAmount)
            : null,
      sortOrder: index,
      mediaIds: Array.from(
        new Set(
          variant.media
            .map((media) => media.id)
            .filter((mediaId) => Number.isInteger(mediaId) && mediaId > 0),
        ),
      ),
      attributeValues: variant.attributeValues.map(
        (attributeValue): ProductVariantAttributeValueInput => ({
          attributeId: attributeValue.attributeId,
          attributeTempKey:
            attributeValue.attributeId == null ? attributeValue.attributeFormKey : null,
          value: attributeValue.value.trim() || null,
        }),
      ),
    })),
  };
}
