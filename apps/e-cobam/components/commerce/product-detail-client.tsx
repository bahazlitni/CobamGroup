"use client";

import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";
import { Download, FileBadge, Minus, PackageCheck, Plus } from "lucide-react";
import type { CommerceProductDetail, CommerceVariant } from "@/lib/commerce";
import { formatPriceTnd } from "@/lib/format";
import { cn } from "@/lib/cn";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { RichText } from "@/components/commerce/rich-text";

function groupAttributes(attributes: CommerceVariant["attributes"]) {
  const groups = new Map<string, CommerceVariant["attributes"]>();

  for (const attribute of attributes) {
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

function MetaBlock({
  label,
  children,
  align = "left",
}: {
  label: string;
  children: ReactNode;
  align?: "left" | "right";
}) {
  return (
    <div className={cn("py-4", align === "right" && "sm:text-right")}>
      <p className="text-[0.68rem] font-black uppercase tracking-[0.24em] text-ec-muted">{label}</p>
      <div className="mt-2 text-base font-black text-ec-ink sm:text-lg">{children}</div>
    </div>
  );
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
        className="cursor-help truncate decoration-ec-blue/50 underline-offset-4 outline-none transition hover:text-ec-blue focus-visible:text-ec-blue focus-visible:underline"
      >
        {brand.name}
      </span>
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-0 z-30 mb-3 w-[min(22rem,80vw)] origin-bottom-left scale-95 rounded-2xl border border-ec-line bg-ec-ink px-4 py-3 text-sm font-semibold leading-6 text-white opacity-0 shadow-2xl shadow-ec-ink/20 transition duration-150 group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100"
      >
        {brand.description}
        <span className="absolute left-5 top-full size-3 -translate-y-1/2 rotate-45 border-b border-r border-ec-line bg-ec-ink" />
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
    "flex min-h-16 items-center gap-3 py-4 text-xs font-black uppercase tracking-[0.16em] transition sm:text-sm";

  if (!href) {
    return (
      <div className={cn(className, "text-ec-muted/60")}>
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
      className={cn(className, "text-ec-ink hover:text-ec-blue")}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}

export function ProductDetailClient({ product }: { product: CommerceProductDetail }) {
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id ?? null);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const selectedVariant =
    product.variants.find((variant) => variant.id === selectedVariantId) ?? product.variants[0];
  const images = selectedVariant.images.length > 0
    ? selectedVariant.images
    : product.coverImage
      ? [product.coverImage]
      : [];
  const activeImage = images.find((image) => image.id === selectedImageId) ?? images[0] ?? null;
  const groupedAttributes = useMemo(
    () => groupAttributes(selectedVariant.attributes),
    [selectedVariant.attributes],
  );
  const hasLowerContent =
    groupedAttributes.length > 0 || selectedVariant.summary || selectedVariant.description;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-ec-line bg-white shadow-[0_24px_80px_rgba(20,32,46,0.08)]">
        <div className="grid lg:grid-cols-[minmax(0,1.04fr)_minmax(25rem,0.96fr)]">
          <div className="border-b border-ec-line bg-[linear-gradient(135deg,#f7f7f7_0%,#eeeeee_55%,#ffffff_100%)] p-4 sm:p-6 lg:border-b-0 lg:border-r lg:p-7">
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-ec-muted">
                Galerie produit
              </p>
              <p className="rounded-full bg-white/70 px-3 py-1 text-xs font-black text-ec-muted">
                {images.length || 1} visuel{images.length > 1 ? "s" : ""}
              </p>
            </div>

            <div className="relative aspect-square overflow-hidden rounded-[1.75rem] border border-white/80 bg-white shadow-[inset_0_0_0_1px_rgba(20,32,46,0.04)]">
              <div className="pointer-events-none absolute inset-x-8 top-8 h-px bg-ec-line/70" />
              <div className="pointer-events-none absolute inset-y-8 left-8 w-px bg-ec-line/70" />
              {activeImage ? (
                <Image
                  src={activeImage.url}
                  alt={activeImage.altText ?? selectedVariant.displayName}
                  fill
                  sizes="(min-width: 1024px) 48vw, 100vw"
                  priority
                  className="object-contain p-8 sm:p-10 lg:p-12"
                />
              ) : (
                <div className="grid h-full place-items-center text-sm font-bold uppercase tracking-[0.28em] text-ec-muted/45">
                  COBAM
                </div>
              )}
            </div>

            {images.length > 1 ? (
              <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                {images.map((image) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedImageId(image.id)}
                    className={cn(
                      "relative aspect-square overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5",
                      activeImage?.id === image.id
                        ? "border-ec-blue ring-4 ring-ec-blue/10"
                        : "border-ec-line hover:border-ec-blue/40",
                    )}
                    aria-label={`Afficher ${image.title ?? selectedVariant.displayName}`}
                  >
                    <Image
                      src={image.thumbnailUrl ?? image.url}
                      alt={image.altText ?? selectedVariant.displayName}
                      fill
                      sizes="120px"
                      className="object-contain p-2"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <section className="p-5 sm:p-6 lg:p-7">
            <div className="border-b border-ec-line pb-6">
              <div className="flex flex-wrap gap-2">
                {product.categoryTrail.map((entry) => (
                  <Link
                    key={entry.slug}
                    href={`/catalogue?categorie=${entry.slug}`}
                    className="rounded-full bg-ec-stone px-3 py-1 text-xs font-black text-ec-muted transition hover:text-ec-ink"
                  >
                    {entry.name}
                  </Link>
                ))}
              </div>
              <h1 className="mt-5 text-3xl font-black leading-[0.98] tracking-tight text-ec-ink sm:text-5xl xl:text-[3.65rem]">
                {selectedVariant.displayName}
              </h1>

              {product.variants.length > 1 ? (
                <div className="mt-6">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-ec-muted">
                    Variantes
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => {
                          setSelectedVariantId(variant.id);
                          setSelectedImageId(null);
                        }}
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm font-semibold transition",
                          selectedVariant.id === variant.id
                            ? "border-ec-ink bg-ec-ink text-white"
                            : "border-ec-line bg-white text-ec-muted hover:border-ec-blue/40 hover:text-ec-ink",
                        )}
                      >
                        {variant.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="grid border-b border-ec-line sm:grid-cols-2 sm:divide-x sm:divide-ec-line">
              <MetaBlock label="SKU">{selectedVariant.sku}</MetaBlock>
              <MetaBlock label="Marque" align="right">
                <BrandValue brand={product.brand} />
              </MetaBlock>
            </div>

            <div className="border-b border-ec-line py-5">
              <div className="rounded-[1.5rem] bg-ec-ink p-5 text-white shadow-[0_18px_46px_rgba(20,32,46,0.16)]">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-white/55">
                      Prix TTC
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <p className="text-3xl font-black tracking-tight text-white">
                        {formatPriceTnd(selectedVariant.price) ?? "Sur devis"}
                      </p>
                      <StockBadge stock={selectedVariant.stock} />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                  <div className="flex h-12 items-center rounded-full border border-ec-line bg-ec-paper">
                    <button
                      type="button"
                      className="grid size-12 place-items-center text-ec-muted hover:text-ec-ink"
                      onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                      aria-label="Diminuer la quantité"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="min-w-8 text-center text-sm font-bold">{quantity}</span>
                    <button
                      type="button"
                      className="grid size-12 place-items-center text-ec-muted hover:text-ec-ink"
                      onClick={() => setQuantity((value) => value + 1)}
                      aria-label="Augmenter la quantité"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                  <AddToCartButton item={selectedVariant.addToCart} quantity={quantity} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 sm:divide-x sm:divide-ec-line">
              <DocumentAction
                href={selectedVariant.datasheet?.url ?? null}
                icon={<Download className="size-5 shrink-0 text-ec-blue" />}
                label="Fiche technique"
              />
              <div className="sm:pl-5">
                <DocumentAction
                  href={selectedVariant.certificate?.url ?? null}
                  icon={<FileBadge className="size-5 shrink-0 text-ec-blue" />}
                  label="Certificat"
                />
              </div>
            </div>
          </section>
        </div>
      </section>

      {hasLowerContent ? (
        <section className="overflow-hidden rounded-[2rem] border border-ec-line bg-white shadow-[0_18px_60px_rgba(20,32,46,0.045)]">
          {groupedAttributes.length > 0 ? (
            <div className="grid lg:grid-cols-[20rem_1fr]">
              <div className="border-b border-ec-line bg-ec-stone p-6 lg:border-b-0 lg:border-r lg:p-8">
                <p className="text-sm font-black uppercase tracking-[0.24em] text-ec-blue">
                  Attributs
                </p>
                <h2 className="mt-2 text-3xl font-black leading-tight tracking-tight text-ec-ink">
                  Spécifications
                </h2>
                <p className="mt-4 text-sm leading-7 text-ec-muted">
                  Les caractéristiques essentielles pour comparer, valider et préparer la commande.
                </p>
              </div>
              <div className="space-y-7 p-6 lg:p-8">
                {groupedAttributes.map((group) => (
                  <div key={group.name} className="border-t border-ec-line pt-5 first:border-t-0 first:pt-0">
                    <h3 className="font-black text-ec-ink">{group.name}</h3>
                    <dl className="mt-4 grid gap-x-6 gap-y-0 sm:grid-cols-2 xl:grid-cols-3">
                      {group.values.map((attribute) => (
                        <div
                          key={`${attribute.name}-${attribute.value}`}
                          className="border-b border-ec-line py-3"
                        >
                          <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-ec-muted">
                            {attribute.name}
                          </dt>
                          <dd className="mt-1 font-semibold text-ec-ink">
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

          {selectedVariant.summary || selectedVariant.description ? (
            <div className={cn("grid lg:grid-cols-[20rem_1fr]", groupedAttributes.length > 0 && "border-t border-ec-line")}>
              <div className="border-b border-ec-line bg-ec-stone p-6 lg:border-b-0 lg:border-r lg:p-8">
                <p className="text-sm font-black uppercase tracking-[0.24em] text-ec-blue">
                  Description
                </p>
                <h2 className="mt-2 text-3xl font-black leading-tight tracking-tight text-ec-ink">
                  Détails produit
                </h2>
              </div>
              <div className="max-w-5xl p-6 lg:p-8">
                {selectedVariant.description ? (
                  <RichText value={selectedVariant.description} />
                ) : (
                  <p className="leading-8 text-ec-muted">{selectedVariant.summary}</p>
                )}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
