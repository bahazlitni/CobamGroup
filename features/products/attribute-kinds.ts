import type { ProductAttributeInputDto } from "./types";
import {
  PRODUCT_ATTRIBUTE_KINDS,
  enumProductAttributKindToLabel,
  normalizeProductAttributeKind,
} from "@/lib/static_tables/attributes";

export function findDuplicateAttributeKind(
  attributes: readonly ProductAttributeInputDto[],
): string | null {
  const seen = new Set<string>();

  for (const attribute of attributes) {
    const normalizedKind = normalizeProductAttributeKind(attribute.kind);
    if (seen.has(normalizedKind)) {
      return attribute.kind;
    }

    seen.add(normalizedKind);
  }

  return null;
}

export function getAvailableAttributeKinds(
  attributes: readonly ProductAttributeInputDto[],
  currentIndex?: number,
) {
  const usedKinds = new Set(
    attributes
      .filter((_, index) => index !== currentIndex)
      .map((attribute) => normalizeProductAttributeKind(attribute.kind)),
  );

  return PRODUCT_ATTRIBUTE_KINDS.filter(
    (kind) => !usedKinds.has(kind),
  );
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
