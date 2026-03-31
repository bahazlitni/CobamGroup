import { PRODUCT_PRICE_UNIT_OPTIONS, type ProductPriceUnit } from "./types";

const PRODUCT_PRICE_UNIT_LABELS: Record<ProductPriceUnit, string> = {
  ITEM: "Par article (item)",
  MILLIGRAM: "Poids: mg",
  GRAM: "Poids: g",
  KILOGRAM: "Poids: kg",
  MILLILITER: "Volume: ml",
  CENTILITER: "Volume: cl",
  LITER: "Volume: L",
  CUBIC_METER: "Volume: m3",
  MILLIMETER: "Taille: mm",
  CENTIMETER: "Taille: cm",
  METER: "Taille: m",
  SQUARE_METER: "Surface: m2",
};

const PRODUCT_PRICE_UNIT_SYMBOLS: Record<ProductPriceUnit, string> = {
  ITEM: "item",
  MILLIGRAM: "mg",
  GRAM: "g",
  KILOGRAM: "kg",
  MILLILITER: "ml",
  CENTILITER: "cl",
  LITER: "L",
  CUBIC_METER: "m3",
  MILLIMETER: "mm",
  CENTIMETER: "cm",
  METER: "m",
  SQUARE_METER: "m2",
};

export function getProductPriceUnitLabel(unit: ProductPriceUnit) {
  return PRODUCT_PRICE_UNIT_LABELS[unit];
}

export function getProductPriceUnitSymbol(unit: ProductPriceUnit) {
  return PRODUCT_PRICE_UNIT_SYMBOLS[unit];
}

export const PRODUCT_PRICE_UNIT_SELECT_OPTIONS = PRODUCT_PRICE_UNIT_OPTIONS.map((unit) => ({
  value: unit,
  label: getProductPriceUnitLabel(unit),
}));
