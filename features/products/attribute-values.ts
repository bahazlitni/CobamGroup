import type { ProductAttributeDataType } from "./types";

type ParsedProductAttributeValue = {
  valueText: string | null;
  valueNumber: number | null;
  valueBoolean: boolean | null;
  valueJson: unknown | null;
};

export function getProductAttributeDataTypeLabel(
  dataType: ProductAttributeDataType,
) {
  switch (dataType) {
    case "TEXT":
      return "Texte";
    case "NUMBER":
      return "Nombre";
    case "BOOLEAN":
      return "Booléen";
    default:
      return dataType;
  }
}

export function parseRawProductAttributeValue(
  dataType: ProductAttributeDataType,
  rawValue: string | null,
): ParsedProductAttributeValue {
  const normalized =
    typeof rawValue === "string" ? rawValue.trim() : rawValue ?? null;

  if (!normalized) {
    return {
      valueText: null,
      valueNumber: null,
      valueBoolean: null,
      valueJson: null,
    };
  }

  switch (dataType) {
    case "NUMBER": {
      const parsedNumber = Number(normalized.replace(",", "."));
      if (!Number.isFinite(parsedNumber)) {
        throw new Error("La valeur numérique d'un attribut est invalide.");
      }

      return {
        valueText: null,
        valueNumber: parsedNumber,
        valueBoolean: null,
        valueJson: null,
      };
    }

    case "BOOLEAN": {
      if (normalized !== "true" && normalized !== "false") {
        throw new Error("La valeur booléenne d'un attribut est invalide.");
      }

      return {
        valueText: null,
        valueNumber: null,
        valueBoolean: normalized === "true",
        valueJson: null,
      };
    }

    case "TEXT":
    default:
      return {
        valueText: normalized,
        valueNumber: null,
        valueBoolean: null,
        valueJson: null,
      };
  }
}

export function formatStoredProductAttributeValue(input: {
  dataType: ProductAttributeDataType;
  valueText: string | null;
  valueNumber: { toString(): string } | number | null;
  valueBoolean: boolean | null;
  valueJson: unknown | null;
}): string | null {
  switch (input.dataType) {
    case "NUMBER":
      return input.valueNumber != null ? String(input.valueNumber) : null;
    case "BOOLEAN":
      return input.valueBoolean == null ? null : String(input.valueBoolean);
    case "TEXT":
    default:
      return input.valueText;
  }
}
