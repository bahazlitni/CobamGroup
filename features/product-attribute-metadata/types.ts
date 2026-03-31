import type { ProductAttributeDataType } from "@/features/products/types";

export type ProductAttributeMetadataDto = {
  id: number;
  name: string;
  dataType: ProductAttributeDataType;
  unit: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductAttributeMetadataSuggestionDto = {
  id: number;
  name: string;
  dataType: ProductAttributeDataType;
  unit: string | null;
};

export type ProductAttributeMetadataInput = {
  name: string;
  dataType: ProductAttributeDataType;
  unit: string | null;
};
