import type { ProductAttributeInputDto } from "./types";
import {
  enumProductAttributKindToLabel,
  normalizeProductAttributeKind,
} from "@/features/products/attribute-definitions";

function isRepeatableSpecialAttribute(attribute: ProductAttributeInputDto) {
  const normalizedKind = normalizeProductAttributeKind(attribute.name ?? attribute.kind);
  return (
    normalizedKind === "color" ||
    normalizedKind === "finish" ||
    attribute.inputType === "COLOR" ||
    attribute.inputType === "FINISH"
  );
}

export function findDuplicateAttributeKind(
  attributes: readonly ProductAttributeInputDto[],
): string | null {
  const seen = new Set<string>();

  for (const attribute of attributes) {
    if (isRepeatableSpecialAttribute(attribute)) {
      continue;
    }

    const normalizedKind = normalizeProductAttributeKind(attribute.name ?? attribute.kind);
    if (!normalizedKind) {
      continue;
    }

    if (seen.has(normalizedKind)) {
      return attribute.name ?? attribute.kind;
    }

    seen.add(normalizedKind);
  }

  return null;
}

export function getAvailableAttributeKinds(
  attributes: readonly ProductAttributeInputDto[],
  currentIndex?: number,
) {
  void attributes;
  void currentIndex;
  return [];
}

export function getNextAvailableAttributeKind(
  attributes: readonly ProductAttributeInputDto[],
) {
  return getAvailableAttributeKinds(attributes)[0] ?? null;
}

export function buildDuplicateAttributeKindMessage(
  duplicateKind: string,
  ownerLabel: string,
) {
  return `${ownerLabel} ne peut avoir qu'un seul attribut de type "${enumProductAttributKindToLabel(duplicateKind)}".`;
}
