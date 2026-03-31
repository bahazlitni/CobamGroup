"use client";

import type { ReactNode } from "react";
import { ChevronDown, ChevronUp, Copy } from "lucide-react";
import ArticleRichTextEditor from "@/components/staff/articles/article-rich-text-editor";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { getProductAttributeDataTypeLabel } from "@/features/products/attribute-values";
import {
  getComputedVariantSlug,
  getEffectiveVariantValues,
  type ProductAttributeEditorState,
  type ProductEditorFormState,
  type ProductVariantEditorState,
} from "@/features/products/form";
import { getProductPriceUnitSymbol } from "@/features/products/price-units";
import BooleanButton from "../ui/BooleanButton";
import PanelField from "../ui/PanelField";
import PanelInput from "../ui/PanelInput";
import StaffBadge from "../ui/StaffBadge";
import StaffSelect from "../ui/PanelSelect";
import ProductAttributeValueInput from "./ProductAttributeValueInput";
import ProductMediaGrid from "./ProductMediaGrid";
import ProductPriceField from "./ProductPriceField";

type EditableVariantField = keyof ProductVariantEditorState;

function getAttributePlaceholder(attribute: ProductAttributeEditorState) {
  switch (attribute.dataType) {
    case "NUMBER":
      return attribute.unit ? `Valeur en ${attribute.unit}` : "Valeur numérique";
    case "BOOLEAN":
      return "Choisir Oui ou Non";
    case "TEXT":
    default:
      return "Saisir une valeur";
  }
}

function getLifecycleBadge(status: "DRAFT" | "ACTIVE" | "ARCHIVED") {
  switch (status) {
    case "ACTIVE":
      return { label: "Active", color: "success" as const };
    case "ARCHIVED":
      return { label: "Archivée", color: "warning" as const };
    case "DRAFT":
    default:
      return { label: "Brouillon", color: "default" as const };
  }
}

function getVisibilityBadge(visibility: "HIDDEN" | "PUBLIC") {
  return visibility === "PUBLIC"
    ? { label: "Publique", color: "info" as const }
    : { label: "Masquée", color: "default" as const };
}

function getCommercialModeBadge(commercialMode: "REFERENCE_ONLY" | "QUOTE_ONLY" | "SELLABLE") {
  switch (commercialMode) {
    case "SELLABLE":
      return { label: "Vendable", color: "success" as const };
    case "QUOTE_ONLY":
      return { label: "Sur demande", color: "amber" as const };
    case "REFERENCE_ONLY":
    default:
      return { label: "Référence", color: "secondary" as const };
  }
}

function formatVariantPrice(priceAmount: string | null, priceUnit: ProductEditorFormState["priceUnit"]) {
  return priceAmount
    ? `${priceAmount} TND / ${getProductPriceUnitSymbol(priceUnit)}`
    : "Sans prix";
}

function getAddonCount(variant: ProductVariantEditorState, isDefault: boolean) {
  if (isDefault) {
    return 0;
  }

  return Object.values(variant.addons).filter(Boolean).length;
}

function AddonCard({
  title,
  active,
  onAdd,
  onRemove,
  children,
}: {
  title: string;
  active: boolean;
  onAdd: () => void;
  onRemove: () => void;
  children: ReactNode;
}) {
  return active ? (
    <div className="relative rounded-2xl border border-slate-300 bg-slate-50/70 p-4">
      <AnimatedUIButton
        type="button"
        size="xs"
        variant="light"
        color="error"
        icon="close"
        iconPosition="left"
        onClick={onRemove}
        className="absolute top-3 right-3 z-20"
      />
      <div className="pr-12">{children}</div>
    </div>
  ) : (
    <AnimatedUIButton
      type="button"
      size="sm"
      variant="outline"
      icon="plus"
      iconPosition="left"
      onClick={onAdd}
    >
      {title}
    </AnimatedUIButton>
  );
}

function VariantAttributeField({
  variant,
  attribute,
  value,
  onChange,
}: {
  variant: ProductVariantEditorState;
  attribute: ProductAttributeEditorState;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = `variant-attribute-${variant.formKey}-${attribute.formKey}`;

  if (attribute.dataType === "BOOLEAN") {
    return (
      <PanelField id={id} label={attribute.name}>
        <BooleanButton
          id={id}
          checked={value === "true"}
          onClick={(checked: boolean) => onChange(checked ? "true" : "false")}
        />
      </PanelField>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <ProductAttributeValueInput
        id={id}
        value={value}
        onChange={onChange}
        attributeName={attribute.name}
        dataType={attribute.dataType}
        unit={attribute.unit || null}
        placeholder={getAttributePlaceholder(attribute)}
        inputType={attribute.dataType === "NUMBER" ? "number" : "text"}
        inputMode={attribute.dataType === "NUMBER" ? "decimal" : undefined}
      />
      {attribute.unit ? (
        <span className="text-sm font-medium text-slate-400">{attribute.unit}</span>
      ) : null}
    </div>
  );
}

export default function ProductVariantCard({
  family,
  variant,
  index,
  isOpen,
  isDefault,
  isFirst,
  isLast,
  attributes,
  onVariantRemove,
  onVariantDuplicate,
  onVariantMove,
  onVariantChange,
  onVariantAttributeValueChange,
}: {
  family: ProductEditorFormState;
  variant: ProductVariantEditorState;
  index: number;
  isOpen: boolean;
  isDefault: boolean;
  isFirst: boolean;
  isLast: boolean;
  attributes: ProductAttributeEditorState[];
  onVariantRemove: (formKey: string) => void;
  onVariantDuplicate: (formKey: string) => void;
  onVariantMove: (formKey: string, direction: "up" | "down") => void;
  onVariantChange: <Field extends EditableVariantField>(
    formKey: string,
    field: Field,
    value: ProductVariantEditorState[Field],
  ) => void;
  onVariantAttributeValueChange: (formKey: string, attributeFormKey: string, value: string) => void;
}) {
  const defaultVariant = family.variants[0] ?? null;
  const effectiveValues = getEffectiveVariantValues(family, variant);
  const lifecycleBadge = getLifecycleBadge(effectiveValues.effectiveLifecycleStatus);
  const visibilityBadge = getVisibilityBadge(effectiveValues.effectiveVisibility);
  const commercialBadge = getCommercialModeBadge(effectiveValues.effectiveCommercialMode);
  const filledAttributeCount = variant.attributeValues.filter((attributeValue) =>
    attributeValue.value.trim(),
  ).length;
  const addonCount = getAddonCount(variant, isDefault);
  const variantSlug = getComputedVariantSlug(variant.name) || "slug-variante";

  const setAddonState = (
    field:
      | "lifecycleStatus"
      | "visibility"
      | "commercialMode"
      | "priceVisibility"
      | "basePriceAmount",
    active: boolean,
  ) => {
    onVariantChange(variant.formKey, "addons", {
      ...variant.addons,
      [field]: active,
    });
  };

  return (
    <AccordionItem
      value={variant.formKey}
      className="rounded-3xl border border-slate-300 bg-white px-4 shadow-sm sm:px-5"
    >
      <div className="flex items-start gap-3 py-4 sm:pt-5">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">
                Variante {index + 1}
              </p>
              {isDefault ? (
                <StaffBadge size="sm" color="primary" icon="badge-check">
                  Par défaut
                </StaffBadge>
              ) : null}
              {!isDefault ? (
                <StaffBadge size="sm" color={addonCount > 0 ? "info" : "default"}>
                  {addonCount} addon{addonCount > 1 ? "s" : ""}
                </StaffBadge>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-cobam-dark-blue truncate text-base font-semibold">
                {variant.name.trim() || `Variante ${index + 1}`}
              </h3>
              {variant.sku.trim() ? (
                <StaffBadge size="sm" color="default">
                  {variant.sku}
                </StaffBadge>
              ) : null}
            </div>

            <p className="text-sm text-slate-500">{formatVariantPrice(effectiveValues.effectivePriceAmount, family.priceUnit)}</p>
            <p className="text-xs text-slate-400">{variantSlug}</p>
          </div>

          {!isOpen ? (
            <div className="flex flex-wrap gap-2">
              <StaffBadge size="sm" color={lifecycleBadge.color}>
                {lifecycleBadge.label}
              </StaffBadge>
              <StaffBadge size="sm" color={visibilityBadge.color}>
                {visibilityBadge.label}
              </StaffBadge>
              <StaffBadge size="sm" color={commercialBadge.color}>
                {commercialBadge.label}
              </StaffBadge>
              <StaffBadge size="sm" color="secondary">
                {variant.media.length} média{variant.media.length > 1 ? "s" : ""}
              </StaffBadge>
              <StaffBadge size="sm" color="default">
                {filledAttributeCount}/{attributes.length} attribut
                {attributes.length > 1 ? "s" : ""}
              </StaffBadge>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2 pt-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <AnimatedUIButton
                type="button"
                variant="outline"
                icon="ellipsis"
                color="default"
                aria-label="Options de la variante"
                title="Options de la variante"
                size="sm"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={() => onVariantDuplicate(variant.formKey)}>
                  <Copy className="h-4 w-4" />
                  Dupliquer
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isFirst}
                  onSelect={() => onVariantMove(variant.formKey, "up")}
                >
                  <ChevronUp className="h-4 w-4" />
                  Monter
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={isLast}
                  onSelect={() => onVariantMove(variant.formKey, "down")}
                >
                  <ChevronDown className="h-4 w-4" />
                  Descendre
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <AccordionTrigger hideChevron className="w-auto shrink-0 py-0 hover:no-underline">
            <AnimatedUIButton
              size="sm"
              variant="outline"
              icon={isOpen ? "chevron-up" : "chevron-down"}
            />
          </AccordionTrigger>

          {!isDefault ? (
            <Dialog>
              <DialogTrigger asChild>
                <AnimatedUIButton
                  size="sm"
                  type="button"
                  variant="outline"
                  icon="close"
                  color="error"
                  aria-label="Supprimer la variante"
                  title="Supprimer la variante"
                />
              </DialogTrigger>
              <DialogContent className="w-[min(96vw,560px)]">
                <DialogHeader>
                  <DialogTitle>Retirer cette variante ?</DialogTitle>
                  <DialogDescription>
                    Cette action retirera définitivement {variant.name.trim() || `la variante ${index + 1}`} de la famille produit en cours d’édition.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <AnimatedUIButton type="button" variant="light" color="default">
                      Annuler
                    </AnimatedUIButton>
                  </DialogClose>
                  <AnimatedUIButton
                    type="button"
                    variant="primary"
                    color="error"
                    icon="delete"
                    iconPosition="left"
                    onClick={() => onVariantRemove(variant.formKey)}
                  >
                    Supprimer
                  </AnimatedUIButton>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : null}
        </div>
      </div>

      <AccordionContent className="min-h-fit pt-5 pb-5">
        <div className="space-y-5">
          {!isDefault ? (
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50/70 p-4 text-sm text-cyan-900">
              Cette variante hérite des réglages de la variante par défaut tant qu’aucun addon n’est activé.
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <PanelField
              id={`variant-sku-${variant.formKey}`}
              label="SKU"
              hint="Toujours spécifique à la variante."
            >
              <PanelInput
                id={`variant-sku-${variant.formKey}`}
                fullWidth
                value={variant.sku}
                onChange={(event) => onVariantChange(variant.formKey, "sku", event.target.value)}
                placeholder="Ex. ATL-001-BLK"
              />
            </PanelField>

            <PanelField
              id={`variant-name-${variant.formKey}`}
              label="Nom"
            >
              <PanelInput
                id={`variant-name-${variant.formKey}`}
                fullWidth
                value={variant.name}
                onChange={(event) => onVariantChange(variant.formKey, "name", event.target.value)}
                placeholder="Nom de la variante"
              />
            </PanelField>
          </div>

          <PanelField
            id={`variant-description-${variant.formKey}`}
            label="Description"
          >
            <ArticleRichTextEditor
              editorId={`variant-description-${variant.formKey}`}
              value={variant.description}
              onChange={(nextValue) => onVariantChange(variant.formKey, "description", nextValue)}
              placeholder="Description de la variante..."
              className="overflow-hidden rounded-[28px]"
            />
          </PanelField>

          <PanelField
            id={`variant-description-seo-${variant.formKey}`}
            label="Description SEO"
          >
            <Textarea
              id={`variant-description-seo-${variant.formKey}`}
              value={variant.descriptionSeo}
              onChange={(event) =>
                onVariantChange(variant.formKey, "descriptionSeo", event.target.value)
              }
              placeholder="Résumé court optimisé pour les moteurs de recherche..."
              className="min-h-28 rounded-md border-slate-300 px-4 py-3 text-base"
            />
          </PanelField>

          {isDefault ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <PanelField id={`variant-lifecycle-${variant.formKey}`} label="Cycle de vie">
                <StaffSelect
                  fullWidth
                  id={`variant-lifecycle-${variant.formKey}`}
                  value={variant.lifecycleStatus ?? "DRAFT"}
                  onValueChange={(value) =>
                    onVariantChange(
                      variant.formKey,
                      "lifecycleStatus",
                      value as ProductVariantEditorState["lifecycleStatus"],
                    )
                  }
                  options={[
                    { value: "DRAFT", label: "Brouillon" },
                    { value: "ACTIVE", label: "Active" },
                    { value: "ARCHIVED", label: "Archivée" },
                  ]}
                  triggerClassName="h-10 rounded-2xl border-slate-300 px-4 text-base"
                />
              </PanelField>

              <PanelField id={`variant-visibility-${variant.formKey}`} label="Visibilité">
                <StaffSelect
                  fullWidth
                  id={`variant-visibility-${variant.formKey}`}
                  value={variant.visibility ?? "HIDDEN"}
                  onValueChange={(value) =>
                    onVariantChange(
                      variant.formKey,
                      "visibility",
                      value as ProductVariantEditorState["visibility"],
                    )
                  }
                  options={[
                    { value: "HIDDEN", label: "Masquée" },
                    { value: "PUBLIC", label: "Publique" },
                  ]}
                  triggerClassName="h-10 rounded-2xl border-slate-300 px-4 text-base"
                />
              </PanelField>

              <PanelField id={`variant-commercial-${variant.formKey}`} label="Mode commercial">
                <StaffSelect
                  fullWidth
                  id={`variant-commercial-${variant.formKey}`}
                  value={variant.commercialMode ?? "REFERENCE_ONLY"}
                  onValueChange={(value) =>
                    onVariantChange(
                      variant.formKey,
                      "commercialMode",
                      value as ProductVariantEditorState["commercialMode"],
                    )
                  }
                  options={[
                    { value: "REFERENCE_ONLY", label: "Référence" },
                    { value: "QUOTE_ONLY", label: "Sur demande" },
                    { value: "SELLABLE", label: "Vendable" },
                  ]}
                  triggerClassName="h-10 rounded-2xl border-slate-300 px-4 text-base"
                />
              </PanelField>

              <PanelField id={`variant-price-visibility-${variant.formKey}`} label="Visibilité du prix">
                <StaffSelect
                  fullWidth
                  id={`variant-price-visibility-${variant.formKey}`}
                  value={variant.priceVisibility ?? "HIDDEN"}
                  onValueChange={(value) =>
                    onVariantChange(
                      variant.formKey,
                      "priceVisibility",
                      value as ProductVariantEditorState["priceVisibility"],
                    )
                  }
                  options={[
                    { value: "HIDDEN", label: "Masquée" },
                    { value: "VISIBLE", label: "Visible" },
                  ]}
                  triggerClassName="h-10 rounded-2xl border-slate-300 px-4 text-base"
                />
              </PanelField>

              <div className="lg:col-span-2">
                <ProductPriceField
                  id={`variant-base-price-${variant.formKey}`}
                  value={variant.basePriceAmount ?? ""}
                  priceUnitSymbol={getProductPriceUnitSymbol(family.priceUnit)}
                  onChange={(nextValue) =>
                    onVariantChange(variant.formKey, "basePriceAmount", nextValue)
                  }
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <AddonCard
                  title="Cycle de vie"
                  active={variant.addons.lifecycleStatus}
                  onAdd={() => {
                    setAddonState("lifecycleStatus", true);
                    onVariantChange(
                      variant.formKey,
                      "lifecycleStatus",
                      defaultVariant?.lifecycleStatus ?? "DRAFT",
                    );
                  }}
                  onRemove={() => {
                    setAddonState("lifecycleStatus", false);
                    onVariantChange(variant.formKey, "lifecycleStatus", null);
                  }}
                >
                  <PanelField id={`variant-lifecycle-addon-${variant.formKey}`} label="Cycle de vie">
                    <StaffSelect
                      fullWidth
                      id={`variant-lifecycle-addon-${variant.formKey}`}
                      value={variant.lifecycleStatus ?? defaultVariant?.lifecycleStatus ?? "DRAFT"}
                      onValueChange={(value) =>
                        onVariantChange(
                          variant.formKey,
                          "lifecycleStatus",
                          value as ProductVariantEditorState["lifecycleStatus"],
                        )
                      }
                      options={[
                        { value: "DRAFT", label: "Brouillon" },
                        { value: "ACTIVE", label: "Active" },
                        { value: "ARCHIVED", label: "Archivée" },
                      ]}
                      triggerClassName="h-10 rounded-2xl border-slate-300 px-4 text-base"
                    />
                  </PanelField>
                </AddonCard>

                <AddonCard
                  title="Visibilité"
                  active={variant.addons.visibility}
                  onAdd={() => {
                    setAddonState("visibility", true);
                    onVariantChange(
                      variant.formKey,
                      "visibility",
                      defaultVariant?.visibility ?? "HIDDEN",
                    );
                  }}
                  onRemove={() => {
                    setAddonState("visibility", false);
                    onVariantChange(variant.formKey, "visibility", null);
                  }}
                >
                  <PanelField id={`variant-visibility-addon-${variant.formKey}`} label="Visibilité">
                    <StaffSelect
                      fullWidth
                      id={`variant-visibility-addon-${variant.formKey}`}
                      value={variant.visibility ?? defaultVariant?.visibility ?? "HIDDEN"}
                      onValueChange={(value) =>
                        onVariantChange(
                          variant.formKey,
                          "visibility",
                          value as ProductVariantEditorState["visibility"],
                        )
                      }
                      options={[
                        { value: "HIDDEN", label: "Masquée" },
                        { value: "PUBLIC", label: "Publique" },
                      ]}
                      triggerClassName="h-10 rounded-2xl border-slate-300 px-4 text-base"
                    />
                  </PanelField>
                </AddonCard>

                <AddonCard
                  title="Mode commercial"
                  active={variant.addons.commercialMode}
                  onAdd={() => {
                    setAddonState("commercialMode", true);
                    onVariantChange(
                      variant.formKey,
                      "commercialMode",
                      defaultVariant?.commercialMode ?? "REFERENCE_ONLY",
                    );
                  }}
                  onRemove={() => {
                    setAddonState("commercialMode", false);
                    onVariantChange(variant.formKey, "commercialMode", null);
                  }}
                >
                  <PanelField id={`variant-commercial-addon-${variant.formKey}`} label="Mode commercial">
                    <StaffSelect
                      fullWidth
                      id={`variant-commercial-addon-${variant.formKey}`}
                      value={variant.commercialMode ?? defaultVariant?.commercialMode ?? "REFERENCE_ONLY"}
                      onValueChange={(value) =>
                        onVariantChange(
                          variant.formKey,
                          "commercialMode",
                          value as ProductVariantEditorState["commercialMode"],
                        )
                      }
                      options={[
                        { value: "REFERENCE_ONLY", label: "Référence" },
                        { value: "QUOTE_ONLY", label: "Sur demande" },
                        { value: "SELLABLE", label: "Vendable" },
                      ]}
                      triggerClassName="h-10 rounded-2xl border-slate-300 px-4 text-base"
                    />
                  </PanelField>
                </AddonCard>

                <AddonCard
                  title="Visibilité du prix"
                  active={variant.addons.priceVisibility}
                  onAdd={() => {
                    setAddonState("priceVisibility", true);
                    onVariantChange(
                      variant.formKey,
                      "priceVisibility",
                      defaultVariant?.priceVisibility ?? "HIDDEN",
                    );
                  }}
                  onRemove={() => {
                    setAddonState("priceVisibility", false);
                    onVariantChange(variant.formKey, "priceVisibility", null);
                  }}
                >
                  <PanelField id={`variant-price-visibility-addon-${variant.formKey}`} label="Visibilité du prix">
                    <StaffSelect
                      fullWidth
                      id={`variant-price-visibility-addon-${variant.formKey}`}
                      value={variant.priceVisibility ?? defaultVariant?.priceVisibility ?? "HIDDEN"}
                      onValueChange={(value) =>
                        onVariantChange(
                          variant.formKey,
                          "priceVisibility",
                          value as ProductVariantEditorState["priceVisibility"],
                        )
                      }
                      options={[
                        { value: "HIDDEN", label: "Masquée" },
                        { value: "VISIBLE", label: "Visible" },
                      ]}
                      triggerClassName="h-10 rounded-2xl border-slate-300 px-4 text-base"
                    />
                  </PanelField>
                </AddonCard>
              </div>

              <AddonCard
                title="Prix"
                active={variant.addons.basePriceAmount}
                onAdd={() => {
                  setAddonState("basePriceAmount", true);
                  onVariantChange(
                    variant.formKey,
                    "basePriceAmount",
                    defaultVariant?.basePriceAmount ?? "",
                  );
                }}
                onRemove={() => {
                  setAddonState("basePriceAmount", false);
                  onVariantChange(variant.formKey, "basePriceAmount", null);
                }}
              >
                <ProductPriceField
                  id={`variant-price-addon-${variant.formKey}`}
                  value={variant.basePriceAmount ?? defaultVariant?.basePriceAmount ?? ""}
                  priceUnitSymbol={getProductPriceUnitSymbol(family.priceUnit)}
                  onChange={(nextValue) =>
                    onVariantChange(variant.formKey, "basePriceAmount", nextValue)
                  }
                />
              </AddonCard>
            </div>
          )}

          <ProductMediaGrid
            items={variant.media}
            onChange={(nextMedia) => onVariantChange(variant.formKey, "media", nextMedia)}
            title="Galerie de la variante"
            description="Optionnel : ajoutez plusieurs médias si besoin, puis glissez-les pour définir leur ordre d'affichage."
          />

          <div className="rounded-2xl border border-slate-300 bg-slate-50/80 p-4">
            <div className="mb-4 inline-flex items-center gap-2">
              <p className="text-cobam-dark-blue text-sm font-semibold">Valeurs d’attributs</p>
              <StaffBadge size="sm" color="default">
                {attributes.length}
              </StaffBadge>
            </div>

            {attributes.length === 0 ? (
              <p className="text-sm leading-6 text-slate-500">
                Ajoutez d’abord des attributs sur la famille pour les renseigner ici.
              </p>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {attributes.map((attribute) => (
                  <div
                    key={`${variant.formKey}-${attribute.formKey}`}
                    className="rounded-2xl border border-slate-300 bg-white p-4"
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <p className="text-cobam-dark-blue text-sm font-semibold">
                        {attribute.name || "Attribut sans nom"}
                      </p>
                      <StaffBadge size="sm" color="secondary">
                        {getProductAttributeDataTypeLabel(attribute.dataType)}
                      </StaffBadge>
                    </div>
                    <VariantAttributeField
                      variant={variant}
                      attribute={attribute}
                      value={
                        variant.attributeValues.find(
                          (item) => item.attributeFormKey === attribute.formKey,
                        )?.value ?? ""
                      }
                      onChange={(nextValue) =>
                        onVariantAttributeValueChange(variant.formKey, attribute.formKey, nextValue)
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
