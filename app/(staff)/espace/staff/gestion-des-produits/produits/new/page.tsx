"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ProductEditorPanels from "@/components/staff/products/ProductEditorPanels";
import Loading from "@/components/staff/Loading";
import { canCreateProducts } from "@/features/products/access";
import {
  createProductClient,
  getProductFormOptionsClient,
  ProductsClientError,
} from "@/features/products/client";
import {
  createEmptyProductEditorFormState,
  productEditorFormToPayload,
  type ProductEditorFormState,
} from "@/features/products/form";
import {
  EMPTY_PRODUCT_FORM_OPTIONS,
  type ProductFormOptionsDto,
} from "@/features/products/types";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";
import { StaffPageHeader } from "@/components/staff/ui";

type EditableField = keyof ProductEditorFormState;

export default function NewProductPage() {
  const router = useRouter();
  const { user: authUser, isLoading: isAuthLoading } = useStaffSessionContext();
  const canCreateProduct = authUser ? canCreateProducts(authUser) : false;

  const [form, setForm] = useState<ProductEditorFormState>(
    createEmptyProductEditorFormState(),
  );
  const [options, setOptions] = useState<ProductFormOptionsDto>(
    EMPTY_PRODUCT_FORM_OPTIONS,
  );
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isAuthLoading || !canCreateProduct) {
      if (!isAuthLoading) {
        setIsLoadingOptions(false);
      }
      return;
    }

    let cancelled = false;
    setIsLoadingOptions(true);

    void (async () => {
      try {
        const nextOptions = await getProductFormOptionsClient();
        if (!cancelled) {
          setOptions(nextOptions);
        }
      } catch (err: unknown) {
        const message =
          err instanceof ProductsClientError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Erreur lors du chargement des options produit";
        if (!cancelled) {
          toast.error(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingOptions(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [canCreateProduct, isAuthLoading]);

  const setField = (
    field: EditableField,
    value: ProductEditorFormState[EditableField],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!canCreateProduct) {
      toast.error("Acces refuse");
      return;
    }

    setIsSaving(true);

    try {
      const product = await createProductClient(productEditorFormToPayload(form));
      toast.success("Produit cree.");
      router.replace(`/espace/staff/gestion-des-produits/produits/${product.id}`);
    } catch (err: unknown) {
      const message =
        err instanceof ProductsClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Erreur lors de la creation du produit";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isAuthLoading || isLoadingOptions) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <Loading />
        </div>
      </div>
    );
  }

  if (!canCreateProduct) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-lg font-semibold text-cobam-dark-blue">
          Acces refuse
        </h1>
        <p className="mb-4 text-sm text-slate-600">
          Vous n&apos;avez pas l&apos;autorisation de creer un produit.
        </p>
        <Link
          href="/espace/staff/gestion/produits"
          className="inline-flex items-center gap-2 rounded-xl bg-cobam-dark-blue px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cobam-water-blue"
        >
          Retour
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StaffPageHeader
        eyebrow="Produits"
        title="Creation d'un produit"
      />

      <ProductEditorPanels
        form={form}
        options={options}
        isSaving={isSaving}
        saveLabel="Creer le produit"
        onFieldChange={setField}
        onSave={() => void handleSave()}
        disableSave={isLoadingOptions}
      />
    </div>
  );
}
