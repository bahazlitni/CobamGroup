import type {
  ProductAvailability,
  ProductInventoryVisibility,
  ProductPricingVisibility,
  StockUnit,
} from "@prisma/client";

export const STOCK_UNIT_VALUES = [
  "PIECE",
  "TON",
  "KILOGRAM",
  "GRAM",
  "MILLIGRAM",
  "CUBIC_METER",
  "LITER",
  "CENTILITER",
  "MILLILITER",
  "METER",
  "CENTIMETER",
  "MILLIMETER",
  "SQUARE_METER",
  "SQUARE_CENTIMETER",
] satisfies StockUnit[];

export const PRODUCT_AVAILABILITY_VALUES = [
  "IN_STOCK",
  "ON_ORDER",
  "OUT_OF_STOCK",
  "DISCONTINUED",
] satisfies ProductAvailability[];

export const PRODUCT_INVENTORY_VISIBILITY_VALUES = [
  "AUTO",
  "ALWAYS",
  "NEVER",
] satisfies ProductInventoryVisibility[];

export const PRODUCT_PRICING_VISIBILITY_VALUES = [
  "AUTO",
  "ALWAYS",
  "NEVER",
] satisfies ProductPricingVisibility[];

export type ProductEditFieldsDto = {
  displayName: string;
  titleSeo: string | null;
  guaranteeMonths: number;
  visibleEcommerce: boolean;
  visibleVitrine: boolean;
  isFeatured: boolean;
  isNew: boolean;
  stockAvailable: string;
  stockAlertThreshold: string;
  stockUnit: StockUnit;
  stockAvailability: ProductAvailability;
  stockVisibility: ProductInventoryVisibility;
  basePriceTtcTnd: string | null;
  currentPriceTtcTnd: string | null;
  vatRate: string;
  priceVisibility: ProductPricingVisibility;
};

export function createDefaultProductEditFields(
  overrides: Partial<ProductEditFieldsDto> = {},
): ProductEditFieldsDto {
  return {
    displayName: "",
    titleSeo: null,
    guaranteeMonths: 0,
    visibleEcommerce: true,
    visibleVitrine: true,
    isFeatured: false,
    isNew: false,
    stockAvailable: "0",
    stockAlertThreshold: "0",
    stockUnit: "PIECE",
    stockAvailability: "IN_STOCK",
    stockVisibility: "AUTO",
    basePriceTtcTnd: null,
    currentPriceTtcTnd: null,
    vatRate: "19.000",
    priceVisibility: "AUTO",
    ...overrides,
  };
}
