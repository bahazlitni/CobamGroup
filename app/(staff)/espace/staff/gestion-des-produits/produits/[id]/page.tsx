"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Package } from "lucide-react";
import { toast } from "sonner";
import ProductEditorPanels from "@/components/staff/products/ProductEditorPanels";
import Loading from "@/components/staff/Loading";
import Panel from "@/components/staff/ui/Panel";
import { StaffNotice, StaffPageHeader, StaffStateCard } from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import { canManageProducts } from "@/features/products/access";
import { type ProductEditorFormState } from "@/features/products/form";
import { useProductDetail } from "@/features/products/hooks/use-product-detail";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";

type EditableField = keyof ProductEditorFormState;

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user: authUser } = useStaffSessionContext();
  const productId = params?.id ? Number(params.id) : null;
  const canDelete = !!authUser && canManageProducts(authUser);

  const {
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
  } = useProductDetail(productId);

  useEffect(() => {
    if (notice) {
      toast.success(notice);
    }
  }, [notice]);

  useEffect(() => {
    if (error && product) {
      toast.error(error);
    }
  }, [error, product]);

  const handleDelete = async () => {
    if (!product) return;

    const confirmed = window.confirm(
      `Supprimer le produit ${product.baseName} ?`,
    );
    if (!confirmed) return;

    const deleted = await remove();
    if (deleted) {
      toast.success("Produit supprime.");
      router.replace("/espace/staff/gestion/produits");
    }
  };

  if (!productId) {
    return (
      <StaffStateCard
        title="Produit invalide"
        description="L'identifiant fourni est invalide."
        actionHref="/espace/staff/gestion/produits"
        actionLabel="Retour aux produits"
      />
    );
  }

  if (isLoading) {
    return <Loading />;
  }

  if (error && !product) {
    return (
      <StaffStateCard
        title="Erreur"
        description={error}
        actionHref="/espace/staff/gestion/produits"
        actionLabel="Retour aux produits"
      />
    );
  }

  if (!product) return null;

  return (
    <div className="space-y-6">
      <StaffPageHeader
        backHref="/espace/staff/gestion/produits"
        eyebrow="Produits"
        title={product.baseName}
        icon={Package}
      />

      {error ? (
        <StaffNotice variant="error" title="Modification impossible">
          {error}
        </StaffNotice>
      ) : null}

      <ProductEditorPanels
        form={form}
        options={options}
        isSaving={isSaving}
        saveLabel="Enregistrer"
        onFieldChange={
          setField as (
            field: EditableField,
            value: ProductEditorFormState[EditableField],
          ) => void
        }
        onSave={() => void save()}
        summary={{
          variantCount: product.variantCount,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        }}
        sidebarFooter={
          canDelete ? (
            <Panel
              pretitle="Danger"
              title="Suppression"
              description="La suppression est definitive tant qu'aucune variante n'est encore rattachee."
            >
              <p className="text-sm leading-6 text-slate-500">
                Si ce produit possede deja des variantes, la suppression sera
                refusee pour proteger le catalogue.
              </p>
              <AnimatedUIButton
                type="button"
                onClick={() => void handleDelete()}
                loading={isDeleting}
                loadingText="Suppression..."
                variant="light"
                icon="delete"
                iconPosition="left"
                className="w-full border-red-200 bg-red-50 hover:border-red-300 hover:bg-red-100"
                textClassName="text-red-700"
                iconClassName="text-red-700"
              >
                Supprimer le produit
              </AnimatedUIButton>
            </Panel>
          ) : null
        }
      />
    </div>
  );
}
