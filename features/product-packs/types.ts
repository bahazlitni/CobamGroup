import type { ProductLifecycle } from "@prisma/client";
import type { ProductMediaDto, ProductSubcategoryOptionDto } from "@/features/products/types";

export type ProductPackLineInputDto = {
  productId: number;
  quantity: number;
};

export type ProductPackUpsertInput = {
  sku: string;
  slug: string;
  name: string;
  description: string | null;
  descriptionSeo: string | null;
  subcategoryIds: number[];
  media: ProductMediaDto[];
  lines: ProductPackLineInputDto[];
};

export type ProductPackSelectableProductDto = {
  id: number;
  sku: string;
  slug: string;
  name: string;
  kind: "STANDARD" | "SINGLE" | "VARIANT";
};

export type ProductPackFormOptionsDto = {
  productSubcategories: ProductSubcategoryOptionDto[];
  availableProducts: ProductPackSelectableProductDto[];
};

export type ProductPackListItemDto = {
  id: number;
  sku: string;
  slug: string;
  name: string;
  description: string | null;
  lineCount: number;
  brands: string[];
  lifecycle: ProductLifecycle;
  subcategories: ProductSubcategoryOptionDto[];
  updatedAt: string;
};

export type ProductPackListResult = {
  items: ProductPackListItemDto[];
  productBrandOptions: string[];
  total: number;
  page: number;
  pageSize: number;
};

export type ProductPackDetailDto = ProductPackUpsertInput & {
  id: number;
  createdAt: string;
  updatedAt: string;
  derived: {
    brands: string[];
    lifecycle: ProductLifecycle;
  };
};
