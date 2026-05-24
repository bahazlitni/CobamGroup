"use client";

import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import { ChevronRight, Download, FileBadge, PackageCheck, PackageX, TriangleAlert } from "lucide-react";
import CopyButton from "@cobam/shared/ui/CopyButton";
import ImagePreviewCarousel from "@cobam/shared/ui/ImagePreviewCarousel";
import RailCarousel from "@cobam/shared/ui/RailCarousel";
import { toast } from "sonner";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ProductCard, type ProductCardProduct } from "@/components/commerce/product-card";
import { QuantityStepper } from "@/components/commerce/quantity-stepper";
import { RichText } from "@/components/commerce/rich-text";
import { FavoriteToggleButton } from "@/components/favorites/favorite-toggle-button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/cn";
import type { CommerceProductDetail, CommerceVariant } from "@/lib/commerce";
import { formatPriceTnd } from "@/lib/format";

function groupAttributes(attributes: CommerceVariant["attributes"]) {
  const groups = new Map<string, CommerceVariant["attributes"]>();

  for (const attribute of attributes) {
    if (attribute.specialType != null) {
      continue;
    }

    const key = attribute.groupName || "Caractéristiques";
    const list = groups.get(key) ?? [];
    list.push(attribute);
    groups.set(key, list);
  }

  return [...groups.entries()].map(([name, values]) => ({
    name,
    values: values.sort((a, b) => a.sortOrder - b.sortOrder),
  }));
}

function normalizeComparableValue(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeHexColor(value: string | null | undefined) {
  const trimmed = value?.trim().replace(/\s+/g, "");
  if (!trimmed) {
    return null;
  }

  const prefixed = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  if (!/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(prefixed)) {
    return null;
  }

  return prefixed
    .replace(
      /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i,
      (_, r: string, g: string, b: string) => `#${r}${r}${g}${g}${b}${b}`,
    )
    .toUpperCase();
}

function getSpecialAttribute(variant: CommerceVariant | null, specialType: "COLOR" | "FINISH") {
  const attribute = variant?.attributes.find((entry) => entry.specialType === specialType);
  if (!attribute) {
    return null;
  }

  return {
    key: normalizeComparableValue(attribute.value),
    label: attribute.value,
  };
}

function StockBadge({ stock }: { stock: CommerceVariant["stock"] }) {
  const Icon =
    stock.tone === "unavailable"
      ? PackageX
      : stock.tone === "warning"
        ? TriangleAlert
        : PackageCheck;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black",
        stock.tone === "available" && "bg-emerald-50 text-emerald-700",
        stock.tone === "warning" && "bg-amber-50 text-amber-700",
        stock.tone === "unavailable" && "bg-rose-50 text-rose-700",
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {stock.label}
    </span>
  );
}

function BrandValue({ brand }: { brand: CommerceProductDetail["brand"] }) {
  if (!brand) {
    return <span>COBAM</span>;
  }

  if (!brand.description) {
    return <span>{brand.name}</span>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="decoration-ec-blue/50 hover:text-ec-blue focus-visible:text-ec-blue max-w-full cursor-help truncate underline-offset-4 transition outline-none focus-visible:underline"
        >
          {brand.name}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="start" sideOffset={12}>
        {brand.description}
      </TooltipContent>
    </Tooltip>
  );
}

function DocumentAction({
  href,
  icon,
  label,
}: {
  href: string;
  icon: ReactNode;
  label: string;
}) {
  const className =
    "inline-flex min-h-10 items-center justify-center gap-2 rounded-full border px-3.5 text-xs font-black text-ec-muted transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ec-blue/25";

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        className,
        "border-ec-line/80 bg-white/60 hover:border-ec-blue/25 hover:bg-ec-blue/5 hover:text-ec-blue",
      )}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}

function PriceText({ value }: { value: string | null }) {
  const formatted = formatPriceTnd(value);

  if (!formatted) {
    return <span>Sur devis</span>;
  }

  const [amount, ...currencyParts] = formatted.split(/\s+/);
  const currency = currencyParts.join(" ");
  const decimalMatch = amount.match(/^(.+?)([,.]\d+)$/);

  return (
    <span>
      {decimalMatch ? (
        <>
          <span>{decimalMatch[1]}</span>
          <span className="align-baseline text-[0.52em] font-black tracking-tight">
            {decimalMatch[2]}
          </span>
        </>
      ) : (
        <span>{amount}</span>
      )}
      {currency ? (
        <span className="ml-2 align-baseline text-[0.52em] font-black tracking-normal">
          {currency}
        </span>
      ) : null}
    </span>
  );
}

function variantToProductCard(
  variant: CommerceVariant,
  product: CommerceProductDetail,
): ProductCardProduct {
  const image = variant.images[0] ?? product.coverImage ?? null;

  return {
    id: variant.id,
    entityType: "PRODUCT",
    sku: variant.sku,
    slug: variant.slug,
    href: `/produits/${variant.slug}`,
    name: variant.displayName,
    displayName: variant.displayName,
    brandName: product.brand?.name ?? null,
    categoryName: product.categoryTrail.at(-1)?.name ?? null,
    image: image
      ? {
          url: image.url,
          thumbnailUrl: image.thumbnailUrl,
          altText: image.altText ?? variant.displayName,
        }
      : null,
    price: variant.price,
    stock: variant.stock,
    addToCart: variant.addToCart,
  };
}

function SpecialAttributeBlobs({
  product,
  selectedVariant,
  onSelectVariant,
}: {
  product: CommerceProductDetail;
  selectedVariant: CommerceVariant;
  onSelectVariant: (variantId: number) => void;
}) {
  const selectedColor = getSpecialAttribute(selectedVariant, "COLOR");
  const selectedFinish = getSpecialAttribute(selectedVariant, "FINISH");
  const colorReferences = new Map(
    product.colorReferences.flatMap((reference) => [
      [normalizeComparableValue(reference.key), reference],
      [normalizeComparableValue(reference.label), reference],
    ]),
  );
  const finishReferences = new Map(
    product.finishReferences.flatMap((reference) => [
      [normalizeComparableValue(reference.key), reference],
      [normalizeComparableValue(reference.label), reference],
    ]),
  );
  const colorOptions = new Map<
    string,
    { key: string; label: string; hexValue: string | null; variantId: number }
  >();
  const finishOptions = new Map<
    string,
    {
      key: string;
      label: string;
      colorHex: string | null;
      imageUrl: string | null;
      variantId: number;
    }
  >();

  for (const variant of product.variants) {
    const color = getSpecialAttribute(variant, "COLOR");
    if (color && !colorOptions.has(color.key)) {
      const reference = colorReferences.get(color.key);
      colorOptions.set(color.key, {
        key: color.key,
        label: reference?.label ?? color.label,
        hexValue: reference?.hexValue ?? normalizeHexColor(color.label),
        variantId: variant.id,
      });
    }

    const finish = getSpecialAttribute(variant, "FINISH");
    if (finish && !finishOptions.has(finish.key)) {
      const reference = finishReferences.get(finish.key);
      finishOptions.set(finish.key, {
        key: finish.key,
        label: reference?.label ?? finish.label,
        colorHex: reference?.colorHex ?? normalizeHexColor(finish.label),
        imageUrl: reference?.imageUrl ?? null,
        variantId: variant.id,
      });
    }
  }

  function selectBySpecial(
    specialType: "COLOR" | "FINISH",
    key: string,
    fallbackVariantId: number,
  ) {
    const match = product.variants.find((variant) => {
      const candidate = getSpecialAttribute(variant, specialType);
      if (candidate?.key !== key) {
        return false;
      }

      if (specialType === "COLOR" && selectedFinish) {
        const finish = getSpecialAttribute(variant, "FINISH");
        return finish?.key === selectedFinish.key;
      }

      if (specialType === "FINISH" && selectedColor) {
        const color = getSpecialAttribute(variant, "COLOR");
        return color?.key === selectedColor.key;
      }

      return true;
    });

    onSelectVariant(match?.id ?? fallbackVariantId);
  }

  if (colorOptions.size === 0 && finishOptions.size === 0) {
    return null;
  }

  return (
    <div className="border-ec-line mt-6 flex flex-col gap-6 border-t pt-6">
      {colorOptions.size > 0 ? (
        <section className="min-w-0">
          <p className="text-ec-muted text-xs font-black tracking-[0.2em] uppercase">Couleurs</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[...colorOptions.values()].map((color) => {
              const isActive = selectedColor?.key === color.key;
              const resolvedHex = color.hexValue ?? "#14202e";

              return (
                <button
                  key={color.key}
                  type="button"
                  onClick={() => selectBySpecial("COLOR", color.key, color.variantId)}
                  className={cn(
                    "focus-visible:ring-ec-blue/35 rounded-full p-1 transition focus-visible:ring-2 focus-visible:outline-none",
                    isActive ? "bg-white shadow-[0_0_0_1px_rgba(20,32,46,0.12)]" : "hover:bg-white",
                  )}
                  title={color.label}
                  aria-label={`Choisir la couleur ${color.label}`}
                  aria-pressed={isActive}
                >
                  <span
                    className={cn(
                      "block size-9 rounded-full border transition sm:size-10",
                      isActive
                        ? "ring-ec-ink border-white ring-2 ring-offset-2 ring-offset-white"
                        : "border-ec-line hover:ring-ec-blue/20 hover:ring-2",
                    )}
                    style={{ backgroundColor: resolvedHex }}
                  />
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {finishOptions.size > 0 ? (
        <section className="min-w-0">
          <p className="text-ec-muted text-xs font-black tracking-[0.2em] uppercase">Finitions</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[...finishOptions.values()].map((finish) => {
              const isActive = selectedFinish?.key === finish.key;

              return (
                <button
                  key={finish.key}
                  type="button"
                  onClick={() => selectBySpecial("FINISH", finish.key, finish.variantId)}
                  className={cn(
                    "focus-visible:ring-ec-blue/35 rounded-full p-1 transition focus-visible:ring-2 focus-visible:outline-none",
                    isActive ? "bg-white shadow-[0_0_0_1px_rgba(20,32,46,0.12)]" : "hover:bg-white",
                  )}
                  title={finish.label}
                  aria-label={`Choisir la finition ${finish.label}`}
                  aria-pressed={isActive}
                >
                  <span
                    className={cn(
                      "relative block size-10 overflow-hidden rounded-full border bg-white transition",
                      isActive
                        ? "ring-ec-blue border-white ring-2 ring-offset-2 ring-offset-white"
                        : "border-ec-line hover:ring-ec-blue/20 hover:ring-2",
                    )}
                    style={{
                      backgroundColor: finish.imageUrl ? undefined : (finish.colorHex ?? "#14202e"),
                    }}
                  >
                    {finish.imageUrl ? (
                      <Image
                        src={finish.imageUrl}
                        alt={finish.label}
                        fill
                        sizes="40px"
                        unoptimized
                        className="object-cover"
                      />
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export function ProductDetailClient({ product }: { product: CommerceProductDetail }) {
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id ?? null);
  const [quantity, setQuantity] = useState(1);
  const selectedVariant =
    product.variants.find((variant) => variant.id === selectedVariantId) ?? product.variants[0];
  const images =
    selectedVariant.images.length > 0
      ? selectedVariant.images
      : product.coverImage
        ? [product.coverImage]
        : [];
  const previewImages = images.map((image) => ({
    id: image.id,
    url: image.url,
    thumbnailUrl: image.thumbnailUrl,
    altText: image.altText,
    title: image.title,
    mimeType: image.mimeType,
    kind: image.kind,
  }));
  const groupedAttributes = groupAttributes(selectedVariant.attributes);
  const favoriteItem = {
    id: selectedVariant.id,
    entityType: "PRODUCT",
    sku: selectedVariant.sku,
    name: selectedVariant.displayName,
    href: `/produits/${selectedVariant.slug}`,
    price: selectedVariant.price,
    imageUrl:
      selectedVariant.images[0]?.thumbnailUrl ??
      selectedVariant.images[0]?.url ??
      product.coverImage?.thumbnailUrl ??
      product.coverImage?.url ??
      null,
    brandName: product.brand?.name ?? null,
    categoryName: product.categoryTrail.at(-1)?.name ?? null,
  } as const;
  const hasLowerContent =
    groupedAttributes.length > 0 || selectedVariant.summary || selectedVariant.description;
  const hasDocuments = Boolean(selectedVariant.datasheet?.url || selectedVariant.certificate?.url);

  function selectVariant(variantId: number) {
    setSelectedVariantId(variantId);
  }

  return (
    <TooltipProvider>
    <div>
      <section className="mx-auto max-w-[74rem]">
        <nav
          aria-label="Fil d'Ariane"
          className="text-ec-muted mb-6 flex flex-wrap items-center gap-1.5 text-sm font-semibold"
        >
          <Link href="/" className="hover:text-ec-blue transition">
            Accueil
          </Link>
          <ChevronRight className="text-ec-muted/45 size-3.5" aria-hidden="true" />
          <Link href="/catalogue" className="hover:text-ec-blue transition">
            Tous les produits
          </Link>
          {product.categoryTrail.map((entry) => (
            <span key={entry.slug} className="inline-flex items-center gap-1.5">
              <ChevronRight className="text-ec-muted/45 size-3.5" aria-hidden="true" />
              <Link
                href={`/catalogue?categorie=${entry.slug}`}
                className="hover:text-ec-blue transition"
              >
                {entry.name}
              </Link>
            </span>
          ))}
        </nav>

        <div className="grid gap-6 lg:grid-cols-[minmax(19rem,30rem)_minmax(0,1fr)] lg:items-start lg:gap-8 xl:gap-12">
          <section className="order-1 min-w-0 lg:col-start-2 lg:row-start-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                <div className="inline-flex min-w-0 items-center gap-2">
                  <p className="text-ec-muted text-xs font-black tracking-[0.24em] uppercase">
                    SKU {selectedVariant.sku}
                  </p>
                  <CopyButton
                    value={selectedVariant.sku}
                    ariaLabel="Copier le SKU"
                    size="xs"
                    variant="light"
                    onCopy={() => toast.success("SKU copié.", { description: selectedVariant.sku })}
                    onError={() => toast.error("Impossible de copier le SKU.")}
                  />
                </div>
                <span className="bg-ec-line h-1 w-1 rounded-full" />
                <p className="text-ec-muted min-w-0 text-xs font-black tracking-[0.24em] uppercase">
                  <BrandValue brand={product.brand} />
                </p>
              </div>
              <div className="ml-auto shrink-0">
                <StockBadge stock={selectedVariant.stock} />
              </div>
            </div>

            <h1 className="text-ec-ink mt-4 text-3xl leading-[1.06] font-black tracking-tight text-balance sm:text-[2.45rem] xl:text-[3rem]">
              {selectedVariant.displayName}
            </h1>
          </section>

          <div className="order-2 space-y-3 lg:sticky lg:top-36 lg:col-start-1 lg:row-start-1 lg:row-span-5">
            <ImagePreviewCarousel
              key={`${selectedVariant.id}-${previewImages.map((image) => image.id).join("-")}`}
              items={previewImages}
              title={selectedVariant.displayName}
              size="xl"
              frameClassName="border-ec-line shadow-none"
              thumbnailClassName="focus-visible:ring-ec-blue/35"
              activeThumbnailClassName="border-ec-blue ring-ec-blue/10"
              inactiveThumbnailClassName="border-ec-line hover:border-ec-blue/40"
              emptyLabel="COBAM"
            />
          </div>

          <section className="order-3 min-w-0 lg:col-start-2 lg:row-start-2">
            <div className="border-ec-line rounded-[1.5rem] border bg-white p-5 sm:p-6">
              <div className="text-center">
                <div className="mx-auto w-fit">
                  <p className="text-ec-muted text-xs font-black tracking-[0.24em] uppercase">
                    Prix TTC
                  </p>
                  <p className="text-ec-ink mt-2 text-4xl leading-none font-black tracking-tight sm:text-5xl">
                    <PriceText value={selectedVariant.price} />
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-[9.5rem_minmax(0,1fr)_3.5rem] sm:items-start">
                <div className="mx-auto w-full max-w-[20rem] sm:mx-0 sm:max-w-none">
                  <QuantityStepper value={quantity} onChange={setQuantity} />
                </div>

                <div className="grid w-full grid-cols-[minmax(0,1fr)_3.5rem] gap-3 sm:contents">
                  <AddToCartButton
                    item={selectedVariant.addToCart}
                    quantity={quantity}
                    size="xl"
                    className="min-w-0 sm:w-full"
                    buttonClassName="h-14 w-full justify-center !rounded-full shadow-[0_18px_38px_rgba(20,32,46,0.16)] sm:w-full"
                  />

                  <FavoriteToggleButton
                    item={favoriteItem}
                    size="xl"
                    iconOnly
                    buttonClassName="h-14 w-14 !rounded-full shadow-sm"
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="order-4 min-w-0 lg:col-start-2 lg:row-start-3">
            <SpecialAttributeBlobs
              product={product}
              selectedVariant={selectedVariant}
              onSelectVariant={selectVariant}
            />
          </div>

          {hasDocuments ? (
            <div
              className={cn(
                "border-ec-line order-5 grid gap-3 border-t pt-5 lg:col-start-2 lg:row-start-4",
                selectedVariant.datasheet?.url && selectedVariant.certificate?.url
                  ? "sm:grid-cols-2"
                  : "grid-cols-1",
              )}
            >
              {selectedVariant.datasheet?.url ? (
                <DocumentAction
                  href={selectedVariant.datasheet.url}
                  icon={<Download className="text-ec-blue/70 size-4 shrink-0" />}
                  label="Fiche technique"
                />
              ) : null}
              {selectedVariant.certificate?.url ? (
                <DocumentAction
                  href={selectedVariant.certificate.url}
                  icon={<FileBadge className="text-ec-blue/70 size-4 shrink-0" />}
                  label="Certificat"
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      {product.variants.length > 1 ? (
        <section
          data-ecom-variants-rail
          className="border-ec-line mx-auto mt-12 max-w-[74rem] overflow-hidden border-t pt-9 sm:mt-14"
        >
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-ec-ink mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              Même gamme
            </h2>
            <p className="text-ec-muted text-sm font-semibold">
              {product.variants.length} référence{product.variants.length > 1 ? "s" : ""} à comparer
            </p>
          </div>

          <RailCarousel
            className="max-w-full overflow-hidden"
            showButtons="always"
            allowDrag
            applyPhysics
            scrollStep={300}
            viewportClassName="max-w-full overflow-hidden px-1 py-1"
            trackClassName="gap-3"
            itemClassName="flex w-[16rem] self-stretch sm:w-[17.5rem] lg:w-[18rem]"
            buttonClassName="shadow-none"
            previousButtonLabel="Variante précédente"
            nextButtonLabel="Variante suivante"
          >
            {product.variants.map((variant) => (
              <ProductCard
                key={variant.id}
                product={variantToProductCard(variant, product)}
                selected={variant.id === selectedVariant.id}
                onSelect={() => selectVariant(variant.id)}
                size="auto"
                flat
                showSelectedMarker={false}
                className="h-full w-full shadow-none hover:shadow-none"
              />
            ))}
          </RailCarousel>
        </section>
      ) : null}

      {hasLowerContent ? (
        <section className="border-ec-line mx-auto mt-14 max-w-[74rem] space-y-14 border-t pt-12 sm:mt-16 sm:pt-16">
          {selectedVariant.summary || selectedVariant.description ? (
            <div className="grid gap-8 lg:grid-cols-[17rem_1fr] xl:gap-14">
              <div>
                <h2 className="text-ec-ink mt-3 text-3xl leading-tight font-black tracking-tight">
                  Détails produit
                </h2>
              </div>
              <div className="max-w-4xl">
                {selectedVariant.description ? (
                  <RichText value={selectedVariant.description} />
                ) : (
                  <p className="text-ec-muted text-lg leading-9">{selectedVariant.summary}</p>
                )}
              </div>
            </div>
          ) : null}

          {groupedAttributes.length > 0 ? (
            <div className="border-ec-line grid gap-8 border-t pt-12 lg:grid-cols-[17rem_1fr] xl:gap-14">
              <div>
                <h2 className="text-ec-ink mt-3 text-3xl leading-tight font-black tracking-tight">
                  Spécifications
                </h2>
              </div>
              <div className="space-y-10">
                {groupedAttributes.map((group) => (
                  <div key={group.name}>
                    <h3 className="text-ec-ink text-lg font-black">{group.name}</h3>
                    <dl className="mt-4 grid gap-x-8 gap-y-0 sm:grid-cols-2 xl:grid-cols-3">
                      {group.values.map((attribute) => (
                        <div
                          key={`${attribute.name}-${attribute.value}`}
                          className="border-ec-line border-b py-4"
                        >
                          <dt className="text-ec-muted text-xs font-semibold tracking-[0.18em] uppercase">
                            {attribute.name}
                          </dt>
                          <dd className="text-ec-ink mt-2 font-semibold">
                            {attribute.value}
                            {attribute.unit ? ` ${attribute.unit}` : ""}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
    </TooltipProvider>
  );
}
