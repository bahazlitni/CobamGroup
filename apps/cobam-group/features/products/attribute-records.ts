import { ProductTypeAttributeInputType } from "@prisma/client";
import {
  formatProductAttributeKind,
  normalizeProductAttributeKind,
} from "@/features/products/attribute-definitions";
import type { ProductAttributeInputDto } from "./types";

type ProductAttributeRecordLike = {
  id: bigint;
  attributeDefId: bigint | null;
  attributeGroupId: bigint | null;
  name: string;
  label: string;
  value: string;
  unit: string | null;
  inputType: ProductTypeAttributeInputType;
  isRequired: boolean;
  isFilterable: boolean;
  groupName: string | null;
  groupSortOrder: number;
  sortOrder: number;
  attributeDef?: {
    selectOptions: string[];
  } | null;
};

function normalizeAttributeName(value: string) {
  const trimmed = value.trim();
  const normalized = normalizeProductAttributeKind(trimmed) || trimmed;
  const lowerName = normalized.toLowerCase();

  if (lowerName === "color" || lowerName === "finish") {
    return lowerName;
  }

  return normalized;
}

export function inferAttributeInputType(name: string): ProductTypeAttributeInputType {
  const normalized = name.trim().toLowerCase();
  if (normalized === "color") {
    return "COLOR";
  }
  if (normalized === "finish") {
    return "FINISH";
  }
  return "TEXT";
}

export function mapProductAttributeRecord(
  attribute: ProductAttributeRecordLike,
): ProductAttributeInputDto {
  return {
    id: Number(attribute.id),
    attributeDefId:
      attribute.attributeDefId == null ? null : Number(attribute.attributeDefId),
    attributeGroupId:
      attribute.attributeGroupId == null ? null : Number(attribute.attributeGroupId),
    kind: attribute.name,
    name: attribute.name,
    label: attribute.label,
    value: attribute.value,
    unit: attribute.unit,
    inputType: attribute.inputType,
    selectOptions: attribute.attributeDef?.selectOptions ?? [],
    isRequired: attribute.isRequired,
    isFilterable: attribute.isFilterable,
    groupName: attribute.groupName,
    groupSortOrder: attribute.groupSortOrder,
    sortOrder: attribute.sortOrder,
  };
}

export function buildProductAttributeCreateData(
  productId: bigint,
  attribute: ProductAttributeInputDto,
  index: number,
) {
  const name = normalizeAttributeName(attribute.name ?? attribute.kind);
  const label =
    attribute.label?.trim() ||
    formatProductAttributeKind(name) ||
    name;

  return {
    productId,
    attributeDefId:
      attribute.attributeDefId == null ? null : BigInt(attribute.attributeDefId),
    attributeGroupId:
      attribute.attributeGroupId == null ? null : BigInt(attribute.attributeGroupId),
    name,
    label,
    value: attribute.value ?? "",
    unit: attribute.unit?.trim() || null,
    inputType: attribute.inputType ?? inferAttributeInputType(name),
    isRequired: attribute.isRequired ?? false,
    isFilterable: attribute.isFilterable ?? false,
    groupName: attribute.groupName?.trim() || null,
    groupSortOrder: attribute.groupSortOrder ?? 0,
    sortOrder: attribute.sortOrder ?? index,
  };
}
