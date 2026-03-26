"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ListTree } from "lucide-react";
import { toast } from "sonner";
import Loading from "@/components/staff/Loading";
import ProductCategoryEditorPanels from "@/components/staff/product-categories/ProductCategoryEditorPanels";
import { StaffNotice, StaffPageHeader, StaffStateCard } from "@/components/staff/ui";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";
import { canCreateProductCategories } from "@/features/product-categories/access";
import {
  createProductCategoryClient,
  listProductCategoryParentOptionsClient,
  ProductCategoriesClientError,
} from "@/features/product-categories/client";
import {
  createEmptyProductCategoryEditorFormState,
  productCategoryEditorFormToPayload,
  type ProductCategoryEditorFormState,
} from "@/features/product-categories/form";
import { slugifyProductCategoryName } from "@/features/product-categories/slug";
import type { ProductCategoryParentOptionDto } from "@/features/product-categories/types";

export default function NewProductCategoryPage() {
  const router = useRouter();
  const { user: authUser, isLoading: isAuthLoading } = useStaffSessionContext();
  const canCreateCategory = authUser
    ? canCreateProductCategories(authUser)
    : false;

  const [form, setForm] = useState<ProductCategoryEditorFormState>(
    createEmptyProductCategoryEditorFormState(),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [parentOptions, setParentOptions] = useState<
    ProductCategoryParentOptionDto[]
  >([]);
  const [isLoadingParents, setIsLoadingParents] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!canCreateCategory) {
      setIsLoadingParents(false);
      return;
    }

    let isMounted = true;

    const loadParents = async () => {
      setIsLoadingParents(true);
      setLoadError(null);

      try {
        const items = await listProductCategoryParentOptionsClient();
        if (isMounted) {
          setParentOptions(items);
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Erreur lors du chargement des categories parentes.";
        if (isMounted) {
          setLoadError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoadingParents(false);
        }
      }
    };

    void loadParents();

    return () => {
      isMounted = false;
    };
  }, [canCreateCategory]);

  const setField = useCallback(
    <K extends keyof ProductCategoryEditorFormState>(
      field: K,
      value: ProductCategoryEditorFormState[K],
    ) => {
      setForm((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const handleFieldChange = useCallback(
    <K extends keyof ProductCategoryEditorFormState>(
      field: K,
      value: ProductCategoryEditorFormState[K],
    ) => {
      if (field === "name") {
        const nextName = value as ProductCategoryEditorFormState["name"];
        setField("name", nextName);

        if (!slugTouched) {
          setField("slug", slugifyProductCategoryName(nextName));
        }
        return;
      }

      if (field === "slug") {
        setSlugTouched(true);
        setField("slug", value as ProductCategoryEditorFormState["slug"]);
        return;
      }

      setField(field, value);
    },
    [setField, slugTouched],
  );

  const handleSave = async () => {
    if (!canCreateCategory) {
      toast.error("Acces refuse");
      return;
    }

    const payload = productCategoryEditorFormToPayload(form);

    if (!payload.name || !payload.slug) {
      toast.error("Nom et slug requis");
      return;
    }

    setIsSaving(true);

    try {
      const category = await createProductCategoryClient(payload);
      toast.success("Categorie de produit creee.");
      router.replace(`/espace/staff/gestion/categories-produits/${category.id}`);
    } catch (error: unknown) {
      const message =
        error instanceof ProductCategoriesClientError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Erreur lors de la creation de la categorie de produit.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isAuthLoading || isLoadingParents) {
    return <Loading />;
  }

  if (!canCreateCategory) {
    return (
      <StaffStateCard
        variant="forbidden"
        title="Acces refuse"
        description="Vous n'avez pas l'autorisation de creer une categorie de produit."
        actionHref="/espace/staff/gestion/categories-produits"
        actionLabel="Retour aux categories"
      />
    );
  }

  const payload = productCategoryEditorFormToPayload(form);

  return (
    <div className="space-y-6">
      <StaffPageHeader
        eyebrow="Categories produit"
        title="Nouvelle categorie"
        icon={ListTree}
      />

      {loadError ? (
        <StaffNotice variant="error" title="Chargement impossible">
          {loadError}
        </StaffNotice>
      ) : null}

      <ProductCategoryEditorPanels
        form={form}
        parentOptions={parentOptions}
        isSaving={isSaving}
        saveLabel="Creer la categorie"
        onFieldChange={handleFieldChange}
        onSave={() => void handleSave()}
        disableSave={!payload.name || !payload.slug}
      />
    </div>
  );
}
