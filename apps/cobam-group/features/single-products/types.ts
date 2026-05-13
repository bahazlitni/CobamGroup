import type {
  ProductFormOptionsDto,
  ProductSubcategoryOptionDto,
  ProductVariantInputDto,
} from "@/features/products/types";

export type SingleProductUpsertInput = Omit<ProductVariantInputDto, "id">;

export type SingleProductDetailDto = SingleProductUpsertInput & {
  id: number;
  createdAt: string;
  updatedAt: string;
};

export type SingleProductFormOptionsDto = ProductFormOptionsDto;

export type SingleProductAiSuggestionRequest = {
  name: string;
  description: string | null;
  descriptionSeo: string | null;
  tags: string[];
  attributes: ProductVariantInputDto["attributes"];
  datasheetUrl: string | null;
  mediaUrls: string[];
  brand: string | null;
  subcategoryOptions: ProductSubcategoryOptionDto[];
};

export type SingleProductAiSuggestionResponse = {
  descriptionText: string;
  descriptionRichText: string;
  descriptionSeo: string;
  tags: string[];
  attributes: ProductVariantInputDto["attributes"];
  subcategoryIds: number[];
};
