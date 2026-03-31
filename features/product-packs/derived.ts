import type {
  ProductBrandOptionDto,
  ProductCommercialMode,
  ProductLifecycleStatus,
  ProductPriceVisibility,
  ProductSubcategoryOptionDto,
  ProductTagOptionDto,
  ProductVisibility,
} from "@/features/products/types";
import type { ProductPackComputedDto, ProductPackLineDto, ProductPackVariantOptionDto } from "./types";

function parsePriceAmount(value: string | null): number | null {
  if (value == null) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatPriceAmount(value: number): string {
  return value.toFixed(2);
}

function dedupeById<T extends { id: number }>(items: T[]) {
  return items.filter((item, index, array) => array.findIndex((entry) => entry.id === item.id) === index);
}

function deriveLifecycleStatus(
  variants: ProductPackVariantOptionDto[],
): ProductLifecycleStatus {
  if (variants.length === 0) {
    return "DRAFT";
  }

  if (variants.every((variant) => variant.lifecycleStatus === "ACTIVE")) {
    return "ACTIVE";
  }

  if (variants.every((variant) => variant.lifecycleStatus === "ARCHIVED")) {
    return "ARCHIVED";
  }

  return "DRAFT";
}

function deriveVisibility(variants: ProductPackVariantOptionDto[]): ProductVisibility {
  return variants.length > 0 && variants.every((variant) => variant.visibility === "PUBLIC")
    ? "PUBLIC"
    : "HIDDEN";
}

function deriveCommercialMode(
  variants: ProductPackVariantOptionDto[],
): ProductCommercialMode {
  if (variants.length === 0) {
    return "REFERENCE_ONLY";
  }

  if (variants.some((variant) => variant.commercialMode === "REFERENCE_ONLY")) {
    return "REFERENCE_ONLY";
  }

  if (variants.some((variant) => variant.commercialMode === "QUOTE_ONLY")) {
    return "QUOTE_ONLY";
  }

  return "SELLABLE";
}

function deriveBasePriceAmount(lines: ProductPackLineDto[]): string | null {
  let total = 0;

  for (const line of lines) {
    const priceAmount = parsePriceAmount(line.variant.basePriceAmount);

    if (priceAmount == null) {
      return null;
    }

    total += priceAmount * line.quantity;
  }

  return formatPriceAmount(total);
}

function derivePriceVisibility(
  lines: ProductPackLineDto[],
  basePriceAmount: string | null,
): ProductPriceVisibility {
  if (basePriceAmount == null) {
    return "HIDDEN";
  }

  return lines.length > 0 &&
    lines.every((line) => line.variant.priceVisibility === "VISIBLE")
    ? "VISIBLE"
    : "HIDDEN";
}

function deriveVatRate(lines: ProductPackLineDto[]): number {
  let totalPrice = 0;
  let weightedVat = 0;

  for (const line of lines) {
    const priceAmount = parsePriceAmount(line.variant.basePriceAmount);

    if (priceAmount == null) {
      return 0;
    }

    const lineTotal = priceAmount * line.quantity;
    totalPrice += lineTotal;
    weightedVat += line.variant.vatRate * lineTotal;
  }

  if (totalPrice <= 0) {
    return 0;
  }

  return Number((weightedVat / totalPrice).toFixed(4));
}

export function deriveProductPackComputedValues(
  lines: ProductPackLineDto[],
): ProductPackComputedDto {
  const variants = lines.map((line) => line.variant);
  const basePriceAmount = deriveBasePriceAmount(lines);

  return {
    lifecycleStatus: deriveLifecycleStatus(variants),
    visibility: deriveVisibility(variants),
    commercialMode: deriveCommercialMode(variants),
    priceVisibility: derivePriceVisibility(lines, basePriceAmount),
    priceUnit: "ITEM",
    basePriceAmount,
    vatRate: deriveVatRate(lines),
    brands: dedupeById(
      variants
        .map((variant) => variant.brand)
        .filter((brand): brand is ProductBrandOptionDto => brand != null),
    ),
    productSubcategories: dedupeById(
      variants.flatMap((variant) => variant.productSubcategories),
    ).sort((left, right) => {
      const categoryDelta = left.categoryName.localeCompare(right.categoryName, "fr");
      return categoryDelta !== 0 ? categoryDelta : left.name.localeCompare(right.name, "fr");
    }),
    tags: dedupeById(variants.flatMap((variant) => variant.tags)).sort((left, right) =>
      left.name.localeCompare(right.name, "fr"),
    ),
    lineCount: lines.length,
    totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0),
  };
}
