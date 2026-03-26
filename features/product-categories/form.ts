import type { ProductCategoryCreateInput, ProductCategoryDetailDto } from "./types";

export type ProductCategoryEditorFormState = {
  name: string;
  subtitle: string;
  slug: string;
  description: string;
  descriptionSeo: string;
  imageMediaId: number | null;
  sortOrder: string;
  isActive: boolean;
  parentId: string;
};

export function createEmptyProductCategoryEditorFormState(): ProductCategoryEditorFormState {
  return {
    name: "",
    subtitle: "",
    slug: "",
    description: "",
    descriptionSeo: "",
    imageMediaId: null,
    sortOrder: "0",
    isActive: true,
    parentId: "",
  };
}

export function productCategoryDetailToFormState(
  category: ProductCategoryDetailDto | null,
): ProductCategoryEditorFormState {
  if (!category) {
    return createEmptyProductCategoryEditorFormState();
  }

  return {
    name: category.name,
    subtitle: category.subtitle ?? "",
    slug: category.slug,
    description: category.description ?? "",
    descriptionSeo: category.descriptionSeo ?? "",
    imageMediaId: category.imageMediaId ?? null,
    sortOrder: String(category.sortOrder),
    isActive: category.isActive,
    parentId: category.parentId != null ? String(category.parentId) : "",
  };
}

export function productCategoryEditorFormToPayload(
  state: ProductCategoryEditorFormState,
): ProductCategoryCreateInput {
  const sortOrderRaw = state.sortOrder.trim();
  const parsedSortOrder =
    sortOrderRaw === "" ? 0 : Number.isInteger(Number(sortOrderRaw)) ? Number(sortOrderRaw) : 0;

  return {
    name: state.name.trim(),
    subtitle: state.subtitle.trim() || null,
    slug: state.slug.trim(),
    description: state.description.trim() || null,
    descriptionSeo: state.descriptionSeo.trim() || null,
    imageMediaId: state.imageMediaId,
    sortOrder: parsedSortOrder,
    isActive: state.isActive,
    parentId: state.parentId ? Number(state.parentId) : null,
  };
}
