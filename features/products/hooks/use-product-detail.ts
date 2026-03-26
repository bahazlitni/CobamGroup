"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteProductClient,
  getProductByIdClient,
  getProductFormOptionsClient,
  ProductsClientError,
  updateProductClient,
} from "../client";
import {
  createEmptyProductEditorFormState,
  productDetailToFormState,
  productEditorFormToPayload,
  type ProductEditorFormState,
} from "../form";
import {
  EMPTY_PRODUCT_FORM_OPTIONS,
  type ProductDetailDto,
  type ProductFormOptionsDto,
} from "../types";

type EditableField = keyof ProductEditorFormState;

export function useProductDetail(productId: number | null) {
  const [product, setProduct] = useState<ProductDetailDto | null>(null);
  const [form, setForm] = useState<ProductEditorFormState>(
    createEmptyProductEditorFormState(),
  );
  const [options, setOptions] = useState<ProductFormOptionsDto>(
    EMPTY_PRODUCT_FORM_OPTIONS,
  );
  const [isLoading, setIsLoading] = useState(Boolean(productId));
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!productId) return;

    setIsLoading(true);
    setError(null);

    try {
      const [fetchedProduct, fetchedOptions] = await Promise.all([
        getProductByIdClient(productId),
        getProductFormOptionsClient(),
      ]);

      const normalizedOptions = fetchedOptions.brands.some(
        (brand) => brand.id === fetchedProduct.brand.id,
      )
        ? fetchedOptions
        : {
            ...fetchedOptions,
            brands: [...fetchedOptions.brands, fetchedProduct.brand].sort(
              (left, right) => left.name.localeCompare(right.name, "fr"),
            ),
          };

      setProduct(fetchedProduct);
      setForm(productDetailToFormState(fetchedProduct));
      setOptions(normalizedOptions);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erreur lors du chargement du produit";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void load();
  }, [load]);

  const setField = useCallback(
    (field: EditableField, value: ProductEditorFormState[EditableField]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const save = useCallback(async () => {
    if (!productId) return null;

    setIsSaving(true);
    setError(null);
    setNotice(null);

    try {
      const updated = await updateProductClient(
        productId,
        productEditorFormToPayload(form),
      );
      setProduct(updated);
      setForm(productDetailToFormState(updated));
      setNotice("Produit mis a jour.");
      return updated;
    } catch (err: unknown) {
      const message =
        err instanceof ProductsClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Erreur lors de la mise a jour du produit";
      setError(message);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [form, productId]);

  const remove = useCallback(async () => {
    if (!productId) return false;

    setIsDeleting(true);
    setError(null);
    setNotice(null);

    try {
      await deleteProductClient(productId);
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof ProductsClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Erreur lors de la suppression du produit";
      setError(message);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [productId]);

  return {
    product,
    form,
    options,
    isLoading,
    isSaving,
    isDeleting,
    error,
    notice,
    setField,
    save,
    remove,
    reload: load,
  };
}
