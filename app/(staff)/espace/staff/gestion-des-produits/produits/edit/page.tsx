"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ProductCommercialMode,
  ProductLifecycle,
  ProductStockUnit,
} from "@prisma/client";
import { ExternalLink, Package } from "lucide-react";
import { toast } from "sonner";
import Loading from "@/components/staff/Loading";
import ProductMediaGrid from "@/components/staff/products/ProductMediaGrid";
import ProductSubcategoriesField from "@/components/staff/products/ProductSubcategoriesField";
import Panel from "@/components/staff/ui/Panel";
import PanelField from "@/components/staff/ui/PanelField";
import {
  AiPanelAttributesInput,
  AiPanelRichText,
  AiPanelTagsInput,
  DescriptionSEOTextArea,
  StaffPageHeader,
  StaffPdfImporter,
  StaffStateCard,
  UnsavedChangesGuard,
} from "@/components/staff/ui";
import {
  AiSuggestionActionsRow,
  AI_SUGGESTION_TOKEN_CLASS,
} from "@/components/staff/ui/ai-suggestion";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";
import { canCreateProducts, canManageProducts } from "@/features/products/access";
import {
  createSingleProductClient,
  deleteSingleProductClient,
  getSingleProductClient,
  getSingleProductFormOptionsClient,
  SingleProductsClientError,
  suggestSingleProductAiClient,
  updateSingleProductClient,
} from "@/features/single-products/client";
import type {
  SingleProductAiSuggestionResponse,
  SingleProductDetailDto,
  SingleProductFormOptionsDto,
  SingleProductUpsertInput,
} from "@/features/single-products/types";
import { slugify } from "@/lib/slugify";
import { ProductAttributeInputDto } from "@/features/products/types";
import ProductEssentialEntries from "@/components/staff/products/ProductEssentialEntries";
import {
  getArticlePlainText,
} from "@/features/articles/document";
import { cn } from "@/lib/utils";

type SimpleProductAiSuggestions = {
  descriptionPreview: string | null;
  descriptionRichText: string | null;
  descriptionSeo: string | null;
  tags: string[] | null;
  attributes: ProductAttributeInputDto[] | null;
  subcategoryIds: number[] | null;
};

function emptyAiSuggestions(): SimpleProductAiSuggestions {
  return {
    descriptionPreview: null,
    descriptionRichText: null,
    descriptionSeo: null,
    tags: null,
    attributes: null,
    subcategoryIds: null,
  };
}

function hasActiveAiSuggestions(suggestions: SimpleProductAiSuggestions) {
  return Boolean(
    suggestions.descriptionRichText ||
      suggestions.descriptionSeo ||
      suggestions.tags?.length ||
      suggestions.attributes?.length ||
      suggestions.subcategoryIds?.length,
  );
}

function mapAiResponseToSuggestions(
  response: SingleProductAiSuggestionResponse,
): SimpleProductAiSuggestions {
  return {
    descriptionPreview:
      getArticlePlainText(response.descriptionRichText) ||
      response.descriptionText ||
      null,
    descriptionRichText: response.descriptionRichText || null,
    descriptionSeo: response.descriptionSeo || null,
    tags: response.tags.length > 0 ? response.tags : null,
    attributes: response.attributes.length > 0 ? response.attributes : null,
    subcategoryIds: response.subcategoryIds.length > 0 ? response.subcategoryIds : null,
  };
}

function normalizeText(value: string | null | undefined) {
  return (value ?? "").trim().toLocaleLowerCase("fr-FR");
}

function splitTags(value: string) {
  return value.split(" ").filter((tag) => tag.trim() !== "");
}

function mergeTags(currentTags: string[], suggestedTags: string[]) {
  const seen = new Set<string>();

  return [...currentTags, ...suggestedTags].filter((tag) => {
    const key = normalizeText(tag);

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function areAttributesEqual(
  left: ProductAttributeInputDto[],
  right: ProductAttributeInputDto[],
) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((attribute, index) => {
    const other = right[index];

    return (
      normalizeText(attribute.kind) === normalizeText(other?.kind) &&
      normalizeText(attribute.value) === normalizeText(other?.value)
    );
  });
}

function areNumberArraysEqual(left: number[], right: number[]) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

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
    priceVisibility: false,
    stockVisibility: false,
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
  const [aiSuggestions, setAiSuggestions] = useState<SimpleProductAiSuggestions>(
    emptyAiSuggestions,
  );
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [aiSuggestionError, setAiSuggestionError] = useState<string | null>(null);

  const onAttributesChange = (attributes: ProductAttributeInputDto[]) => {
    setForm((current) => ({...current, attributes }))
  }

  const canSave = isEdit ? canManage : canCreate;

  const rejectAiSuggestion = (field: keyof SimpleProductAiSuggestions) => {
    setAiSuggestions((current) => ({
      ...current,
      [field]: null,
      ...(field === "descriptionPreview"
        ? {
            descriptionRichText: null,
          }
        : {}),
      ...(field === "descriptionRichText"
        ? {
            descriptionPreview: null,
          }
        : {}),
    }));
  };

  const rejectAllAiSuggestions = () => {
    setAiSuggestions(emptyAiSuggestions());
  };

  const acceptAllAiSuggestions = () => {
    setForm((current) => ({
      ...(() => {
        const nextForm = {
          ...current,
          description: aiSuggestions.descriptionRichText ?? current.description,
          descriptionSeo: aiSuggestions.descriptionSeo ?? current.descriptionSeo,
          tags: aiSuggestions.tags?.length
            ? mergeTags(splitTags(current.tags), aiSuggestions.tags).join(" ")
            : current.tags,
          attributes: aiSuggestions.attributes?.length
            ? aiSuggestions.attributes
            : current.attributes,
          subcategoryIds: aiSuggestions.subcategoryIds?.length
            ? aiSuggestions.subcategoryIds
            : current.subcategoryIds,
        };
        return nextForm;
      })(),
    }));
    setAiSuggestions(emptyAiSuggestions());
  };

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

  const handleGenerateAiSuggestions = async () => {
    if (!canSave) {
      toast.error("Acces refuse.");
      return;
    }

    if (!form.name.trim()) {
      toast.error("Le nom du produit est requis pour utiliser l'IA.");
      return;
    }

    setIsAiSuggesting(true);
    setAiSuggestionError(null);

    try {
      const response = await suggestSingleProductAiClient({
        name: form.name,
        description: getArticlePlainText(form.description),
        descriptionSeo: form.descriptionSeo,
        tags: splitTags(form.tags),
        attributes: form.attributes,
        datasheetUrl: form.datasheet?.url ?? null,
        mediaUrls: form.media.map((media) => media.url),
        brand: form.brand,
        subcategoryOptions: options.productSubcategories,
      });
      const nextSuggestions = mapAiResponseToSuggestions(response);
      const nextForm = { ...form };
      const pendingSuggestions = emptyAiSuggestions();
      const currentDescription = getArticlePlainText(form.description);
      const currentTags = splitTags(form.tags);
      const mergedTags = nextSuggestions.tags?.length
        ? mergeTags(currentTags, nextSuggestions.tags)
        : currentTags;
      const allowedSubcategoryIds = new Set(
        options.productSubcategories.map((option) => option.id),
      );
      const validSuggestedSubcategoryIds =
        nextSuggestions.subcategoryIds?.filter((id) =>
          allowedSubcategoryIds.has(id),
        ) ?? [];

      if (nextSuggestions.descriptionRichText) {
        if (!currentDescription.trim()) {
          nextForm.description = nextSuggestions.descriptionRichText;
        } else if (form.description !== nextSuggestions.descriptionRichText) {
          pendingSuggestions.descriptionPreview =
            nextSuggestions.descriptionPreview;
          pendingSuggestions.descriptionRichText =
            nextSuggestions.descriptionRichText;
        }
      }

      if (nextSuggestions.descriptionSeo) {
        if (!normalizeText(form.descriptionSeo)) {
          nextForm.descriptionSeo = nextSuggestions.descriptionSeo;
        } else if (
          normalizeText(form.descriptionSeo) !==
          normalizeText(nextSuggestions.descriptionSeo)
        ) {
          pendingSuggestions.descriptionSeo = nextSuggestions.descriptionSeo;
        }
      }

      if (nextSuggestions.tags?.length) {
        if (currentTags.length === 0) {
          nextForm.tags = nextSuggestions.tags.join(" ");
        } else if (
          mergedTags.length !== currentTags.length ||
          mergedTags.some((tag, index) => tag !== currentTags[index])
        ) {
          pendingSuggestions.tags = nextSuggestions.tags;
        }
      }

      if (nextSuggestions.attributes?.length) {
        if (form.attributes.length === 0) {
          nextForm.attributes = nextSuggestions.attributes;
        } else if (
          !areAttributesEqual(form.attributes, nextSuggestions.attributes)
        ) {
          pendingSuggestions.attributes = nextSuggestions.attributes;
        }
      }

      if (validSuggestedSubcategoryIds.length > 0) {
        if (form.subcategoryIds.length === 0) {
          nextForm.subcategoryIds = validSuggestedSubcategoryIds;
        } else if (
          !areNumberArraysEqual(form.subcategoryIds, validSuggestedSubcategoryIds)
        ) {
          pendingSuggestions.subcategoryIds = validSuggestedSubcategoryIds;
        }
      }

      setForm(nextForm);
      setAiSuggestions(pendingSuggestions);
      toast.success("L'IA a complete les champs vides et prepare les remplacements utiles.");
    } catch (error: unknown) {
      setAiSuggestions(emptyAiSuggestions());
      const message =
        error instanceof Error
          ? error.message
          : "Impossible de generer les suggestions IA.";
      setAiSuggestionError(message);
      toast.error(message);
    } finally {
      setIsAiSuggesting(false);
    }
  };

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

      <Panel pretitle="Produit" title="Informations principales">
        <ProductEssentialEntries
            sku={form.sku}
            name={form.name}
            brand={form.brand}
            basePriceAmount={form.basePriceAmount}
            vatRate={form.vatRate}
            stock={form.stock}
            stockUnit={form.stockUnit}
            lifecycle={form.lifecycle}
            commercialMode={form.commercialMode}
            visibility={form.visibility}
            priceVisibility={form.priceVisibility}
            stockVisibility={form.stockVisibility}
            onSkuChanged={(sku: string) => setForm((current) => ({...current, sku}))}
            onNameChanged={(name: string) => setForm((current) => ({...current, slug: slugify(name), name}))}
            onBrandChanged={(brand: null | string) => setForm((current) => ({...current, brand}))}
            onBasePriceAmountChanged={(basePriceAmount: null | string) => setForm((current) => ({...current, basePriceAmount}))}
            onVatRateChanged={(vatRate: null | number) => setForm((current) => ({...current, vatRate}))}
            onStockChanged={(stock: null | string) => setForm((current) => ({...current, stock}))}
            onStockUnitChanged={(stockUnit: null | ProductStockUnit) => setForm((current) => ({...current, stockUnit}))}
            onLifecycleChanged={(lifecycle: null | ProductLifecycle) => setForm((current) => ({...current, lifecycle: lifecycle || "DRAFT"}))}
            onCommercialModeChanged={(commercialMode: null | ProductCommercialMode) => setForm((current) => ({...current, commercialMode: commercialMode || "ON_REQUEST_ONLY"}))}
            onVisibilityChanged={(visibility: null | boolean) => setForm((current) => ({...current, visibility: Boolean(visibility)}))}
            onPriceVisibilityChanged={(priceVisibility: null | boolean) => setForm((current) => ({...current, priceVisibility: Boolean(priceVisibility)}))}
            onStockVisibilityChanged={(stockVisibility: null | boolean) => setForm((current) => ({...current, stockVisibility: Boolean(stockVisibility)}))}
          />
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
          <AiPanelTagsInput
            id="product-tags"
            value={splitTags(form.tags)}
            onChange={(strings) =>
              setForm((current) => ({
                ...current,
                tags: strings.join(" "),
              }))
            }
            aiSuggestion={aiSuggestions.tags}
            onAcceptAiSuggestion={() => rejectAiSuggestion("tags")}
            onRejectAiSuggestion={() => rejectAiSuggestion("tags")}
          />
        </PanelField>

        {aiSuggestions.subcategoryIds?.length ? (
          <PanelField
            id="product-subcategories-ai"
            label="Suggestion IA de sous-categories"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {options.productSubcategories
                  .filter((option) =>
                    aiSuggestions.subcategoryIds?.includes(option.id),
                  )
                  .map((subcategory) => (
                    <span
                      key={subcategory.id}
                      className={cn(
                        "inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium",
                        AI_SUGGESTION_TOKEN_CLASS,
                      )}
                    >
                      {subcategory.categoryName} / {subcategory.name}
                    </span>
                  ))}
              </div>
              <AiSuggestionActionsRow
                suggestion={aiSuggestions.subcategoryIds}
                onAcceptSuggestion={(subcategoryIds) => {
                  setForm((current) => ({
                    ...current,
                    subcategoryIds,
                  }));
                  rejectAiSuggestion("subcategoryIds");
                }}
                onRejectSuggestion={() => rejectAiSuggestion("subcategoryIds")}
              />
            </div>
          </PanelField>
        ) : null}

        <PanelField id="product-description" label="Description">
          <AiPanelRichText
            editorId="product-description"
            value={form.description ?? ""}
            onChange={(value) =>
              setForm((current) =>
                current.description === value
                  ? current
                  : {
                      ...current,
                      description: value,
                    },
              )
            }
            aiSuggestion={aiSuggestions.descriptionRichText}
            aiSuggestionPreview={aiSuggestions.descriptionPreview}
            onAcceptAiSuggestion={(value) => {
              setForm((current) => {
                if (current.description === value) {
                  return current;
                }

                const nextForm = {
                  ...current,
                  description: value,
                };
                return nextForm;
              });
              setAiSuggestions((current) => ({
                ...current,
                descriptionPreview: null,
                descriptionRichText: null,
              }));
            }}
            onRejectAiSuggestion={() => rejectAiSuggestion("descriptionRichText")}
            placeholder="Description du produit..."
          />
        </PanelField>

        <PanelField id="product-description-seo" label="Description SEO">
          <DescriptionSEOTextArea
            id="product-description-seo"
            value={form.descriptionSeo ?? ""}
            onValueChange={(value) =>
              setForm((current) => ({
                ...current,
                descriptionSeo: value || null,
              }))
            }
            aiSuggestion={aiSuggestions.descriptionSeo}
            onAcceptAiSuggestion={(value) => {
              setForm((current) => ({
                ...current,
                descriptionSeo: value || null,
              }));
              rejectAiSuggestion("descriptionSeo");
            }}
            onRejectAiSuggestion={() => rejectAiSuggestion("descriptionSeo")}
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
          <AiPanelAttributesInput 
            attributes={form.attributes}
            onAttributesChange={onAttributesChange}
            aiSuggestion={aiSuggestions.attributes}
            onAcceptAiSuggestion={(attributes) => {
              setForm((current) => ({
                ...current,
                attributes,
              }));
              rejectAiSuggestion("attributes");
            }}
            onRejectAiSuggestion={() => rejectAiSuggestion("attributes")}
          />
      </Panel>

      {form.name.trim() || isAiSuggesting || aiSuggestionError || hasActiveAiSuggestions(aiSuggestions) ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-cobam-water-blue/15 bg-cobam-water-blue/5 px-4 py-3 text-sm text-cobam-dark-blue">
          <AnimatedUIButton
            type="button"
            variant="ghost"
            color="secondary"
            size="sm"
            onClick={() => void handleGenerateAiSuggestions()}
            disabled={!form.name.trim() || isAiSuggesting}
            loading={isAiSuggesting}
            loadingText="Generation..."
          >
            Continuer avec l&apos;IA
          </AnimatedUIButton>
          <span className="font-medium">
            {isAiSuggesting
              ? "L'IA prepare des suggestions..."
              : aiSuggestionError
                ? aiSuggestionError
                : "Suggestions IA disponibles."}
          </span>
          {hasActiveAiSuggestions(aiSuggestions) ? (
            <>
              <AnimatedUIButton
                type="button"
                variant="ghost"
                color="secondary"
                size="sm"
                onClick={acceptAllAiSuggestions}
              >
                Accepter tout
              </AnimatedUIButton>
              <AnimatedUIButton
                type="button"
                variant="ghost"
                color="error"
                size="sm"
                onClick={rejectAllAiSuggestions}
              >
                Rejeter tout
              </AnimatedUIButton>
            </>
          ) : null}
        </div>
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
      <div className="inline-flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-5 py-4 shadow-sm">
        <Loading />
      </div>
    </div>
  );
}
