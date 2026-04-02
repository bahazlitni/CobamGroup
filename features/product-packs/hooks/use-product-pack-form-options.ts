"use client";

import { useEffect, useRef, useState } from "react";
import {
  getProductFormOptionsClient,
  ProductsClientError,
} from "@/features/products/client";
import {
  EMPTY_PRODUCT_FORM_OPTIONS,
  type ProductFormOptionsDto,
  type ProductSubcategoryOptionDto,
} from "@/features/products/types";

export function useProductPackFormOptions(
  selectedSubcategories: ProductSubcategoryOptionDto[] = [],
) {
  const [options, setOptions] = useState<ProductFormOptionsDto>(EMPTY_PRODUCT_FORM_OPTIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const selectedSubcategoriesRef = useRef(selectedSubcategories);
  const selectedSignature = JSON.stringify(
    selectedSubcategories.map((subcategory) => ({
      id: subcategory.id,
      name: subcategory.name,
      categoryName: subcategory.categoryName,
    })),
  );

  useEffect(() => {
    selectedSubcategoriesRef.current = selectedSubcategories;
  }, [selectedSubcategories]);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    void (async () => {
      try {
        const fetchedOptions = await getProductFormOptionsClient();
        const missingProductSubcategories = selectedSubcategoriesRef.current.filter(
          (subcategory) =>
            !fetchedOptions.productSubcategories.some((option) => option.id === subcategory.id),
        );

        const normalizedProductSubcategories =
          missingProductSubcategories.length === 0
            ? fetchedOptions.productSubcategories
            : [...fetchedOptions.productSubcategories, ...missingProductSubcategories].sort(
                (left, right) => {
                  const categoryDelta = left.categoryName.localeCompare(
                    right.categoryName,
                    "fr",
                  );

                  if (categoryDelta !== 0) {
                    return categoryDelta;
                  }

                  return left.name.localeCompare(right.name, "fr");
                },
              );

        if (!cancelled) {
          setOptions({
            ...fetchedOptions,
            productSubcategories: normalizedProductSubcategories,
          });
        }
      } catch (err: unknown) {
        const message =
          err instanceof ProductsClientError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Erreur lors du chargement des options produit";

        if (!cancelled) {
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedSignature]);

  return {
    options,
    isLoading,
    error,
  };
}
