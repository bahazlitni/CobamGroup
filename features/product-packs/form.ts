import type { ProductMediaDto } from "@/features/products/types";
import { slugifyProductName } from "@/features/products/slug";
import { deriveProductPackComputedValues } from "./derived";
import type {
  ProductPackCreateInput,
  ProductPackDetailDto,
  ProductPackLineDto,
  ProductPackVariantOptionDto,
} from "./types";

export type ProductPackLineEditorState = {
  formKey: string;
  productVariant: ProductPackVariantOptionDto;
  quantity: string;
};

export type ProductPackEditorFormState = {
  name: string;
  subtitle: string;
  description: string;
  descriptionSeo: string;
  mainImage: ProductMediaDto | null;
  media: ProductMediaDto[];
  lines: ProductPackLineEditorState[];
};

function createFormKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function parseQuantity(value: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

export function getComputedProductPackSlug(name: string) {
  return slugifyProductName(name.trim());
}

export function createProductPackLineEditorState(
  productVariant: ProductPackVariantOptionDto,
): ProductPackLineEditorState {
  return {
    formKey: createFormKey(),
    productVariant,
    quantity: "1",
  };
}

export function createEmptyProductPackEditorFormState(): ProductPackEditorFormState {
  return {
    name: "",
    subtitle: "",
    description: "",
    descriptionSeo: "",
    mainImage: null,
    media: [],
    lines: [],
  };
}

export function productPackDetailToFormState(
  pack: ProductPackDetailDto | null,
): ProductPackEditorFormState {
  if (!pack) {
    return createEmptyProductPackEditorFormState();
  }

  return {
    name: pack.name,
    subtitle: pack.subtitle ?? "",
    description: pack.description ?? "",
    descriptionSeo: pack.descriptionSeo ?? "",
    mainImage: pack.mainImage,
    media: pack.media,
    lines: pack.lines
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((line) => ({
        formKey: createFormKey(),
        productVariant: line.variant,
        quantity: String(line.quantity),
      })),
  };
}

export function getProductPackComputedPreview(form: ProductPackEditorFormState) {
  const lines: ProductPackLineDto[] = form.lines.map((line, index) => ({
    productVariantId: line.productVariant.id,
    quantity: parseQuantity(line.quantity),
    sortOrder: index,
    variant: line.productVariant,
  }));

  return deriveProductPackComputedValues(lines);
}

export function productPackEditorFormToPayload(
  form: ProductPackEditorFormState,
): ProductPackCreateInput {
  return {
    name: form.name.trim(),
    subtitle: form.subtitle.trim() || null,
    description: form.description.trim() || null,
    descriptionSeo: form.descriptionSeo.trim() || null,
    mainImageMediaId: form.mainImage?.id ?? null,
    mediaIds: Array.from(
      new Set(
        form.media
          .map((media) => media.id)
          .filter((mediaId) => Number.isInteger(mediaId) && mediaId > 0),
      ),
    ),
    lines: form.lines.map((line, index) => ({
      productVariantId: line.productVariant.id,
      quantity: parseQuantity(line.quantity),
      sortOrder: index,
    })),
  };
}
