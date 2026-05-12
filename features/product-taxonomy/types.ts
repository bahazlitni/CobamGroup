import type { ProductTypeAttributeInputType, StockUnit } from "@prisma/client";
import type { ProductSubcategoryOptionDto } from "@/features/products/types";

export type ProductTaxonomyGroupDto = {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
};

export type ProductTaxonomyAttributeGroupDto = {
  id: number;
  productTypeId: number | null;
  name: string;
  slug: string;
  sortOrder: number;
};

export type ProductTaxonomyAttributeDto = {
  id: number;
  productTypeId: number;
  attributeGroupId: number | null;
  attributeGroupName: string | null;
  name: string;
  label: string;
  unit: string | null;
  inputType: ProductTypeAttributeInputType;
  isRequired: boolean;
  isFilterable: boolean;
  sortOrder: number;
};

export type ProductTaxonomyTypeDto = {
  id: number;
  groupId: number | null;
  groupName: string | null;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  presetTags: string;
  presetSubcategoryIds: number[];
  presetStockUnit: StockUnit | null;
  presetVatRate: string | null;
  presetGuaranteeMonths: number | null;
  attributeGroups: ProductTaxonomyAttributeGroupDto[];
  attributes: ProductTaxonomyAttributeDto[];
};

export type ProductTypesAdminDto = {
  groups: ProductTaxonomyGroupDto[];
  productTypes: ProductTaxonomyTypeDto[];
  productSubcategories?: ProductSubcategoryOptionDto[];
};

export type ProductTaxonomyGroupInput = {
  name: string;
  slug: string;
  sortOrder?: number;
};

export type ProductTaxonomyTypeInput = {
  groupId: number | null;
  name: string;
  slug: string;
  description: string | null;
  sortOrder?: number;
  presetTags?: string;
  presetSubcategoryIds?: number[];
  presetStockUnit?: StockUnit | null;
  presetVatRate?: string | null;
  presetGuaranteeMonths?: number | null;
};

export type ProductTaxonomyAttributeGroupInput = {
  productTypeId: number;
  name: string;
  slug: string;
  sortOrder: number;
};

export type ProductTaxonomyAttributeInput = {
  productTypeId: number;
  attributeGroupId: number | null;
  name: string;
  label: string;
  unit: string | null;
  inputType: ProductTypeAttributeInputType;
  isRequired: boolean;
  isFilterable: boolean;
  sortOrder: number;
};

export type ProductColorDto = {
  id: number;
  key: string;
  label: string;
  value: string;
};

export type ProductColorInput = {
  key: string;
  label: string;
  value: string;
};

export type ProductFinishDto = {
  id: number;
  key: string;
  label: string;
  color: string | null;
  imageMediaId: number | null;
};

export type ProductFinishInput = {
  key: string;
  label: string;
  color: string | null;
  imageMediaId: number | null;
};

export type ProductTaxonomyEntity = "group" | "productType" | "attributeGroup" | "attribute";
