"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteProductCategoryClient,
  getProductCategoryByIdClient,
  listProductCategoryParentOptionsClient,
  ProductCategoriesClientError,
  updateProductCategoryClient,
} from "../client";
import {
  createEmptyProductCategoryEditorFormState,
  productCategoryDetailToFormState,
  productCategoryEditorFormToPayload,
  type ProductCategoryEditorFormState,
} from "../form";
import type {
  ProductCategoryDetailDto,
  ProductCategoryParentOptionDto,
} from "../types";

export function useProductCategoryDetail(categoryId: number | null) {
  const [category, setCategory] = useState<ProductCategoryDetailDto | null>(null);
  const [form, setForm] = useState<ProductCategoryEditorFormState>(
    createEmptyProductCategoryEditorFormState(),
  );
  const [parentOptions, setParentOptions] = useState<
    ProductCategoryParentOptionDto[]
  >([]);
  const [isLoading, setIsLoading] = useState(Boolean(categoryId));
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!categoryId) return;

    setIsLoading(true);
    setError(null);

    try {
      const [fetchedCategory, fetchedParentOptions] = await Promise.all([
        getProductCategoryByIdClient(categoryId),
        listProductCategoryParentOptionsClient(),
      ]);

      setCategory(fetchedCategory);
      setForm(productCategoryDetailToFormState(fetchedCategory));
      setParentOptions(
        fetchedParentOptions.filter((item) => item.id !== categoryId),
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement de la categorie de produit";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    void load();
  }, [load]);

  const setField = useCallback(
    <K extends keyof ProductCategoryEditorFormState>(
      key: K,
      value: ProductCategoryEditorFormState[K],
    ) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const save = useCallback(async () => {
    if (!categoryId) return null;

    setIsSaving(true);
    setError(null);
    setNotice(null);

    try {
      const updated = await updateProductCategoryClient(
        categoryId,
        productCategoryEditorFormToPayload(form),
      );
      setCategory(updated);
      setForm(productCategoryDetailToFormState(updated));
      setNotice("Categorie de produit mise a jour.");
      return updated;
    } catch (err: unknown) {
      const message =
        err instanceof ProductCategoriesClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Erreur lors de la mise a jour de la categorie de produit";
      setError(message);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [categoryId, form]);

  const remove = useCallback(async () => {
    if (!categoryId) return false;

    setIsDeleting(true);
    setError(null);
    setNotice(null);

    try {
      await deleteProductCategoryClient(categoryId);
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof ProductCategoriesClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Erreur lors de la suppression de la categorie de produit";
      setError(message);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [categoryId]);

  return {
    category,
    form,
    parentOptions,
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
