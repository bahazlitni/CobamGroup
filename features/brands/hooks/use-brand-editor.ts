"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BrandsClientError,
  createBrandClient,
  deleteBrandClient,
  getBrandByIdClient,
  updateBrandClient,
} from "../client";
import { slugifyBrandName } from "../slug";
import type {
  BrandCreateInput,
  BrandDetailDto,
  BrandShowcasePlacement,
  BrandUpdateInput,
} from "../types";

export type BrandFormState = {
  name: string;
  slug: string;
  description: string;
  logoMediaId: number | null;
  showcasePlacement: BrandShowcasePlacement;
  isProductBrand: boolean;
};

function toFormState(brand: BrandDetailDto | null): BrandFormState {
  return {
    name: brand?.name ?? "",
    slug: brand?.slug ?? "",
    description: brand?.description ?? "",
    logoMediaId: brand?.logoMediaId ?? null,
    showcasePlacement: brand?.showcasePlacement ?? "NONE",
    isProductBrand: brand?.isProductBrand ?? true,
  };
}

function toPayload(state: BrandFormState): BrandCreateInput | BrandUpdateInput {
  return {
    name: state.name.trim(),
    slug: state.slug.trim() || slugifyBrandName(state.name),
    description: state.description.trim() || null,
    logoMediaId: state.logoMediaId,
    showcasePlacement: state.showcasePlacement,
    isProductBrand: state.isProductBrand,
  };
}

export function useBrandEditor(brandId: number | null) {
  const [brand, setBrand] = useState<BrandDetailDto | null>(null);
  const [form, setForm] = useState<BrandFormState>(toFormState(null));
  const [isLoading, setIsLoading] = useState(Boolean(brandId));
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!brandId) {
      setBrand(null);
      setForm(toFormState(null));
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fetched = await getBrandByIdClient(brandId);
      setBrand(fetched);
      setForm(toFormState(fetched));
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement de la marque";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [brandId]);

  useEffect(() => {
    void load();
  }, [load]);

  const setField = useCallback(
    <K extends keyof BrandFormState>(key: K, value: BrandFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const save = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    setNotice(null);

    try {
      const payload = toPayload(form);
      const saved = brandId
        ? await updateBrandClient(brandId, payload)
        : await createBrandClient(payload);

      setBrand(saved);
      setForm(toFormState(saved));
      setNotice(brandId ? "Marque mise a jour." : "Marque creee.");
      return saved;
    } catch (err: unknown) {
      const message =
        err instanceof BrandsClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : brandId
              ? "Erreur lors de la mise a jour de la marque"
              : "Erreur lors de la creation de la marque";
      setError(message);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [brandId, form]);

  const remove = useCallback(async () => {
    if (!brandId) return false;

    setIsDeleting(true);
    setError(null);
    setNotice(null);

    try {
      await deleteBrandClient(brandId);
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof BrandsClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Erreur lors de la suppression de la marque";
      setError(message);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [brandId]);

  return {
    brand,
    form,
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
