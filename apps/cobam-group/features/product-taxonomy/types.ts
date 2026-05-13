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

export type ProductAttributeDefinitionDto = {
  id: number;
  key: string;
  label: string;
  unit: string | null;
  inputType: ProductTypeAttributeInputType;
  selectOptions: string[];
};

export type ProductAttributeDefinitionInput = {
  key: string;
  label: string;
  unit: string | null;
  inputType: ProductTypeAttributeInputType;
  selectOptions: string[];
};

export type ProductTaxonomyAttributeDto = {
  id: number;
  productTypeId: number;
  attributeGroupId: number | null;
  attributeGroupName: string | null;
  attributeDefinitionId: number;
  definitionLabel: string;
  name: string;
  label: string;
  labelOverride: string;
  unit: string | null;
  inputType: ProductTypeAttributeInputType;
  selectOptions: string[];
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
  hasColor: boolean;
  hasFinish: boolean;
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
  attributeDefinitions: ProductAttributeDefinitionDto[];
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
  hasColor?: boolean;
  hasFinish?: boolean;
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
  attributeDefinitionId: number;
  label: string;
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
