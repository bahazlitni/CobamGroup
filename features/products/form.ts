import type { ProductCreateInput, ProductDetailDto } from "./types";

export type ProductEditorFormState = {
  brandId: string;
  productCategoryId: string;
  baseName: string;
  baseSlug: string;
  description: string;
  descriptionSeo: string;
  isActive: boolean;
  tagNames: string[];
};

export function createEmptyProductEditorFormState(): ProductEditorFormState {
  return {
    brandId: "",
    productCategoryId: "",
    baseName: "",
    baseSlug: "",
    description: "",
    descriptionSeo: "",
    isActive: true,
    tagNames: [],
  };
}

export function productDetailToFormState(
  product: ProductDetailDto | null,
): ProductEditorFormState {
  if (!product) {
    return createEmptyProductEditorFormState();
  }

  return {
    brandId: String(product.brand.id),
    productCategoryId: String(product.productCategory.id),
    baseName: product.baseName,
    baseSlug: product.baseSlug,
    description: product.description ?? "",
    descriptionSeo: product.descriptionSeo ?? "",
    isActive: product.isActive,
    tagNames: product.tags.map((tag) => tag.name),
  };
}

export function productEditorFormToPayload(
  state: ProductEditorFormState,
): ProductCreateInput {
  return {
    brandId: Number(state.brandId),
    productCategoryId: Number(state.productCategoryId),
    baseName: state.baseName.trim(),
    baseSlug: state.baseSlug.trim(),
    description: state.description.trim() || null,
    descriptionSeo: state.descriptionSeo.trim() || null,
    isActive: state.isActive,
    tagNames: state.tagNames.map((tagName) => tagName.trim()).filter(Boolean),
  };
}
