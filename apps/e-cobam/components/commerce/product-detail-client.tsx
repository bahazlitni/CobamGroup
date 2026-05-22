"use client";

import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";
import { ChevronRight, Download, FileBadge, Minus, PackageCheck, Plus } from "lucide-react";
import RailCarousel from "@cobam/shared/ui/RailCarousel";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { RichText } from "@/components/commerce/rich-text";
import { FavoriteToggleButton } from "@/components/favorites/favorite-toggle-button";
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
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black",
        stock.tone === "available" && "bg-emerald-50 text-emerald-700",
        stock.tone === "warning" && "bg-amber-50 text-amber-700",
        stock.tone === "unavailable" && "bg-rose-50 text-rose-700",
      )}
    >
      <PackageCheck className="size-3.5" />
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

  const tooltipId = `brand-description-${brand.slug}`;

  return (
    <span className="group relative inline-flex max-w-full">
      <span
        tabIndex={0}
        aria-describedby={tooltipId}
        className="decoration-ec-blue/50 hover:text-ec-blue focus-visible:text-ec-blue cursor-help truncate underline-offset-4 transition outline-none focus-visible:underline"
      >
        {brand.name}
      </span>
      <span
        id={tooltipId}
        role="tooltip"
        className="border-ec-line bg-ec-ink shadow-ec-ink/20 pointer-events-none absolute bottom-full left-0 z-30 mb-3 w-[min(22rem,80vw)] origin-bottom-left scale-95 rounded-2xl border px-4 py-3 text-sm leading-6 font-semibold text-white opacity-0 shadow-2xl transition duration-150 group-focus-within:scale-100 group-focus-within:opacity-100 group-hover:scale-100 group-hover:opacity-100"
      >
        {brand.description}
        <span className="border-ec-line bg-ec-ink absolute top-full left-5 size-3 -translate-y-1/2 rotate-45 border-r border-b" />
      </span>
    </span>
  );
}

function DocumentAction({
  href,
  icon,
  label,
}: {
  href: string | null;
  icon: ReactNode;
  label: string;
}) {
  const className =
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ec-blue/35";

  if (!href) {
    return (
      <div className={cn(className, "border-ec-line bg-ec-stone text-ec-muted/60")}>
        {icon}
        <span>{label} indisponible</span>
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        className,
        "border-ec-line text-ec-ink hover:border-ec-blue/30 hover:text-ec-blue bg-white shadow-sm",
      )}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
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
    <div className="border-ec-line mt-6 flex flex-col gap-5 border-t pt-6 sm:flex-row sm:flex-wrap">
      {colorOptions.size > 0 ? (
        <section className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="text-ec-muted text-xs font-black tracking-[0.2em] uppercase">Couleurs</p>
            <p className="text-ec-muted text-xs font-semibold">
              {colorOptions.size} teinte{colorOptions.size > 1 ? "s" : ""}
            </p>
          </div>
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
        <section className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="text-ec-muted text-xs font-black tracking-[0.2em] uppercase">Finitions</p>
            <p className="text-ec-muted text-xs font-semibold">
              {finishOptions.size} finition{finishOptions.size > 1 ? "s" : ""}
            </p>
          </div>
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

function VariantCard({
  variant,
  selected,
  onSelect,
}: {
  variant: CommerceVariant;
  selected: boolean;
  onSelect: () => void;
}) {
  const image = variant.images[0] ?? null;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex h-full w-full flex-col overflow-hidden rounded-[1rem] border bg-white text-left transition",
        "hover:border-ec-blue/35 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(20,32,46,0.075)]",
        selected ? "border-ec-blue ring-ec-blue/10 ring-4" : "border-ec-line",
      )}
      aria-pressed={selected}
    >
      <div className="border-ec-line relative aspect-square border-b bg-white">
        {image ? (
          <Image
            src={image.thumbnailUrl ?? image.url}
            alt={image.altText ?? variant.displayName}
            fill
            sizes="220px"
            unoptimized
            className="object-contain p-4 transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="text-ec-muted/45 grid h-full place-items-center text-[0.65rem] font-black tracking-[0.2em]">
            COBAM
          </span>
        )}
        <span
          className={cn(
            "absolute top-3 right-3 size-3 rounded-full ring-4 ring-white",
            selected ? "bg-ec-blue" : "bg-ec-line group-hover:bg-ec-blue/45",
          )}
        />
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <p className="text-ec-muted text-[0.68rem] font-black tracking-[0.2em] uppercase">
          {variant.sku}
        </p>
        <h3 className="text-ec-ink mt-2 line-clamp-2 text-sm leading-5 font-black text-balance">
          {variant.name}
        </h3>
        <div className="mt-auto space-y-2 pt-4">
          <p className="text-ec-ink text-lg font-black tracking-tight">
            {formatPriceTnd(variant.price) ?? "Sur devis"}
          </p>
          <StockBadge stock={variant.stock} />
        </div>
      </div>
    </button>
  );
}

export function ProductDetailClient({ product }: { product: CommerceProductDetail }) {
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id ?? null);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const selectedVariant =
    product.variants.find((variant) => variant.id === selectedVariantId) ?? product.variants[0];
  const images =
    selectedVariant.images.length > 0
      ? selectedVariant.images
      : product.coverImage
        ? [product.coverImage]
        : [];
  const activeImage = images.find((image) => image.id === selectedImageId) ?? images[0] ?? null;
  const groupedAttributes = useMemo(
    () => groupAttributes(selectedVariant.attributes),
    [selectedVariant.attributes],
  );
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

  function selectVariant(variantId: number) {
    setSelectedVariantId(variantId);
    setSelectedImageId(null);
  }

  return (
    <div>
      <section className="mx-auto max-w-[70rem]">
        <header>
          <nav
            aria-label="Fil d'Ariane"
            className="text-ec-muted flex flex-wrap items-center gap-1.5 text-sm font-semibold"
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

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <p className="text-ec-muted text-xs font-black tracking-[0.24em] uppercase">
              SKU {selectedVariant.sku}
            </p>
            <span className="bg-ec-line h-1 w-1 rounded-full" />
            <p className="text-ec-muted text-xs font-black tracking-[0.24em] uppercase">
              <BrandValue brand={product.brand} />
            </p>
          </div>

          <h1 className="text-ec-ink mt-4 max-w-[62rem] text-3xl leading-[1.08] font-black tracking-tight text-balance sm:text-[2.5rem] xl:text-[3rem]">
            {selectedVariant.displayName}
          </h1>

          <SpecialAttributeBlobs
            product={product}
            selectedVariant={selectedVariant}
            onSelectVariant={selectVariant}
          />
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(20rem,30rem)_minmax(0,1fr)] lg:items-start xl:gap-12">
          <div className="space-y-3">
            <div className="border-ec-line relative aspect-square overflow-hidden rounded-[1.35rem] border bg-white">
              {activeImage ? (
                <Image
                  src={activeImage.url}
                  alt={activeImage.altText ?? selectedVariant.displayName}
                  fill
                  sizes="(min-width: 1024px) 30rem, 100vw"
                  priority
                  unoptimized
                  className="object-contain p-6 sm:p-8"
                />
              ) : (
                <div className="text-ec-muted/45 relative grid h-full place-items-center text-sm font-bold tracking-[0.28em] uppercase">
                  COBAM
                </div>
              )}
            </div>

            {images.length > 1 ? (
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
                {images.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedImageId(image.id)}
                    className={cn(
                      "hover:border-ec-blue/40 relative aspect-square overflow-hidden rounded-xl border bg-white transition",
                      activeImage?.id === image.id
                        ? "border-ec-blue ring-ec-blue/10 ring-4"
                        : "border-ec-line",
                    )}
                    aria-label={`Afficher ${image.title ?? selectedVariant.displayName}`}
                  >
                    <Image
                      src={image.thumbnailUrl ?? image.url}
                      alt={image.altText ?? selectedVariant.displayName}
                      fill
                      sizes="96px"
                      unoptimized
                      className="object-contain p-2"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <aside className="border-ec-line rounded-[1.6rem] border bg-white p-5 shadow-[0_22px_70px_rgba(20,32,46,0.06)] sm:p-6">
            <div className="text-center">
              <div className="mx-auto w-fit">
                <p className="text-ec-muted text-xs font-black tracking-[0.24em] uppercase">
                  Prix TTC
                </p>
                <p className="text-ec-ink mt-2 text-4xl leading-none font-black tracking-tight sm:text-5xl">
                  {formatPriceTnd(selectedVariant.price) ?? "Sur devis"}
                </p>
              </div>
              <div className="mt-4 flex justify-center">
                <StockBadge stock={selectedVariant.stock} />
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-[9.5rem_minmax(0,1fr)_3.5rem] sm:items-start">
              <div className="border-ec-line flex h-14 w-full items-center justify-between rounded-full border bg-white shadow-sm">
                <button
                  type="button"
                  className="text-ec-muted hover:text-ec-ink grid size-14 place-items-center transition"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  aria-label="Diminuer la quantité"
                >
                  <Minus className="size-4" />
                </button>
                <span className="min-w-8 text-center text-sm font-black">{quantity}</span>
                <button
                  type="button"
                  className="text-ec-muted hover:text-ec-ink grid size-14 place-items-center transition"
                  onClick={() => setQuantity((value) => value + 1)}
                  aria-label="Augmenter la quantité"
                >
                  <Plus className="size-4" />
                </button>
              </div>

              <AddToCartButton
                item={selectedVariant.addToCart}
                quantity={quantity}
                className="[&>button]:!h-14 [&>button]:!w-full"
              />

              <FavoriteToggleButton
                item={favoriteItem}
                className="h-14 w-full px-0 shadow-sm sm:w-14"
              />
            </div>

            <div className="border-ec-line mt-6 grid gap-3 border-t pt-6 sm:grid-cols-2">
              <DocumentAction
                href={selectedVariant.datasheet?.url ?? null}
                icon={<Download className="text-ec-blue size-4 shrink-0" />}
                label="Fiche technique"
              />
              <DocumentAction
                href={selectedVariant.certificate?.url ?? null}
                icon={<FileBadge className="text-ec-blue size-4 shrink-0" />}
                label="Certificat"
              />
            </div>
          </aside>
        </div>
      </section>

      {product.variants.length > 0 ? (
        <section
          data-ecom-variants-rail
          className="border-ec-line mx-auto mt-12 max-w-[70rem] overflow-hidden border-t pt-9 sm:mt-14"
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
            scrollStep={240}
            viewportClassName="max-w-full overflow-hidden px-1 py-1"
            trackClassName="gap-3"
            itemClassName="w-[13.5rem] sm:w-[14.5rem]"
            previousButtonLabel="Variante précédente"
            nextButtonLabel="Variante suivante"
          >
            {product.variants.map((variant) => (
              <VariantCard
                key={variant.id}
                variant={variant}
                selected={variant.id === selectedVariant.id}
                onSelect={() => selectVariant(variant.id)}
              />
            ))}
          </RailCarousel>
        </section>
      ) : null}

      {hasLowerContent ? (
        <section className="border-ec-line mx-auto mt-14 max-w-[70rem] space-y-14 border-t pt-12 sm:mt-16 sm:pt-16">
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
  );
}
