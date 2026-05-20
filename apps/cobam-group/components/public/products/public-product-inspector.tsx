"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  ChevronRight,
  FileText,
  FolderTree,
  Info,
  MessageSquareText,
  Ruler,
  XCircle,
} from "lucide-react";
import AnimatedUICopyButton from "@/components/ui/custom/CopyButton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import Carousel from "./inspector/Carousel";
import {
  buildColorOptions,
  buildFinishOptions,
  buildNormalAttributeGroups,
  findVariantByNormalAttribute,
  findVariantBySpecialValues,
  getVariantAttributeValue,
  getVariantFinishKey,
  getVariantMedia,
  getVariantSpecialValue,
  normalizeComparableValue,
  normalizeInspectorProduct,
  type PublicProductInspectorViewProps,
  resolveInitialVariantId,
} from "./inspector/utils";
import RichDescription from "./inspector/RichDescription";
import ColorsList from "./inspector/ColorsList";
import FinishesList from "./inspector/FinishesList";
import DatasheetLink from "./inspector/DatasheetLink";
import ProductDevisDialog from "./inspector/ProductDevisDialog";
import BrandTooltip from "./inspector/BrandTooltip";
import BreadCrumb from "./inspector/BreadCrumb";
import VariantRail from "./inspector/VariantsRail";
import type {
  PublicProductInspectorAttribute,
  PublicProductSubcategoryLink,
  PublicProductInspectorVariant,
} from "@/features/products/types";

type DetailRow = {
  label: string;
  value: string;
  tone?: "default" | "positive" | "muted";
};

const SUMMARY_ATTRIBUTE_IDS = new Set([
  "product_use",
  "color_code",
  "packaging_weight_kg",
  "product_range",
  "ready_to_use",
  "waterproof",
  "joint_width_mm",
]);

function attrKey(attribute: PublicProductInspectorAttribute) {
  return normalizeComparableValue(attribute.attributeId || attribute.kind || attribute.name).replace(
    /\s+/g,
    "_",
  );
}

function findAttribute(
  attributes: PublicProductInspectorAttribute[],
  keys: string[],
) {
  const wanted = new Set(keys.map((key) => normalizeComparableValue(key).replace(/\s+/g, "_")));

  return (
    attributes.find((attribute) => {
      const normalizedKeys = [
        attrKey(attribute),
        normalizeComparableValue(attribute.name).replace(/\s+/g, "_"),
        normalizeComparableValue(attribute.kind).replace(/\s+/g, "_"),
      ];

      return normalizedKeys.some((key) => wanted.has(key));
    }) ?? null
  );
}

function parseBooleanValue(value: string | null | undefined) {
  const normalized = normalizeComparableValue(value);

  if (["true", "1", "yes", "oui"].includes(normalized)) {
    return true;
  }

  if (["false", "0", "no", "non"].includes(normalized)) {
    return false;
  }

  return null;
}

function formatPreparation(attribute: PublicProductInspectorAttribute | null) {
  const value = attribute ? parseBooleanValue(attribute.value) : null;

  if (value === true) {
    return "Pret a l'emploi";
  }

  if (value === false) {
    return "A melanger";
  }

  return null;
}

function formatWaterResistance(attribute: PublicProductInspectorAttribute | null) {
  const value = attribute ? parseBooleanValue(attribute.value) : null;

  if (value === true) {
    return "Etanche";
  }

  if (value === false) {
    return "Non etanche";
  }

  return null;
}

function formatAttributeValue(attribute: PublicProductInspectorAttribute) {
  if (attribute.inputType === "BOOLEAN") {
    const booleanValue = parseBooleanValue(attribute.value);

    if (booleanValue != null) {
      return booleanValue ? "Oui" : "Non";
    }
  }

  return `${attribute.value}${attribute.unit ? ` ${attribute.unit}` : ""}`;
}

function formatOptionLabel(label: string, unit: string | null) {
  if (!unit) {
    return label;
  }

  const normalized = normalizeComparableValue(label);
  const normalizedUnit = normalizeComparableValue(unit);

  return normalized.endsWith(normalizedUnit) ? label : `${label} ${unit}`;
}

function stripBrandPrefix(name: string, brandName: string | null) {
  if (!brandName) {
    return name;
  }

  const pattern = new RegExp(`^${brandName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*-\\s*`, "i");
  return name.replace(pattern, "").trim();
}

function buildProductTitle(input: {
  displayName: string;
  brandName: string | null;
  colorLabel: string | null;
  productUse: string | null;
}) {
  const withoutBrand = stripBrandPrefix(input.displayName, input.brandName)
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b\d+(?:[,.]\d+)?\s*kg\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (input.productUse && normalizeComparableValue(input.productUse).includes("joint")) {
    const base = withoutBrand.match(/^carro?joint/i) ? "Carrojoint" : withoutBrand.split(" ")[0];
    return input.colorLabel ? `${base} ${input.colorLabel}` : withoutBrand;
  }

  return withoutBrand || input.displayName;
}

function DetailValue({ row }: { row: DetailRow }) {
  if (row.tone === "positive") {
    return (
      <span className="inline-flex items-center gap-2 font-semibold text-emerald-700">
        <CheckCircle2 className="size-4" aria-hidden="true" />
        {row.value}
      </span>
    );
  }

  if (row.tone === "muted") {
    return (
      <span className="inline-flex items-center gap-2 font-semibold text-slate-500">
        <XCircle className="size-4" aria-hidden="true" />
        {row.value}
      </span>
    );
  }

  return <span className="font-semibold text-cobam-dark-blue">{row.value}</span>;
}

function TechnicalRows({ rows }: { rows: DetailRow[] }) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <dl className="divide-y divide-cobam-quill-grey/30 rounded-[1.35rem] border border-cobam-quill-grey/35 bg-white">
      {rows.map((row) => (
        <div
          key={`${row.label}-${row.value}`}
          className="grid gap-2 px-4 py-4 sm:grid-cols-[15rem_1fr] sm:px-5"
        >
          <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {row.label}
          </dt>
          <dd className="text-sm">
            <DetailValue row={row} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

function VariantOptionSelector({
  title,
  group,
  selectedVariant,
  onSelect,
}: {
  title: string;
  group: ReturnType<typeof buildNormalAttributeGroups>[number];
  selectedVariant: PublicProductInspectorVariant;
  onSelect: (attributeId: string, valueKey: string) => void;
}) {
  const selectedValue = getVariantAttributeValue(selectedVariant, group.attributeId);
  const selectedKey = selectedValue ? normalizeComparableValue(selectedValue.value) : null;

  if (group.options.length <= 1) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{title}</p>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {group.options.map((option) => {
          const active = selectedKey === option.key;

          return (
            <button
              key={`${group.attributeId}-${option.key}`}
              type="button"
              onClick={() => onSelect(group.attributeId, option.key)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobam-water-blue/45",
                active
                  ? "border-cobam-dark-blue bg-cobam-dark-blue text-white shadow-sm"
                  : "border-cobam-quill-grey/45 bg-white text-slate-600 hover:border-cobam-water-blue/60 hover:text-cobam-dark-blue",
              )}
              aria-pressed={active}
            >
              {formatOptionLabel(option.label, group.unit)}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function groupSubcategoriesByCategory(subcategories: PublicProductSubcategoryLink[]) {
  const groups = new Map<
    string,
    {
      categoryName: string;
      categorySlug: string;
      subcategories: PublicProductSubcategoryLink[];
    }
  >();

  for (const subcategory of subcategories) {
    const key = subcategory.categorySlug;
    const current = groups.get(key);

    if (current) {
      current.subcategories.push(subcategory);
      continue;
    }

    groups.set(key, {
      categoryName: subcategory.categoryName,
      categorySlug: subcategory.categorySlug,
      subcategories: [subcategory],
    });
  }

  return [...groups.values()];
}

function CatalogContextSection({
  subcategories,
}: {
  subcategories: PublicProductSubcategoryLink[];
}) {
  if (subcategories.length === 0) {
    return null;
  }

  const groups = groupSubcategoriesByCategory(subcategories);

  return (
    <section className="rounded-[1.6rem] border border-cobam-quill-grey/35 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-slate-50 text-cobam-water-blue">
          <FolderTree className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-cobam-dark-blue">
            Parcours catalogue
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Catégories et sous-catégories où ce produit apparaît dans le catalogue COBAM.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {groups.map((group) => (
          <div
            key={group.categorySlug}
            className="rounded-[1.15rem] border border-cobam-quill-grey/30 bg-slate-50 p-4"
          >
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Link
                href={`/produits/${group.categorySlug}`}
                className="font-semibold text-cobam-dark-blue transition hover:text-cobam-water-blue"
              >
                {group.categoryName}
              </Link>
              <ChevronRight className="size-4 text-slate-300" aria-hidden="true" />
              <span className="text-slate-500">
                {group.subcategories.length > 1 ? "Sous-catégories" : "Sous-catégorie"}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {group.subcategories.map((subcategory) => (
                <Link
                  key={`${subcategory.categorySlug}-${subcategory.slug}`}
                  href={`/produits/${subcategory.categorySlug}/${subcategory.slug}`}
                  className="rounded-full border border-cobam-quill-grey/35 bg-white px-3 py-1.5 text-xs font-semibold text-cobam-dark-blue transition hover:border-cobam-water-blue hover:text-cobam-water-blue"
                >
                  {subcategory.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function PublicProductInspectorView({
  product,
  breadcrumb,
}: PublicProductInspectorViewProps) {
  const normalizedProduct = normalizeInspectorProduct(product);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);

  const selectedVariant =
    normalizedProduct.variants.find(
      (variant) => variant.id === (selectedVariantId ?? resolveInitialVariantId(normalizedProduct)),
    ) ??
    normalizedProduct.variants[0] ??
    null;

  const normalAttributeGroups = buildNormalAttributeGroups(normalizedProduct);
  const colorOptions = buildColorOptions(normalizedProduct);
  const finishOptions = buildFinishOptions(normalizedProduct);
  const selectedColor = getVariantSpecialValue(selectedVariant, "COLOR");
  const selectedFinishKey = getVariantFinishKey(
    selectedVariant,
    normalizedProduct.finishReferences,
  );

  const colorCodesByKey: Record<string, string | null> = {};

  for (const variant of normalizedProduct.variants) {
    const color = getVariantSpecialValue(variant, "COLOR");
    const code = findAttribute(variant.attributes, ["color_code", "code couleur"]);

    if (color && colorCodesByKey[color.key] === undefined) {
      colorCodesByKey[color.key] = code?.value ?? null;
    }
  }

  if (!selectedVariant) {
    return null;
  }

  const selectedMedia = getVariantMedia(selectedVariant, normalizedProduct.coverMedia);
  const normalAttributes = selectedVariant.attributes.filter(
    (attribute) => attribute.specialType == null,
  );
  const productUseAttr = findAttribute(normalAttributes, ["product_use", "type de produit"]);
  const packagingAttr = findAttribute(normalAttributes, [
    "packaging_weight_kg",
    "conditionnement",
  ]);
  const rangeAttr = findAttribute(normalAttributes, ["product_range", "gamme"]);
  const colorCodeAttr = findAttribute(normalAttributes, ["color_code", "code couleur"]);
  const readyAttr = findAttribute(normalAttributes, ["ready_to_use", "pret a l'emploi"]);
  const waterproofAttr = findAttribute(normalAttributes, ["waterproof", "etanche"]);
  const jointWidthAttr = findAttribute(normalAttributes, ["joint_width_mm", "largeur de joint"]);
  const productUse = productUseAttr?.value ?? normalizedProduct.subcategories[0]?.name ?? null;
  const packagingText = packagingAttr
    ? formatOptionLabel(packagingAttr.value, packagingAttr.unit)
    : null;
  const preparationText = formatPreparation(readyAttr);
  const waterResistanceText = formatWaterResistance(waterproofAttr);
  const brandName = normalizedProduct.brand?.name ?? normalizedProduct.brandName ?? null;
  const displayTitle = buildProductTitle({
    displayName: selectedVariant.displayName,
    brandName,
    colorLabel: selectedColor?.label ?? null,
    productUse,
  });
  const fallbackSubcategory = normalizedProduct.subcategories[0] ?? null;
  const resolvedBreadcrumb =
    breadcrumb ??
    (fallbackSubcategory
      ? {
          categoryName: fallbackSubcategory.categoryName,
          categorySlug: fallbackSubcategory.categorySlug,
          subcategoryName: fallbackSubcategory.name,
          subcategorySlug: fallbackSubcategory.slug,
        }
      : null);
  const variantSummary = [
    selectedColor?.label
      ? `${selectedColor.label}${colorCodeAttr?.value ? ` ${colorCodeAttr.value}` : ""}`
      : null,
    rangeAttr?.value,
    waterResistanceText,
    packagingText,
  ].filter(Boolean);

  const summaryRows: DetailRow[] = [
    productUse ? { label: "Type de produit", value: productUse } : null,
    selectedColor?.label
      ? {
          label: "Couleur",
          value: `${selectedColor.label}${colorCodeAttr?.value ? ` - Code ${colorCodeAttr.value}` : ""}`,
        }
      : null,
    packagingText ? { label: "Conditionnement", value: packagingText } : null,
    rangeAttr?.value ? { label: "Gamme", value: rangeAttr.value } : null,
    preparationText ? { label: "Preparation", value: preparationText } : null,
    waterResistanceText
      ? {
          label: "Resistance a l'eau",
          value: waterResistanceText,
          tone: parseBooleanValue(waterproofAttr?.value) ? "positive" : "muted",
        }
      : null,
  ].filter((row): row is DetailRow => row != null);

  const technicalRows: DetailRow[] = [
    ...summaryRows,
    jointWidthAttr ? { label: "Largeur de joint", value: formatAttributeValue(jointWidthAttr) } : null,
    ...normalAttributes
      .filter((attribute) => !SUMMARY_ATTRIBUTE_IDS.has(attrKey(attribute)))
      .map((attribute) => ({
        label: attribute.name,
        value: formatAttributeValue(attribute),
        tone:
          attribute.inputType === "BOOLEAN"
            ? parseBooleanValue(attribute.value)
              ? ("positive" as const)
              : ("muted" as const)
            : ("default" as const),
      })),
  ].filter((row): row is DetailRow => row != null);

  const selectorGroups = normalAttributeGroups.filter((group) =>
    ["packaging_weight_kg", "product_range"].includes(
      normalizeComparableValue(group.attributeId).replace(/\s+/g, "_"),
    ),
  );

  const handleColorSelect = (colorKey: string) => {
    const targetVariant =
      findVariantBySpecialValues(normalizedProduct.variants, normalizedProduct.finishReferences, {
        colorKey,
        finishKey: selectedFinishKey,
      }) ??
      findVariantBySpecialValues(normalizedProduct.variants, normalizedProduct.finishReferences, {
        colorKey,
      });

    if (targetVariant) {
      setSelectedVariantId(targetVariant.id);
    }
  };

  const handleFinishSelect = (finishKey: string) => {
    const targetVariant =
      findVariantBySpecialValues(normalizedProduct.variants, normalizedProduct.finishReferences, {
        colorKey: selectedColor?.key ?? null,
        finishKey,
      }) ??
      findVariantBySpecialValues(normalizedProduct.variants, normalizedProduct.finishReferences, {
        finishKey,
      });

    if (targetVariant) {
      setSelectedVariantId(targetVariant.id);
    }
  };

  const handleNormalAttributeSelect = (attributeId: string, valueKey: string) => {
    const targetVariant = findVariantByNormalAttribute(
      normalizedProduct.variants,
      attributeId,
      valueKey,
    );

    if (targetVariant) {
      setSelectedVariantId(targetVariant.id);
    }
  };

  return (
    <TooltipProvider>
      <article className="space-y-12">
        {resolvedBreadcrumb ? (
          <BreadCrumb {...resolvedBreadcrumb} currentName={displayTitle} />
        ) : null}

        <section className="grid gap-10 lg:grid-cols-[minmax(22rem,0.92fr)_minmax(0,1.08fr)] lg:items-start">
          <Carousel
            key={`${selectedVariant.id}-${selectedMedia.map((media) => media.id).join("-")}`}
            media={selectedMedia}
            title={selectedVariant.displayName}
            datasheetUrl={selectedVariant.datasheet?.url ?? null}
          />

          <div className="space-y-7">
            <header className="rounded-[2rem] border border-cobam-quill-grey/35 bg-white p-5 shadow-[0_24px_80px_rgba(20,32,46,0.06)] sm:p-7">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <BrandTooltip brand={normalizedProduct.brand} />
                <div className="inline-flex items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    SKU
                  </span>
                  <span className="text-sm font-semibold text-cobam-dark-blue">
                    {selectedVariant.sku}
                  </span>
                  <AnimatedUICopyButton
                    value={selectedVariant.sku}
                    successText="SKU copie."
                    errorText="Impossible de copier le SKU."
                    size="xs"
                    variant="light"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {brandName ? (
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cobam-water-blue">
                    {brandName}
                  </p>
                ) : null}
                <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.055em] text-cobam-dark-blue sm:text-5xl lg:text-[4rem] lg:leading-[0.95]">
                  {displayTitle}
                </h1>
                {productUse ? (
                  <p className="text-xl font-medium text-slate-500">{productUse}</p>
                ) : null}
                {variantSummary.length > 0 ? (
                  <p className="text-base font-semibold text-cobam-dark-blue/75">
                    {variantSummary.join(" - ")}
                  </p>
                ) : null}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {summaryRows.slice(0, 4).map((row) => (
                  <span
                    key={`${row.label}-${row.value}`}
                    className="rounded-full border border-cobam-quill-grey/35 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-cobam-dark-blue"
                  >
                    {row.value}
                  </span>
                ))}
              </div>

              <div className="mt-7 rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm leading-7 text-slate-600">
                  Notre equipe vous accompagne pour la disponibilité, les conseils techniques et
                  le choix du produit adapte a votre projet.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <ProductDevisDialog
                    productName={selectedVariant.displayName}
                    sku={selectedVariant.sku}
                    triggerLabel="Demander un devis"
                  />
                  <Link
                    href="/contact"
                    className="inline-flex min-h-11 items-center rounded-full border border-cobam-quill-grey/40 bg-white px-5 text-sm font-semibold text-cobam-dark-blue transition hover:border-cobam-water-blue hover:text-cobam-water-blue"
                  >
                    Contacter un conseiller
                  </Link>
                  {selectedVariant.datasheet ? (
                    <DatasheetLink
                      url={selectedVariant.datasheet.url}
                      label="Consulter la fiche technique"
                    />
                  ) : null}
                </div>
              </div>
            </header>

            <div className="space-y-5">
              {colorOptions.length > 0 ? (
                <ColorsList
                  activeKey={selectedColor?.key}
                  colors={colorOptions}
                  colorCodesByKey={colorCodesByKey}
                  onSelect={handleColorSelect}
                />
              ) : null}

              {finishOptions.length > 0 ? (
                <FinishesList
                  activeKey={selectedFinishKey ?? undefined}
                  finishes={finishOptions}
                  onSelect={handleFinishSelect}
                />
              ) : null}

              {selectorGroups.map((group) => (
                <VariantOptionSelector
                  key={group.attributeId}
                  title={normalizeComparableValue(group.attributeId).includes("packaging")
                    ? "Conditionnement"
                    : group.name}
                  group={group}
                  selectedVariant={selectedVariant}
                  onSelect={handleNormalAttributeSelect}
                />
              ))}
            </div>

            <section className="rounded-[1.6rem] border border-cobam-quill-grey/35 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <ClipboardCheck className="size-5 text-cobam-water-blue" aria-hidden="true" />
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-cobam-dark-blue">
                  Résumé du produit
                </h2>
              </div>
              <div className="mt-5">
                <TechnicalRows rows={summaryRows} />
              </div>
            </section>

            <CatalogContextSection subcategories={normalizedProduct.subcategories} />
          </div>
        </section>

        <section className="rounded-[2rem] border border-cobam-quill-grey/35 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-3">
            <Info className="size-5 text-cobam-water-blue" aria-hidden="true" />
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-cobam-dark-blue">
              Description
            </h2>
          </div>
          <div className="mt-5 max-w-none">
            <RichDescription description={selectedVariant.description} />
          </div>
        </section>

        <section className="rounded-[2rem] border border-cobam-quill-grey/35 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-3">
            <Ruler className="size-5 text-cobam-water-blue" aria-hidden="true" />
            <h2 className="text-2xl font-semibold tracking-[-0.04em] text-cobam-dark-blue">
              Caractéristiques techniques
            </h2>
          </div>
          <div className="mt-5">
            <TechnicalRows rows={technicalRows} />
          </div>
        </section>

        <section className="rounded-[2rem] border border-cobam-quill-grey/35 bg-cobam-dark-blue p-5 text-white shadow-[0_26px_80px_rgba(20,32,46,0.18)] sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cobam-water-blue">
                Documents & accompagnement
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">
                Vérifier, comparer, confirmer.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/68">
                Consultez les documents techniques disponibles ou contactez COBAM Group pour une
                validation produit, une disponibilité ou un conseil de mise en oeuvre.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.35rem] border border-white/10 bg-white/6 p-4">
                <FileText className="size-5 text-cobam-water-blue" aria-hidden="true" />
                <h3 className="mt-3 font-semibold">Documents techniques</h3>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  Fiches et informations disponibles selon le produit.
                </p>
                {selectedVariant.datasheet ? (
                  <div className="mt-4">
                    <DatasheetLink
                      url={selectedVariant.datasheet.url}
                      label="Telecharger la fiche"
                    />
                  </div>
                ) : null}
              </div>
              <div className="rounded-[1.35rem] border border-white/10 bg-white/6 p-4">
                <MessageSquareText className="size-5 text-cobam-water-blue" aria-hidden="true" />
                <h3 className="mt-3 font-semibold">Accompagnement COBAM</h3>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  Disponibilite, showroom et recommandations techniques a confirmer avec nos equipes.
                </p>
                <div className="mt-4">
                  <ProductDevisDialog
                    productName={selectedVariant.displayName}
                    sku={selectedVariant.sku}
                    triggerLabel="Demander un devis"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {normalizedProduct.variants.length > 1 ? (
          <VariantRail
            selectedVariantId={selectedVariant.id}
            variants={normalizedProduct.variants}
            coverMedia={normalizedProduct.coverMedia}
            selectVariant={setSelectedVariantId}
          />
        ) : null}
      </article>
    </TooltipProvider>
  );
}
