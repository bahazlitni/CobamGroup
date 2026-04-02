"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteProductPackClient,
  getProductPackByIdClient,
  ProductPacksClientError,
  updateProductPackClient,
} from "../client";
import {
  createEmptyProductPackEditorFormState,
  productPackDetailToFormState,
  productPackEditorFormToPayload,
  type ProductPackEditorFormState,
} from "../form";
import type { ProductPackDetailDto } from "../types";

type EditableField = keyof ProductPackEditorFormState;

export function useProductPackDetail(packId: number | null) {
  const [pack, setPack] = useState<ProductPackDetailDto | null>(null);
  const [form, setForm] = useState<ProductPackEditorFormState>(
    createEmptyProductPackEditorFormState(),
  );
  const [savedForm, setSavedForm] = useState<ProductPackEditorFormState>(
    createEmptyProductPackEditorFormState(),
  );
  const [isLoading, setIsLoading] = useState(Boolean(packId));
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!packId) return;

    setIsLoading(true);
    setError(null);

    try {
      const fetchedPack = await getProductPackByIdClient(packId);
      const nextForm = productPackDetailToFormState(fetchedPack);
      setPack(fetchedPack);
      setForm(nextForm);
      setSavedForm(nextForm);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors du chargement du pack";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [packId]);

  useEffect(() => {
    void load();
  }, [load]);

  const setField = useCallback(
    (field: EditableField, value: ProductPackEditorFormState[EditableField]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const save = useCallback(async () => {
    if (!packId) return null;

    setIsSaving(true);
    setError(null);
    setNotice(null);

    try {
      const updated = await updateProductPackClient(packId, productPackEditorFormToPayload(form));
      const nextForm = productPackDetailToFormState(updated);
      setPack(updated);
      setForm(nextForm);
      setSavedForm(nextForm);
      setNotice("Pack produit mis a jour.");
      return updated;
    } catch (err: unknown) {
      const message =
        err instanceof ProductPacksClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Erreur lors de la mise a jour du pack produit";
      setError(message);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [form, packId]);

  const remove = useCallback(async () => {
    if (!packId) return false;

    setIsDeleting(true);
    setError(null);
    setNotice(null);

    try {
      await deleteProductPackClient(packId);
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof ProductPacksClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Erreur lors de la suppression du pack produit";
      setError(message);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [packId]);

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(savedForm),
    [form, savedForm],
  );

  return {
    pack,
    form,
    isDirty,
    isLoading,
    isSaving,
    isDeleting,
    error,
    notice,
    setField,
    setForm,
    save,
    remove,
    reload: load,
  };
}
