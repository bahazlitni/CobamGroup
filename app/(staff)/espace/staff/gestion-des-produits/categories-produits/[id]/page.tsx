"use client";

import { useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ListTree } from "lucide-react";
import { toast } from "sonner";
import Loading from "@/components/staff/Loading";
import ProductCategoryEditorPanels from "@/components/staff/product-categories/ProductCategoryEditorPanels";
import Panel from "@/components/staff/ui/Panel";
import { StaffNotice, StaffPageHeader, StaffStateCard } from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";
import { canManageProductCategories } from "@/features/product-categories/access";
import type { ProductCategoryEditorFormState } from "@/features/product-categories/form";
import { useProductCategoryDetail } from "@/features/product-categories/hooks/use-product-category-detail";
import { slugifyProductCategoryName } from "@/features/product-categories/slug";

export default function ProductCategoryDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user: authUser } = useStaffSessionContext();
  const categoryId = params?.id ? Number(params.id) : null;

  const {
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
  } = useProductCategoryDetail(categoryId);

  const canDelete = !!authUser && canManageProductCategories(authUser);

  useEffect(() => {
    if (notice) {
      toast.success(notice);
    }
  }, [notice]);

  useEffect(() => {
    if (error && category) {
      toast.error(error);
    }
  }, [category, error]);

  const handleFieldChange = useCallback(
    <K extends keyof ProductCategoryEditorFormState>(
      field: K,
      value: ProductCategoryEditorFormState[K],
    ) => {
      if (field === "name") {
        const nextName = value as ProductCategoryEditorFormState["name"];
        setField("name", nextName);

        if (
          form.slug === "" ||
          form.slug === slugifyProductCategoryName(form.name)
        ) {
          setField("slug", slugifyProductCategoryName(nextName));
        }
        return;
      }

      if (field === "slug") {
        setField("slug", value as ProductCategoryEditorFormState["slug"]);
        return;
      }

      setField(field, value);
    },
    [form.name, form.slug, setField],
  );

  const handleDelete = async () => {
    if (!category) return;

    const confirmed = window.confirm(
      `Supprimer la categorie ${category.name} ?`,
    );
    if (!confirmed) return;

    const deleted = await remove();
    if (deleted) {
      toast.success("Categorie de produit supprimee.");
      router.replace("/espace/staff/gestion/categories-produits");
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error && !category) {
    return (
      <StaffStateCard
        title="Erreur"
        description={error}
        actionHref="/espace/staff/gestion/categories-produits"
        actionLabel="Retour aux categories"
      />
    );
  }

  if (!category) {
    return null;
  }

  return (
    <div className="space-y-6">
      <StaffPageHeader
        eyebrow="Categories produit"
        title={category.name}
        icon={ListTree}
        actions={
          <AnimatedUIButton
            href="/espace/staff/gestion/categories-produits"
            variant="light"
            icon="arrow-left"
            iconPosition="left"
          >
            Retour a la liste
          </AnimatedUIButton>
        }
      />

      {error ? (
        <StaffNotice variant="error" title="Modification impossible">
          {error}
        </StaffNotice>
      ) : null}

      <ProductCategoryEditorPanels
        form={form}
        parentOptions={parentOptions}
        isSaving={isSaving}
        saveLabel="Enregistrer"
        onFieldChange={handleFieldChange}
        onRegenerateSlug={() =>
          setField("slug", slugifyProductCategoryName(form.name))
        }
        onSave={() => void save()}
        summary={{
          childCount: category.childCount,
          productModelCount: category.productModelCount,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        }}
        sidebarFooter={
          canDelete ? (
            <Panel
              pretitle="Danger"
              title="Suppression"
              description="La suppression est definitive si aucun produit n'utilise encore cette categorie."
            >
              <AnimatedUIButton
                type="button"
                onClick={() => void handleDelete()}
                disabled={isDeleting}
                loading={isDeleting}
                loadingText="Suppression..."
                variant="light"
                icon="delete"
                iconPosition="left"
                className="w-full border-red-200 bg-red-50 hover:border-red-300 hover:bg-red-100"
                textClassName="text-red-700"
                iconClassName="text-red-700"
              >
                Supprimer la categorie
              </AnimatedUIButton>
            </Panel>
          ) : null
        }
      />
    </div>
  );
}
