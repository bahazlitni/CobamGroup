"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ProductCommercialMode,
  ProductLifecycle,
  ProductStockUnit,
} from "@prisma/client";
import { Package } from "lucide-react";
import { toast } from "sonner";
import Loading from "@/components/staff/Loading";
import ArticleRichTextEditor from "@/components/staff/articles/article-rich-text-editor";
import ProductMediaGrid from "@/components/staff/products/ProductMediaGrid";
import ProductSubcategoriesField from "@/components/staff/products/ProductSubcategoriesField";
import Panel from "@/components/staff/ui/Panel";
import PanelField from "@/components/staff/ui/PanelField";
import PanelInput from "@/components/staff/ui/PanelInput";
import {
  PanelAutoCompleteInput,
  StaffPageHeader,
  StaffPdfImporter,
  StaffSelect,
  StaffStateCard,
  StaffTagInput,
  UnsavedChangesGuard,
} from "@/components/staff/ui";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";
import { canCreateProducts, canManageProducts } from "@/features/products/access";
import {
  createSingleProductClient,
  deleteSingleProductClient,
  getSingleProductClient,
  getSingleProductFormOptionsClient,
  SingleProductsClientError,
  updateSingleProductClient,
} from "@/features/single-products/client";
import type {
  SingleProductDetailDto,
  SingleProductFormOptionsDto,
  SingleProductUpsertInput,
} from "@/features/single-products/types";
import { slugify } from "@/lib/slugify";
import { ProductAttributeInputDto } from "@/features/products/types";
import PanelAttributesInput from "@/components/staff/ui/PanelAttributesInput";
import { getProductBrandSuggestions } from "@/lib/static_tables/brands";

function createEmptyFormState(): SingleProductUpsertInput {
  return {
    sku: "",
    slug: "",
    name: "",
    description: null,
    descriptionSeo: null,
    brand: null,
    basePriceAmount: null,
    vatRate: 19,
    stock: null,
    stockUnit: "ITEM",
    visibility: true,
    priceVisibility: true,
    stockVisibility: true,
    lifecycle: "DRAFT",
    commercialMode: "ON_REQUEST_ONLY",
    tags: "",
    subcategoryIds: [],
    datasheet: null,
    media: [],
    attributes: [],
  };
}

function mapProductToForm(product: SingleProductDetailDto): SingleProductUpsertInput {
  return {
    sku: product.sku,
    slug: product.slug,
    name: product.name,
    description: product.description,
    descriptionSeo: product.descriptionSeo,
    brand: product.brand,
    basePriceAmount: product.basePriceAmount,
    vatRate: product.vatRate,
    stock: product.stock,
    stockUnit: product.stockUnit,
    visibility: product.visibility,
    priceVisibility: product.priceVisibility,
    stockVisibility: product.stockVisibility,
    lifecycle: product.lifecycle,
    commercialMode: product.commercialMode,
    tags: product.tags,
    subcategoryIds: product.subcategoryIds,
    datasheet: product.datasheet,
    media: product.media,
    attributes: product.attributes,
  };
}

function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function SingleProductEditPage() {
  return (
    <Suspense fallback={<EditorLoading />}>
      <SingleProductEditPageContent />
    </Suspense>
  );
}


function SingleProductEditPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useStaffSessionContext();
  const productId = Number(searchParams.get("id") ?? "");
  const isEdit = Number.isInteger(productId) && productId > 0;
  const canCreate = user ? canCreateProducts(user) : false;
  const canManage = user ? canManageProducts(user) : false;
  const [form, setForm] = useState<SingleProductUpsertInput>(createEmptyFormState);
  const [initialSnapshot, setInitialSnapshot] = useState("");
  const [options, setOptions] = useState<SingleProductFormOptionsDto>({
    productSubcategories: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const onAttributesChange = (attributes: ProductAttributeInputDto[]) => {
    setForm((current) => ({...current, attributes }))
  }

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    void (async () => {
      try {
        const [formOptions, product] = await Promise.all([
          getSingleProductFormOptionsClient(),
          isEdit ? getSingleProductClient(productId) : Promise.resolve(null),
        ]);

        if (cancelled) {
          return;
        }

        setOptions(formOptions);

        if (product) {
          const nextForm = mapProductToForm(product);
          setForm(nextForm);
          setInitialSnapshot(JSON.stringify(nextForm));
        } else {
          const nextForm = createEmptyFormState();
          setForm(nextForm);
          setInitialSnapshot(JSON.stringify(nextForm));
        }
      } catch (err: unknown) {
        toast.error(
          err instanceof SingleProductsClientError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Impossible de charger l'éditeur du produit simple.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isEdit, productId]);

  const isDirty = useMemo(
    () => JSON.stringify(form) !== initialSnapshot,
    [form, initialSnapshot],
  );

  const canSave = isEdit ? canManage : canCreate;

  const handleSave = async () => {
    if (!canSave) {
      toast.error("Accès refusé.");
      return false;
    }

    setIsSaving(true);
    try {
      const result = isEdit
        ? await updateSingleProductClient(productId, form)
        : await createSingleProductClient(form);
      const nextForm = mapProductToForm(result);
      setForm(nextForm);
      setInitialSnapshot(JSON.stringify(nextForm));
      toast.success(isEdit ? "Produit simple mis à jour." : "Produit simple créé.");
      if (!isEdit) {
        router.replace(`/espace/staff/gestion-des-produits/produits/edit?id=${result.id}`);
      }
      return true;
    } catch (err: unknown) {
      toast.error(
        err instanceof SingleProductsClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Impossible d'enregistrer le produit simple.",
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit || !canManage) {
      return;
    }

    const confirmed = window.confirm(`Supprimer le produit "${form.name}" ?`);
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteSingleProductClient(productId);
      toast.success("Produit simple supprimé.");
      router.replace("/espace/staff/gestion-des-produits/produits");
    } catch (err: unknown) {
      toast.error(
        err instanceof SingleProductsClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Impossible de supprimer le produit simple.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <EditorLoading />;
  }

  if (!canCreate && !isEdit) {
    return (
      <StaffStateCard
        title="Accès refusé"
        description="Vous ne pouvez pas créer de produit simple."
      />
    );
  }

  return (
    <div className="space-y-6 max-w-full">
      <UnsavedChangesGuard isDirty={isDirty} onSaveAndContinue={handleSave} />

      <StaffPageHeader
        backHref="/espace/staff/gestion-des-produits/produits"
        eyebrow="Produits"
        title={isEdit ? form.name || "Produit simple" : "Nouveau produit simple"}
        icon={Package}
      />

      <Panel pretitle="Produit" title="Informations principales">
        <div className="grid gap-6 md:grid-cols-4">
          <PanelField id={`product-sku`} label="SKU">
            <PanelInput
              id={`product-sku`}
              fullWidth
              value={form.sku}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  sku: event.target.value,
                }))
              }
            />
          </PanelField>

          <PanelField className="col-span-2" id={`product-name`} label="Nom">
            <PanelInput
              id={`product-name`}
              fullWidth
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  slug: slugify(event.target.value),
                  name: event.target.value,
                }))
              }
            />
          </PanelField>

          <PanelField id="product-brand" label="Marque">
            <PanelAutoCompleteInput
              id="product-brand"
              fullWidth
              value={form.brand ?? ""}
              suggestions={getProductBrandSuggestions(form.brand ?? "")}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  brand: value ?? null,
                }))
              }
            />
          </PanelField>
          <PanelField id="product-price" label="Prix de base">
            <PanelInput
            fullWidth
              id="product-price"
              value={form.basePriceAmount ?? ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  basePriceAmount: event.target.value || null,
                }))
              }
            />
          </PanelField>
          <PanelField id="product-vat" label="TVA">
            <PanelInput
            fullWidth
              id="product-vat"
              value={form.vatRate == null ? "" : String(form.vatRate)}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  vatRate: event.target.value ? Number(event.target.value) : null,
                }))
              }
            />
          </PanelField>

          <PanelField id="product-stock" label="Stock">
            <PanelInput
            fullWidth
              id="product-stock"
              value={form.stock ?? ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  stock: event.target.value || null,
                }))
              }
            />
          </PanelField>
          <PanelField id="product-stock-unit" label="Unité de stock">
            <StaffSelect
              id="product-stock-unit"
              fullWidth
              value={form.stockUnit ?? ""}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  stockUnit: value ? (value as ProductStockUnit) : null,
                }))
              }
              options={Object.values(ProductStockUnit).map((value) => ({
                value,
                label: formatEnumLabel(value),
              }))}
            />
          </PanelField>
          <PanelField id="product-lifecycle" label="Cycle de vie">
            <StaffSelect
              id="product-lifecycle"
              fullWidth
              value={form.lifecycle}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  lifecycle: value as ProductLifecycle,
                }))
              }
              options={Object.values(ProductLifecycle).map((value) => ({
                value,
                label: formatEnumLabel(value),
              }))}
            />
          </PanelField>

          <PanelField id="product-commercial" label="Mode commercial">
            <StaffSelect
              id="product-commercial"
              fullWidth
              value={form.commercialMode}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  commercialMode: value as ProductCommercialMode,
                }))
              }
              options={Object.values(ProductCommercialMode).map((value) => ({
                value,
                label: formatEnumLabel(value),
              }))}
            />
          </PanelField>
          <PanelField id="product-visibility" label="Visible">
            <StaffSelect
              id="product-visibility"
              fullWidth
              value={String(form.visibility)}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  visibility: value === "true",
                }))
              }
              options={[
                { value: "true", label: "Oui" },
                { value: "false", label: "Non" },
              ]}
            />
          </PanelField>
          <PanelField id="product-price-visibility" label="Prix visible">
            <StaffSelect
              id="product-price-visibility"
              fullWidth
              value={String(form.priceVisibility)}
              onValueChange={(value) =>
                setForm((current) => ({
                  ...current,
                  priceVisibility: value === "true",
                }))
              }
              options={[
                { value: "true", label: "Oui" },
                { value: "false", label: "Non" },
              ]}
            />
          </PanelField>
        </div>

        <ProductSubcategoriesField
          value={form.subcategoryIds.map(String)}
          options={options.productSubcategories}
          onChange={(nextValue) =>
            setForm((current) => ({
              ...current,
              subcategoryIds: nextValue.map(Number),
            }))
          }
        />

        <PanelField id="product-tags" label="Tags">
          <StaffTagInput
            id="product-tags"
            
            value={form.tags.split(" ").filter((tag) => tag.trim() !== "")}
            onChange={(strings) =>
              setForm((current) => ({
                ...current,
                tags: strings.join(" "),
              }))
            }
          />
        </PanelField>

        <PanelField id="product-description" label="Description">
          <ArticleRichTextEditor
            editorId="product-description"
            value={form.description ?? ""}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                description: value,
              }))
            }
            placeholder="Description du produit..."
          />
        </PanelField>

        <PanelField id="product-description-seo" label="Description SEO">
          <Textarea
            id="product-description-seo"
            value={form.descriptionSeo ?? ""}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                descriptionSeo: event.target.value || null,
              }))
            }
          />
        </PanelField>
      </Panel>

      <Panel pretitle="Galerie" title="Médias du produit">
        <ProductMediaGrid
          items={form.media}
          onChange={(media) =>
            setForm((current) => ({
              ...current,
              media,
            }))
          }
          title="Galerie"
          description="Le premier média devient la couverture du produit."
        />
      </Panel>

      <Panel pretitle="Documentation" title="Fiche technique">
        <StaffPdfImporter
          label="Document technique"
          description="Optionnel : associez une fiche technique PDF a ce produit simple."
          dialogTitle="Ajouter une fiche technique"
          dialogDescription="Choisissez un PDF existant ou importez-en un nouveau pour ce produit."
          value={form.datasheet}
          onChange={(datasheet) =>
            setForm((current) => ({
              ...current,
              datasheet,
            }))
          }
        />
      </Panel>

      <Panel allowOverflow pretitle="Attributs" title="Valeurs du produit">
          <PanelAttributesInput 
            attributes={form.attributes}
            onAttributesChange={onAttributesChange}
          />
      </Panel>

      <div className="flex flex-wrap gap-3">
        <AnimatedUIButton
          type="button"
          variant="primary"
          onClick={() => void handleSave()}
          loading={isSaving}
          loadingText="Enregistrement..."
        >
          Enregistrer
        </AnimatedUIButton>
        {isEdit ? (
          <AnimatedUIButton
            type="button"
            variant="light"
            onClick={() => void handleDelete()}
            loading={isDeleting}
            loadingText="Suppression..."
          >
            Supprimer
          </AnimatedUIButton>
        ) : null}
      </div>
    </div>
  );
}

function EditorLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-300 bg-white px-5 py-4 shadow-sm">
        <Loading />
      </div>
    </div>
  );
}
