"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Download, FileBadge, Minus, Plus, ShieldCheck } from "lucide-react";
import type { CommerceProductDetail, CommerceVariant } from "@/lib/commerce";
import { formatPriceTnd } from "@/lib/format";
import { cn } from "@/lib/cn";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { RichText } from "@/components/commerce/rich-text";

function groupAttributes(attributes: CommerceVariant["attributes"]) {
  const groups = new Map<string, CommerceVariant["attributes"]>();

  for (const attribute of attributes) {
    if (attribute.specialType) {
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

function specialAttribute(variant: CommerceVariant, type: "COLOR" | "FINISH") {
  return variant.attributes.find((attribute) => attribute.specialType === type) ?? null;
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
  const selectedColor = specialAttribute(selectedVariant, "COLOR");
  const selectedFinish = specialAttribute(selectedVariant, "FINISH");

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
      <section className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-ec-line bg-white">
          {activeImage ? (
            <Image
              src={activeImage.url}
              alt={activeImage.altText ?? selectedVariant.displayName}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
              className="object-contain p-8"
            />
          ) : (
            <div className="grid h-full place-items-center text-sm font-bold uppercase tracking-[0.28em] text-ec-muted/45">
              COBAM
            </div>
          )}
        </div>

        {images.length > 1 ? (
          <div className="grid grid-cols-5 gap-3">
            {images.map((image) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setSelectedImageId(image.id)}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-2xl border bg-white transition",
                  activeImage?.id === image.id ? "border-ec-blue" : "border-ec-line hover:border-ec-blue/40",
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
      </section>

      <section className="space-y-8">
        <div>
          <div className="flex flex-wrap gap-2">
            {product.categoryTrail.map((entry) => (
              <Link
                key={entry.slug}
                href={`/catalogue?categorie=${entry.slug}`}
                className="rounded-full bg-ec-stone px-3 py-1 text-xs font-semibold text-ec-muted transition hover:text-ec-ink"
              >
                {entry.name}
              </Link>
            ))}
          </div>
          <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-ec-ink sm:text-6xl">
            {selectedVariant.displayName}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ec-muted">
              SKU <span className="ml-2 tracking-normal text-ec-blue">{selectedVariant.sku}</span>
            </p>
            {product.brand ? (
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ec-muted">
                Marque <span className="ml-2 tracking-normal text-ec-ink">{product.brand.name}</span>
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-ec-line bg-white p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-ec-muted">Prix TTC</p>
              <p className="mt-1 text-3xl font-black text-ec-ink">
                {formatPriceTnd(selectedVariant.price) ?? "Sur devis"}
              </p>
              <p
                className={cn(
                  "mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                  selectedVariant.stock.tone === "available" && "bg-emerald-50 text-emerald-700",
                  selectedVariant.stock.tone === "warning" && "bg-amber-50 text-amber-700",
                  selectedVariant.stock.tone === "unavailable" && "bg-rose-50 text-rose-700",
                )}
              >
                {selectedVariant.stock.label}
              </p>
            </div>

            <div className="flex items-center gap-3">
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

        {product.variants.length > 1 ? (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-ec-muted">
              Variantes
            </h2>
            <div className="flex flex-wrap gap-2">
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

        {selectedColor || selectedFinish ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {selectedColor ? (
              <div className="rounded-[1.25rem] border border-ec-line bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ec-muted">
                  Couleur
                </p>
                <p className="mt-2 font-semibold text-ec-ink">{selectedColor.value}</p>
              </div>
            ) : null}
            {selectedFinish ? (
              <div className="rounded-[1.25rem] border border-ec-line bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ec-muted">
                  Finition
                </p>
                <p className="mt-2 font-semibold text-ec-ink">{selectedFinish.value}</p>
              </div>
            ) : null}
          </div>
        ) : null}

        {selectedVariant.summary || selectedVariant.description ? (
          <div className="rounded-[1.5rem] border border-ec-line bg-white p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-ec-muted">
              Description
            </h2>
            <div className="mt-5">
              {selectedVariant.description ? (
                <RichText value={selectedVariant.description} />
              ) : (
                <p className="leading-8 text-ec-muted">{selectedVariant.summary}</p>
              )}
            </div>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-3">
          {selectedVariant.datasheet ? (
            <a
              href={selectedVariant.datasheet.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-[1.25rem] border border-ec-line bg-white p-4 text-sm font-semibold text-ec-ink transition hover:border-ec-blue/40"
            >
              <Download className="size-5 text-ec-blue" />
              Fiche technique
            </a>
          ) : null}
          {selectedVariant.certificate ? (
            <a
              href={selectedVariant.certificate.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-[1.25rem] border border-ec-line bg-white p-4 text-sm font-semibold text-ec-ink transition hover:border-ec-blue/40"
            >
              <FileBadge className="size-5 text-ec-blue" />
              Certificat
            </a>
          ) : null}
          <div className="flex items-center gap-3 rounded-[1.25rem] border border-ec-line bg-white p-4 text-sm font-semibold text-ec-ink">
            <ShieldCheck className="size-5 text-ec-blue" />
            Conseil COBAM
          </div>
        </div>

        {groupedAttributes.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-ec-muted">
              Spécifications
            </h2>
            {groupedAttributes.map((group) => (
              <div key={group.name} className="rounded-[1.5rem] border border-ec-line bg-white p-5">
                <h3 className="font-semibold text-ec-ink">{group.name}</h3>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  {group.values.map((attribute) => (
                    <div
                      key={`${attribute.name}-${attribute.value}`}
                      className="rounded-2xl bg-ec-paper px-4 py-3"
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
        ) : null}
      </section>
    </div>
  );
}
