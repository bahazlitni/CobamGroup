"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  FileText,
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
import PublicProductCard from "./public-product-card";
import RailCarousel from "@/components/ui/custom/RailCarousel";
import type {
  PublicProductInspectorAttribute,
  PublicProductCertificate,
  PublicRelatedProductItem,
  PublicProductSubcategoryLink,
  PublicProductInspectorVariant,
} from "@/features/products/types";

type DetailRow = {
  label: string;
  value: string;
  tone?: "default" | "positive" | "muted";
};

function getDocumentLabel(
  document: { title: string | null },
  fallback: string,
  index: number,
  total: number,
) {
  if (document.title) {
    return document.title;
  }

  return total > 1 ? `${fallback} ${index + 1}` : fallback;
}

function ProductCertificatesGrid({ certificates }: { certificates: PublicProductCertificate[] }) {
  if (certificates.length === 0) {
    return null;
  }

  return (
    <section className="border-cobam-quill-grey/35 rounded-[2rem] border bg-white p-5 sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-cobam-water-blue text-xs font-semibold tracking-[0.24em] uppercase">
            Certifications
          </p>
          <h2 className="text-cobam-dark-blue mt-3 text-3xl font-semibold">Certificats produit</h2>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {certificates.map((certificate) => {
          const tooltipId = `certificate-tooltip-${certificate.id}`;

          return (
            <figure
              key={certificate.id}
              tabIndex={certificate.description ? 0 : undefined}
              aria-describedby={certificate.description ? tooltipId : undefined}
              className="group/certificate border-cobam-quill-grey/35 hover:border-cobam-water-blue/45 focus-visible:ring-cobam-water-blue/25 relative rounded-xl border bg-slate-50 p-4 transition outline-none hover:-translate-y-0.5 hover:bg-white hover:shadow-sm focus-visible:ring-2"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-white">
                <Image
                  src={certificate.imageThumbnailUrl ?? certificate.imageUrl}
                  alt={certificate.imageAltText ?? certificate.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 220px"
                  className="object-contain p-3"
                  draggable={false}
                />
              </div>
              <figcaption className="text-cobam-dark-blue mt-3 truncate text-sm font-semibold">
                {certificate.name}
              </figcaption>
              {certificate.description ? (
                <div
                  id={tooltipId}
                  role="tooltip"
                  className="bg-cobam-dark-blue pointer-events-none absolute top-full left-1/2 z-20 mt-3 w-64 -translate-x-1/2 rounded-lg px-3 py-2 text-xs leading-5 text-white opacity-0 shadow-xl transition group-hover/certificate:translate-y-1 group-hover/certificate:opacity-100 group-focus/certificate:translate-y-1 group-focus/certificate:opacity-100"
                >
                  {certificate.description}
                </div>
              ) : null}
            </figure>
          );
        })}
      </div>
    </section>
  );
}

const SUMMARY_ATTRIBUTE_IDS = new Set([
  "product_use",
  "color_code",
  "packaging_weight_kg",
  "product_range",
  "gamme",
  "ready_to_use",
  "waterproof",
  "etanche",
  "joint_width_mm",
  "largeur_de_joint",
]);

function attributeKeys(attribute: PublicProductInspectorAttribute) {
  return [attribute.attributeId, attribute.kind, attribute.name, attribute.groupName]
    .filter((value): value is string => Boolean(value))
    .map((value) => normalizeComparableValue(value).replace(/\s+/g, "_"));
}

function isSummaryAttribute(attribute: PublicProductInspectorAttribute) {
  return attributeKeys(attribute).some((key) => SUMMARY_ATTRIBUTE_IDS.has(key));
}

function findAttribute(attributes: PublicProductInspectorAttribute[], keys: string[]) {
  const wanted = new Set(keys.map((key) => normalizeComparableValue(key).replace(/\s+/g, "_")));

  return (
    attributes.find((attribute) => {
      return attributeKeys(attribute).some((key) => wanted.has(key));
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

  return <span className="text-cobam-dark-blue font-semibold">{row.value}</span>;
}

function TechnicalRows({ rows }: { rows: DetailRow[] }) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <dl className="divide-cobam-quill-grey/30 border-cobam-quill-grey/35 divide-y rounded-[1.35rem] border bg-white">
      {rows.map((row, index) => (
        <div
          key={`${row.label}-${row.value}-${index}`}
          className="grid gap-2 px-4 py-4 sm:grid-cols-[15rem_1fr] sm:px-5"
        >
          <dt className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
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
        <p className="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">{title}</p>
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
                "focus-visible:ring-cobam-water-blue/45 rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:ring-2 focus-visible:outline-none",
                active
                  ? "border-cobam-dark-blue bg-cobam-dark-blue text-white shadow-sm"
                  : "border-cobam-quill-grey/45 hover:border-cobam-water-blue/60 hover:text-cobam-dark-blue bg-white text-slate-600",
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

function CatalogBreadcrumbs({ subcategories }: { subcategories: PublicProductSubcategoryLink[] }) {
  if (subcategories.length === 0) {
    return null;
  }

  return (
    <section className="border-cobam-quill-grey/35 rounded-[1.35rem] border bg-white p-4">
      <div className="space-y-2">
        {subcategories.map((subcategory) => (
          <nav
            key={`${subcategory.categorySlug}-${subcategory.slug}`}
            aria-label={`Catalogue ${subcategory.categoryName} ${subcategory.name}`}
          >
            <ol className="flex flex-wrap items-center gap-2 text-sm">
              <li>
                <Link
                  href="/produits"
                  className="hover:text-cobam-water-blue font-semibold text-slate-500 transition"
                >
                  Produits
                </Link>
              </li>
              <li>
                <ChevronRight className="size-4 text-slate-300" aria-hidden="true" />
              </li>
              <li>
                <Link
                  href={`/produits/${subcategory.categorySlug}`}
                  className="text-cobam-dark-blue hover:text-cobam-water-blue font-semibold transition"
                >
                  {subcategory.categoryName}
                </Link>
              </li>
              <li>
                <ChevronRight className="size-4 text-slate-300" aria-hidden="true" />
              </li>
              <li>
                <Link
                  href={`/produits/${subcategory.categorySlug}/${subcategory.slug}`}
                  className="text-cobam-water-blue hover:text-cobam-dark-blue font-semibold transition"
                >
                  {subcategory.name}
                </Link>
              </li>
            </ol>
          </nav>
        ))}
      </div>
    </section>
  );
}

function buildRelatedProductHref(item: PublicRelatedProductItem) {
  if (item.product.entityType === "FAMILY") {
    return `/produits/${item.category.slug}/${item.subcategory.slug}/famille/${item.product.slug}`;
  }

  return `/produits/${item.category.slug}/${item.subcategory.slug}/${item.product.slug}`;
}

function RelatedProductsSection({ products }: { products: PublicRelatedProductItem[] }) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="border-cobam-quill-grey/35 space-y-5 border-t pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-slate-400 uppercase">
            Experimental
          </p>
          <h2 className="text-cobam-dark-blue mt-1 text-2xl font-semibold tracking-[-0.03em]">
            Produits proches
          </h2>
        </div>
      </div>

      <RailCarousel
        autoScroll={false}
        showButtons="on-hover"
        allowDrag={true}
        applyPhysics={true}
        modularScroll={false}
        className="-mx-2 px-2"
        viewportClassName="p-2 pb-4 pr-1"
        trackClassName="gap-5"
        itemClassName="w-[min(82vw,18rem)] sm:w-72 lg:w-80"
        previousButtonLabel="Produits proches precedents"
        nextButtonLabel="Produits proches suivants"
      >
        {products.map((item) => (
          <div
            key={`${item.product.entityType}-${item.product.id}-${item.category.slug}-${item.subcategory.slug}`}
            className="relative h-full"
          >
            <PublicProductCard
              product={item.product}
              href={buildRelatedProductHref(item)}
              themeColor={item.category.themeColor}
            />
          </div>
        ))}
      </RailCarousel>
    </section>
  );
}

export default function PublicProductInspectorView({
  product,
  breadcrumb,
  relatedProducts = [],
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
  const packagingAttr = findAttribute(normalAttributes, ["packaging_weight_kg", "conditionnement"]);
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
    jointWidthAttr
      ? { label: "Largeur de joint", value: formatAttributeValue(jointWidthAttr) }
      : null,
    ...normalAttributes
      .filter((attribute) => !isSummaryAttribute(attribute))
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
          />

          <div className="space-y-7">
            <header className="border-cobam-quill-grey/35 rounded-[2rem] border bg-white p-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <BrandTooltip brand={normalizedProduct.brand} />
                <div className="inline-flex items-center gap-3">
                  <span className="text-xs font-semibold tracking-[0.22em] text-slate-400 uppercase">
                    SKU
                  </span>
                  <span className="text-cobam-dark-blue text-sm font-semibold">
                    {selectedVariant.sku}
                  </span>
                  <AnimatedUICopyButton
                    value={selectedVariant.sku}
                    successText="SKU copié."
                    errorText="Impossible de copier le SKU."
                    size="xs"
                    variant="light"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <h1 className="text-cobam-dark-blue max-w-4xl text-4xl font-semibold tracking-[-0.055em] sm:text-5xl lg:text-[4rem] lg:leading-[0.95]">
                  {displayTitle}
                </h1>
                {productUse ? (
                  <p className="text-xl font-medium text-slate-500">{productUse}</p>
                ) : null}
                {variantSummary.length > 0 ? (
                  <p className="text-cobam-dark-blue/75 text-base font-semibold">
                    {variantSummary.join(" - ")}
                  </p>
                ) : null}
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3 rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4">
                <ProductDevisDialog
                  productName={selectedVariant.displayName}
                  sku={selectedVariant.sku}
                  triggerLabel="Demander un devis"
                />
                <Link
                  href="/contact"
                  className="border-cobam-quill-grey/40 text-cobam-dark-blue hover:border-cobam-water-blue hover:text-cobam-water-blue inline-flex min-h-11 items-center rounded-full border bg-white px-5 text-sm font-semibold transition"
                >
                  Contacter un conseiller
                </Link>
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
                  title={
                    normalizeComparableValue(group.attributeId).includes("packaging")
                      ? "Conditionnement"
                      : group.name
                  }
                  group={group}
                  selectedVariant={selectedVariant}
                  onSelect={handleNormalAttributeSelect}
                />
              ))}
            </div>

            <CatalogBreadcrumbs subcategories={normalizedProduct.subcategories} />
          </div>
        </section>

        <section className="border-cobam-quill-grey/35 rounded-[2rem] border bg-white p-5 sm:p-7">
          <div className="flex items-center gap-3">
            <Info className="text-cobam-water-blue size-5" aria-hidden="true" />
            <h2 className="text-cobam-dark-blue text-2xl font-semibold tracking-[-0.04em]">
              Description
            </h2>
          </div>
          <div className="mt-5 max-w-none">
            <RichDescription description={selectedVariant.description} />
          </div>
        </section>

        <section className="border-cobam-quill-grey/35 rounded-[2rem] border bg-white p-5 sm:p-7">
          <div className="flex items-center gap-3">
            <Ruler className="text-cobam-water-blue size-5" aria-hidden="true" />
            <h2 className="text-cobam-dark-blue text-2xl font-semibold tracking-[-0.04em]">
              Caractéristiques techniques
            </h2>
          </div>
          <div className="mt-5">
            <TechnicalRows rows={technicalRows} />
          </div>
        </section>

        <section className="border-cobam-quill-grey/35 bg-cobam-dark-blue rounded-[2rem] border p-5 text-white sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1fr] lg:items-center">
            <div>
              <p className="text-cobam-water-blue text-xs font-semibold tracking-[0.24em] uppercase">
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
                <FileText className="text-cobam-water-blue size-5" aria-hidden="true" />
                <h3 className="mt-3 font-semibold">Documents techniques</h3>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  Fiches et informations disponibles selon le produit.
                </p>
                {selectedVariant.datasheets.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-xs font-semibold tracking-[0.18em] text-white/45 uppercase">
                      {selectedVariant.datasheets.length > 1
                        ? "Fiches techniques"
                        : "Fiche technique"}
                    </h4>
                    {selectedVariant.datasheets.map((datasheet, index) => (
                      <DatasheetLink
                        key={`datasheet-${datasheet.id}`}
                        url={datasheet.url}
                        label={getDocumentLabel(
                          datasheet,
                          "Fiche technique",
                          index,
                          selectedVariant.datasheets.length,
                        )}
                      />
                    ))}
                  </div>
                ) : null}
                {selectedVariant.certificates.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-xs font-semibold tracking-[0.18em] text-white/45 uppercase">
                      {selectedVariant.certificates.length > 1 ? "Certificats" : "Certificat"}
                    </h4>
                    {selectedVariant.certificates.map((certificate, index) => (
                      <DatasheetLink
                        key={`certificate-${certificate.id}`}
                        url={certificate.url}
                        label={getDocumentLabel(
                          certificate,
                          "Certificat",
                          index,
                          selectedVariant.certificates.length,
                        )}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="rounded-[1.35rem] border border-white/10 bg-white/6 p-4">
                <MessageSquareText className="text-cobam-water-blue size-5" aria-hidden="true" />
                <h3 className="mt-3 font-semibold">Accompagnement COBAM</h3>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  Disponibilité, showroom et recommandations techniques a confirmer avec nos
                  équipes.
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

        <ProductCertificatesGrid certificates={selectedVariant.productCertificates} />

        {normalizedProduct.variants.length > 1 ? (
          <VariantRail
            selectedVariantId={selectedVariant.id}
            variants={normalizedProduct.variants}
            coverMedia={normalizedProduct.coverMedia}
            selectVariant={setSelectedVariantId}
          />
        ) : null}

        <RelatedProductsSection products={relatedProducts} />
      </article>
    </TooltipProvider>
  );
}
