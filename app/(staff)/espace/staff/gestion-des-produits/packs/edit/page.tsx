"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Boxes } from "lucide-react";
import { toast } from "sonner";
import Loading from "@/components/staff/Loading";
import ProductPackEditorPanels from "@/components/staff/product-packs/ProductPackEditorPanels";
import {
  StaffNotice,
  StaffPageHeader,
  StaffStateCard,
  UnsavedChangesGuard,
} from "@/components/staff/ui";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";
import { canCreateProducts, canManageProducts } from "@/features/products/access";
import {
  createProductPackClient,
  ProductPacksClientError,
} from "@/features/product-packs/client";
import {
  createEmptyProductPackEditorFormState,
  productPackEditorFormToPayload,
  type ProductPackEditorFormState,
} from "@/features/product-packs/form";
import { useProductPackDetail } from "@/features/product-packs/hooks/use-product-pack-detail";
import { useProductPackFormOptions } from "@/features/product-packs/hooks/use-product-pack-form-options";

export default function ProductPackEditPage() {
  return (
    <Suspense fallback={<ProductPackEditorLoading />}>
      <ProductPackEditPageContent />
    </Suspense>
  );
}

function ProductPackEditPageContent() {
  const searchParams = useSearchParams();
  const packId = useMemo(() => {
    const raw = searchParams.get("id");

    if (!raw) {
      return null;
    }

    const parsed = Number(raw);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }, [searchParams]);

  if (packId) {
    return <ExistingProductPackEditor packId={packId} />;
  }

  return <NewProductPackEditor />;
}

function NewProductPackEditor() {
  const router = useRouter();
  const { user: authUser, isLoading: isAuthLoading } = useStaffSessionContext();
  const canCreatePack = authUser ? canCreateProducts(authUser) : false;
  const [initialForm] = useState<ProductPackEditorFormState>(() =>
    createEmptyProductPackEditorFormState(),
  );
  const [form, setForm] = useState<ProductPackEditorFormState>(initialForm);
  const { options, isLoading: isLoadingOptions, error: optionsError } = useProductPackFormOptions();
  const [isSaving, setIsSaving] = useState(false);
  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialForm),
    [form, initialForm],
  );

  const handleSave = async () => {
    if (!canCreatePack) {
      toast.error("Acces refuse");
      return false;
    }

    setIsSaving(true);

    try {
      const pack = await createProductPackClient(productPackEditorFormToPayload(form));
      toast.success("Pack produit cree.");
      router.replace(`/espace/staff/gestion-des-produits/packs/edit?id=${pack.id}`);
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof ProductPacksClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Erreur lors de la creation du pack produit";
      toast.error(message);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (optionsError) {
      toast.error(optionsError);
    }
  }, [optionsError]);

  if (isAuthLoading || isLoadingOptions) {
    return <ProductPackEditorLoading />;
  }

  if (!canCreatePack) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-lg font-semibold text-cobam-dark-blue">Acces refuse</h1>
        <p className="mb-4 text-sm text-slate-600">
          Vous n&apos;avez pas l&apos;autorisation de creer un pack produit.
        </p>
        <Link
          href="/espace/staff/gestion-des-produits/packs"
          className="inline-flex items-center gap-2 rounded-xl bg-cobam-dark-blue px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cobam-water-blue"
        >
          Retour
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UnsavedChangesGuard isDirty={isDirty} onSaveAndContinue={handleSave} />

      <StaffPageHeader
        backHref="/espace/staff/gestion-des-produits/packs"
        eyebrow="Produits"
        title="Creation d'un pack produit"
        icon={Boxes}
      />

      <ProductPackEditorPanels
        mode="create"
        form={form}
        options={options}
        onFormChange={setForm}
        isSaving={isSaving}
        onSave={() => void handleSave()}
      />
    </div>
  );
}

function ExistingProductPackEditor({ packId }: { packId: number }) {
  const router = useRouter();
  const { user: authUser } = useStaffSessionContext();
  const canDelete = !!authUser && canManageProducts(authUser);
  const {
    pack,
    form,
    isDirty,
    isLoading,
    isSaving,
    isDeleting,
    error,
    notice,
    setForm,
    save,
    remove,
  } = useProductPackDetail(packId);
  const {
    options,
    isLoading: isLoadingOptions,
    error: optionsError,
  } = useProductPackFormOptions(pack?.productSubcategories ?? []);

  useEffect(() => {
    if (notice) {
      toast.success(notice);
    }
  }, [notice]);

  useEffect(() => {
    if (error && pack) {
      toast.error(error);
    }
  }, [error, pack]);

  useEffect(() => {
    if (optionsError) {
      toast.error(optionsError);
    }
  }, [optionsError]);

  const handleDelete = async () => {
    if (!pack) {
      return;
    }

    const confirmed = window.confirm(
      `Supprimer le pack ${pack.name} ? Cette action retirera aussi sa projection produit.`,
    );

    if (!confirmed) {
      return;
    }

    const deleted = await remove();
    if (deleted) {
      toast.success("Pack produit supprime.");
      router.replace("/espace/staff/gestion-des-produits/packs");
    }
  };

  if (isLoading || isLoadingOptions) {
    return <ProductPackEditorLoading />;
  }

  if (error && !pack) {
    return (
      <StaffStateCard
        title="Erreur"
        description={error}
        actionHref="/espace/staff/gestion-des-produits/packs"
        actionLabel="Retour aux packs"
      />
    );
  }

  if (!pack) {
    return null;
  }

  return (
    <div className="space-y-6">
      <UnsavedChangesGuard
        isDirty={isDirty}
        onSaveAndContinue={async () => Boolean(await save())}
      />

      <StaffPageHeader
        backHref="/espace/staff/gestion-des-produits/packs"
        eyebrow="Produits"
        title={pack.name}
        icon={Boxes}
      />

      {error ? (
        <StaffNotice variant="error" title="Modification impossible">
          {error}
        </StaffNotice>
      ) : null}

      <ProductPackEditorPanels
        mode="edit"
        form={form}
        options={options}
        onFormChange={setForm}
        pack={pack}
        isSaving={isSaving}
        isDeleting={isDeleting}
        onSave={() => void save()}
        onDelete={canDelete ? () => void handleDelete() : undefined}
      />
    </div>
  );
}

function ProductPackEditorLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-300 bg-white px-5 py-4 shadow-sm">
        <Loading />
      </div>
    </div>
  );
}
