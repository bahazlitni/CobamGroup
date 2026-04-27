"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Boxes, ExternalLink, GripVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Loading from "@/components/staff/Loading";
import ArticleRichTextEditor from "@/components/staff/articles/article-rich-text-editor";
import ProductMediaGrid from "@/components/staff/products/ProductMediaGrid";
import ProductSubcategoriesField from "@/components/staff/products/ProductSubcategoriesField";
import Panel from "@/components/staff/ui/Panel";
import PanelField from "@/components/staff/ui/PanelField";
import PanelInput from "@/components/staff/ui/PanelInput";
import {
  DescriptionSEOTextArea,
  StaffPageHeader,
  StaffSearchSelect,
  StaffStateCard,
  UnsavedChangesGuard,
} from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";
import { canCreateProducts, canManageProducts } from "@/features/products/access";
import {
  createProductPackClient,
  deleteProductPackClient,
  getProductPackClient,
  getProductPackFormOptionsClient,
  ProductPacksClientError,
  updateProductPackClient,
} from "@/features/product-packs/client";
import type {
  ProductPackDetailDto,
  ProductPackFormOptionsDto,
  ProductPackSelectableProductDto,
  ProductPackUpsertInput,
} from "@/features/product-packs/types";

type ProductPackEditorState = ProductPackUpsertInput;

function createEmptyFormState(): ProductPackEditorState {
  return {
    sku: "",
    slug: "",
    name: "",
    description: null,
    descriptionSeo: null,
    subcategoryIds: [],
    media: [],
    lines: [],
  };
}

function mapPackToForm(pack: ProductPackDetailDto): ProductPackEditorState {
  return {
    sku: pack.sku,
    slug: pack.slug,
    name: pack.name,
    description: pack.description,
    descriptionSeo: pack.descriptionSeo,
    subcategoryIds: pack.subcategoryIds,
    media: pack.media,
    lines: pack.lines,
  };
}

function getLifecycleLabel(value: ProductPackDetailDto["derived"]["lifecycle"]) {
  return value === "ACTIVE" ? "Actif" : "Brouillon";
}

function getCommercialModeLabel(value: ProductPackDetailDto["derived"]["commercialMode"]) {
  switch (value) {
    case "ONLINE_ONLY":
      return "En ligne";
    case "ON_REQUEST_OR_ONLINE":
      return "En ligne ou sur demande";
    case "ON_REQUEST_ONLY":
      return "Sur demande";
    default:
      return "-";
  }
}

function formatNumberLabel(value: string | null, suffix?: string) {
  if (!value) {
    return "-";
  }

  return suffix ? `${value} ${suffix}` : value;
}

function formatKindLabel(product: ProductPackSelectableProductDto) {
  return product.kind === "SINGLE" ? "Produit simple" : "Variante";
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export default function ProductPackEditPage() {
  return (
    <Suspense fallback={<EditorLoading />}>
      <ProductPackEditPageContent />
    </Suspense>
  );
}

function ProductPackEditPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useStaffSessionContext();
  const packId = Number(searchParams.get("id") ?? "");
  const isEdit = Number.isInteger(packId) && packId > 0;
  const canCreate = user ? canCreateProducts(user) : false;
  const canManage = user ? canManageProducts(user) : false;
  const [form, setForm] = useState<ProductPackEditorState>(createEmptyFormState);
  const [savedPack, setSavedPack] = useState<ProductPackDetailDto | null>(null);
  const [initialSnapshot, setInitialSnapshot] = useState("");
  const [options, setOptions] = useState<ProductPackFormOptionsDto>({
    productSubcategories: [],
    availableProducts: [],
  });
  const [selectedProductToAdd, setSelectedProductToAdd] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    void (async () => {
      try {
        const [formOptions, pack] = await Promise.all([
          getProductPackFormOptionsClient(),
          isEdit ? getProductPackClient(packId) : Promise.resolve(null),
        ]);

        if (cancelled) {
          return;
        }

        setOptions(formOptions);

        if (pack) {
          const nextForm = mapPackToForm(pack);
          setForm(nextForm);
          setSavedPack(pack);
          setInitialSnapshot(JSON.stringify(nextForm));
        } else {
          const nextForm = createEmptyFormState();
          setForm(nextForm);
          setSavedPack(null);
          setInitialSnapshot(JSON.stringify(nextForm));
        }
      } catch (err: unknown) {
        toast.error(
          err instanceof ProductPacksClientError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Impossible de charger l'editeur pack.",
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
  }, [isEdit, packId]);

  const isDirty = useMemo(
    () => JSON.stringify(form) !== initialSnapshot,
    [form, initialSnapshot],
  );
  const canSave = isEdit ? canManage : canCreate;

  const availableProductsById = useMemo(
    () =>
      new Map(options.availableProducts.map((product) => [product.id, product])),
    [options.availableProducts],
  );

  const remainingProductOptions = useMemo(
    () =>
      options.availableProducts
        .filter((product) => !form.lines.some((line) => line.productId === product.id))
        .map((product) => ({
          value: String(product.id),
          label: `${product.name} · ${product.sku} · ${formatKindLabel(product)}`,
        })),
    [form.lines, options.availableProducts],
  );

  const handleSave = async () => {
    if (!canSave) {
      toast.error("Acces refuse.");
      return false;
    }

    setIsSaving(true);
    try {
      const result = isEdit
        ? await updateProductPackClient(packId, form)
        : await createProductPackClient(form);
      const nextForm = mapPackToForm(result);
      setForm(nextForm);
      setSavedPack(result);
      setInitialSnapshot(JSON.stringify(nextForm));
      toast.success(isEdit ? "Pack mis a jour." : "Pack cree.");
      if (!isEdit) {
        router.replace(`/espace/staff/gestion-des-produits/packs/edit?id=${result.id}`);
      }
      return true;
    } catch (err: unknown) {
      toast.error(
        err instanceof ProductPacksClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Impossible d'enregistrer le pack.",
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

    const confirmed = window.confirm(`Supprimer le pack "${form.name}" ?`);
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteProductPackClient(packId);
      toast.success("Pack supprime.");
      router.replace("/espace/staff/gestion-des-produits/packs");
    } catch (err: unknown) {
      toast.error(
        err instanceof ProductPacksClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Impossible de supprimer le pack.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddLine = () => {
    const productId = Number(selectedProductToAdd);
    if (!Number.isInteger(productId) || productId <= 0) {
      return;
    }

    setForm((current) => ({
      ...current,
      lines: [...current.lines, { productId, quantity: 1 }],
    }));
    setSelectedProductToAdd("");
  };

  if (isLoading) {
    return <EditorLoading />;
  }

  if (!canCreate && !isEdit) {
    return (
      <StaffStateCard
        title="Acces refuse"
        description="Vous ne pouvez pas creer de pack produit."
      />
    );
  }

  return (
    <div className="space-y-6">
      <UnsavedChangesGuard isDirty={isDirty} onSaveAndContinue={handleSave} />

      <StaffPageHeader
        backHref="/espace/staff/gestion-des-produits/packs"
        eyebrow="Produits"
        title={isEdit ? form.name || "Pack produit" : "Nouveau pack produit"}
        icon={Boxes}
      >
        {(() => {
          const subcategory = options.productSubcategories.find(s => form.subcategoryIds.includes(s.id));
          const publicUrl = subcategory && isEdit
            ? `/produits/${subcategory.categorySlug}/${subcategory.slug}/${form.slug}`
            : null;

          if (!publicUrl) return null;

          return (
            <AnimatedUIButton
              href={publicUrl}
              target="_blank"
              variant="ghost"
              size="sm"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Voir sur le site
              </span>
            </AnimatedUIButton>
          );
        })()}
      </StaffPageHeader>

      <Panel pretitle="Pack" title="Informations principales">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {(["sku", "slug", "name"] as const).map((field) => (
            <PanelField key={field} id={`pack-${field}`} label={field.toUpperCase()}>
              <PanelInput
                id={`pack-${field}`}
                fullWidth
                value={form[field]}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [field]: event.target.value,
                  }))
                }
              />
            </PanelField>
          ))}
        </div>

        <PanelField id="pack-description" label="Description">
          <ArticleRichTextEditor
            editorId="pack-description"
            value={form.description ?? ""}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                description: value,
              }))
            }
            placeholder="Description du pack..."
          />
        </PanelField>

        <PanelField id="pack-description-seo" label="Description SEO">
          <DescriptionSEOTextArea
            id="pack-description-seo"
            value={form.descriptionSeo ?? ""}
            onValueChange={(value) =>
              setForm((current) => ({
                ...current,
                descriptionSeo: value || null,
              }))
            }
          />
        </PanelField>
      </Panel>

      <Panel pretitle="Taxonomie" title="Sous-categories">
        <ProductSubcategoriesField
          value={form.subcategoryIds.map(String)}
          options={options.productSubcategories}
          onChange={(nextValue) =>
            setForm((current) => ({
              ...current,
              subcategoryIds: nextValue.map(Number),
            }))
          }
          emptyStateText="Aucune sous-categorie selectionnee."
        />
      </Panel>

      <Panel pretitle="Galerie" title="Medias du pack">
        <ProductMediaGrid
          items={form.media}
          onChange={(media) =>
            setForm((current) => ({
              ...current,
              media,
            }))
          }
          title="Galerie"
          description="Le premier media devient la couverture du pack."
        />
      </Panel>

      <Panel pretitle="Composition" title="Produits du pack">
        <div className="space-y-6">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
            <StaffSearchSelect
              value={selectedProductToAdd}
              onValueChange={setSelectedProductToAdd}
              options={remainingProductOptions}
              placeholder="Ajouter un produit au pack"
              emptyLabel="Choisir un produit"
              searchPlaceholder="Rechercher un produit..."
              noResultsLabel="Aucun autre produit disponible"
              fullWidth
            />
            <AnimatedUIButton
              type="button"
              variant="secondary"
              onClick={handleAddLine}
              disabled={!selectedProductToAdd}
            >
              Ajouter
            </AnimatedUIButton>
          </div>

          {form.lines.length > 0 ? (
            <div className="space-y-3">
              {form.lines.map((line, index) => {
                const product = availableProductsById.get(line.productId);

                return (
                  <div
                    key={`${line.productId}-${index}`}
                    className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[auto_minmax(0,1fr)_8rem_auto]"
                  >
                    <div className="flex items-center justify-center text-slate-300">
                      <GripVertical className="h-5 w-5" />
                    </div>

                    <div className="space-y-1">
                      <p className="font-semibold text-cobam-dark-blue">
                        {product?.name ?? `Produit #${line.productId}`}
                      </p>
                      <p className="text-xs text-slate-500">
                        {product?.sku ?? "-"} · {product ? formatKindLabel(product) : "-"}
                      </p>
                    </div>

                    <PanelField id={`line-${line.productId}-quantity`} label="Quantite" className="space-y-2">
                      <PanelInput
                        id={`line-${line.productId}-quantity`}
                        value={String(line.quantity)}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            lines: current.lines.map((entry) =>
                              entry.productId === line.productId
                                ? {
                                    ...entry,
                                    quantity: Math.max(1, Number(event.target.value) || 1),
                                  }
                                : entry,
                            ),
                          }))
                        }
                      />
                    </PanelField>

                    <div className="flex items-center justify-end gap-2">
                      <AnimatedUIButton
                        type="button"
                        variant="light"
                        disabled={index === 0}
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            lines: moveItem(current.lines, index, index - 1),
                          }))
                        }
                      >
                        Monter
                      </AnimatedUIButton>
                      <AnimatedUIButton
                        type="button"
                        variant="light"
                        disabled={index === form.lines.length - 1}
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            lines: moveItem(current.lines, index, index + 1),
                          }))
                        }
                      >
                        Descendre
                      </AnimatedUIButton>
                      <AnimatedUIButton
                        type="button"
                        variant="light"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            lines: current.lines.filter((entry) => entry.productId !== line.productId),
                          }))
                        }
                      >
                        <span className="inline-flex items-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          Retirer
                        </span>
                      </AnimatedUIButton>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Ajoutez au moins un produit simple ou une variante dans le pack.
            </p>
          )}
        </div>
      </Panel>

      {savedPack ? (
        <Panel pretitle="Lecture derivee" title="Synthese du pack">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Prix
              </p>
              <p className="mt-2 text-lg font-semibold text-cobam-dark-blue">
                {formatNumberLabel(savedPack.derived.basePriceAmount, "TND")}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                TVA
              </p>
              <p className="mt-2 text-lg font-semibold text-cobam-dark-blue">
                {savedPack.derived.vatRate.toFixed(2)}%
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Stock
              </p>
              <p className="mt-2 text-lg font-semibold text-cobam-dark-blue">
                {formatNumberLabel(savedPack.derived.stock, "item")}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Marques
              </p>
              <p className="mt-2 text-lg font-semibold text-cobam-dark-blue">
                {savedPack.derived.brands.length}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Cycle
              </p>
              <p className="mt-2 text-sm font-semibold text-cobam-dark-blue">
                {getLifecycleLabel(savedPack.derived.lifecycle)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Visibilite
              </p>
              <p className="mt-2 text-sm font-semibold text-cobam-dark-blue">
                {savedPack.derived.visibility ? "Visible" : "Masque"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Mode commercial
              </p>
              <p className="mt-2 text-sm font-semibold text-cobam-dark-blue">
                {getCommercialModeLabel(savedPack.derived.commercialMode)}
              </p>
            </div>
          </div>
        </Panel>
      ) : null}

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
