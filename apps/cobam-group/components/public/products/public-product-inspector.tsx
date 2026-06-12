"use client";

import Link from "next/link";
import Image from "next/image";
import { type ReactNode, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
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
  type DerivedColorOption,
  type DerivedFinishOption,
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
import ProductDevisDialog from "./inspector/ProductDevisDialog";
import BrandTooltip from "./inspector/BrandTooltip";
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
import DownloadsSectionBody from "./inspector/DownloadsSectionBody";
import SectionTitle from "./inspector/SectionTitle";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { resolveColorHex } from "@/lib/color-values";
import { getPublicRichTextPlainText } from "@cobam/shared/ui/PublicRichText";

type DetailRow = {
  label: string;
  value: ReactNode;
  valueKey?: string;
  tone?: "default" | "positive" | "muted";
};

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

function InlineColorValue({
  option,
  code,
}: {
  option: DerivedColorOption;
  code?: string | null;
}) {
  const resolvedHex =
    option.reference?.hexValue ?? resolveColorHex(option.label) ?? resolveColorHex(option.key);
  const label = `${option.label}${code ? ` - Code ${code}` : ""}`;

  return (
    <span className="text-cobam-dark-blue inline-flex items-center gap-2 font-semibold">
      <span
        className="block size-4 shrink-0 rounded-full border border-slate-300 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55)]"
        style={{ backgroundColor: resolvedHex ?? "#0f172a" }}
        aria-hidden="true"
      />
      <span>{label}</span>
    </span>
  );
}

function InlineFinishValue({ option }: { option: DerivedFinishOption }) {
  return (
    <span className="text-cobam-dark-blue inline-flex items-center gap-2 font-semibold">
      <span className="relative block size-5 shrink-0 overflow-hidden rounded-full border border-slate-300 bg-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.55)]">
        {option.imageUrl ? (
          <Image
            src={option.imageUrl}
            alt=""
            fill
            sizes="20px"
            className="object-cover"
            aria-hidden="true"
          />
        ) : (
          <span
            className="block size-full"
            style={{ backgroundColor: option.colorHex ?? "#0f172a" }}
            aria-hidden="true"
          />
        )}
      </span>
      <span>{option.label}</span>
    </span>
  );
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
    <dl className="divide-cobam-quill-grey/30 divide-y">
      {rows.map((row, index) => (
        <div
          key={row.valueKey ?? `${row.label}-${index}`}
          className="grid gap-2 py-3 sm:grid-cols-[15rem_1fr] sm:px-5"
        >
          <dt className="text-sm font-semibold text-slate-400">
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
    <section className="space-y-2">
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
    <section className="border-cobam-quill-grey/35 space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-slate-400 uppercase">
            Explorer
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
  const singleColorOption = colorOptions.length === 1 ? colorOptions[0] : null;
  const singleFinishOption = finishOptions.length === 1 ? finishOptions[0] : null;
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
  const descriptionTextLength = getPublicRichTextPlainText(selectedVariant.description).length;
  const hasDescription = Boolean(selectedVariant.description && descriptionTextLength > 0);
  const displayTitle = buildProductTitle({
    displayName: selectedVariant.displayName,
    brandName,
    colorLabel: selectedColor?.label ?? null,
    productUse,
  });
  const summaryRowCandidates: Array<DetailRow | null> = [
    productUse ? { label: "Type de produit", value: productUse } : null,
    singleColorOption
      ? {
          label: "Couleur",
          value: <InlineColorValue option={singleColorOption} code={colorCodeAttr?.value} />,
          valueKey: `single-color-${singleColorOption.key}`,
        }
      : selectedColor?.label
      ? {
          label: "Couleur",
          value: `${selectedColor.label}${colorCodeAttr?.value ? ` - Code ${colorCodeAttr.value}` : ""}`,
        }
      : null,
    singleFinishOption
      ? {
          label: "Finition",
          value: <InlineFinishValue option={singleFinishOption} />,
          valueKey: `single-finish-${singleFinishOption.key}`,
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
  ];
  const summaryRows = summaryRowCandidates.filter((row): row is DetailRow => row != null);

  const technicalRowCandidates: Array<DetailRow | null> = [
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
  ];
  const technicalRows = technicalRowCandidates.filter((row): row is DetailRow => row != null);

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
        <section className="grid gap-10 lg:grid-cols-[minmax(22rem,0.92fr)_minmax(0,1.08fr)] lg:items-start">
          <Carousel
            key={`${selectedVariant.id}-${selectedMedia.map((media) => media.id).join("-")}`}
            media={selectedMedia}
            title={selectedVariant.displayName}
          />

          <div className="space-y-7">
            <header>
              <CatalogBreadcrumbs subcategories={normalizedProduct.subcategories} />
              
              <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-3">
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


              <h1 className="mt-5 text-cobam-dark-blue max-w-4xl text-4xl font-semibold tracking-[-0.055em] sm:text-5xl lg:text-[4rem] lg:leading-[0.95]">
                {displayTitle}
              </h1>
              {colorOptions.length > 1 ? (
                <ColorsList
                  activeKey={selectedColor?.key}
                  colors={colorOptions}
                  colorCodesByKey={colorCodesByKey}
                  onSelect={handleColorSelect}
                />
              ) : null}

              {finishOptions.length > 1 ? (
                <FinishesList
                  activeKey={selectedFinishKey ?? undefined}
                  finishes={finishOptions}
                  onSelect={handleFinishSelect}
                /> 
              ) : null}


              <div className="mt-8 flex flex-wrap items-center gap-3">
                <ProductDevisDialog
                  productName={selectedVariant.displayName}
                  sku={selectedVariant.sku}
                  triggerLabel="Demander un devis"
                />
                <AnimatedUIButton
                  size="lg"
                  variant="outline"
                  type="button"
                  href="/contact"
                  icon="phone"
                >
                  Contacter un conseiller
                </AnimatedUIButton>
              </div>

              <div className="mt-8 max-w-3xl text-base leading-7">
                <RichDescription
                  description={selectedVariant.description}
                  collapseAfter={null}
                />
              </div>
            </header>

            <div className="space-y-5">
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
          </div>
        </section>

        {technicalRows.length > 0 ? (
          <section className="border-cobam-quill-grey/35 rounded-[2rem] border bg-white p-5 sm:p-7">
            <SectionTitle title="Caractéristiques techniques"/>
            <div className="mt-5">
              <TechnicalRows rows={technicalRows} />
            </div>
          </section>
        ) : null}

        {selectedVariant.datasheets.length > 0 || selectedVariant.certificates.length > 0 ? (
          <section className="border-cobam-quill-grey/35 rounded-[2rem] border bg-white p-5 sm:p-7">
            <SectionTitle title="Téléchargements"/>
            <div className="mt-5 max-w-none">
              <DownloadsSectionBody datasheets={selectedVariant.datasheets} certificates={selectedVariant.certificates} />
            </div>
          </section>
        ) : null}

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
