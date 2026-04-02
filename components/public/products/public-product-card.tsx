"use client";
import Image from "next/image";
import Link from "next/link";
import type { PublicProductSummary } from "@/features/products/public";

type PublicProductCardProps = {
  product: PublicProductSummary;
  href: string;
};

function formatPrice(price: string | null) {
  if (!price) return null;
  return price;
}

export default function ProductCard({
  product,
  href = `/produits/${product.slug}`,
}: PublicProductCardProps) {
  const imageSrc = product.imageThumbnailUrl || product.imageUrl || null;
  const price = formatPrice(product.price);

  return (
    <Link
      href={href}
      className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`Voir le produit ${product.name}`}
    >
      <article
        className="
          flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-border
          bg-card text-card-foreground shadow-[0_5px_10px_rgba(20,32,46,0.06)]
          transition-all duration-300
          group-hover:-translate-y-1 group-hover:shadow-[0_10px_20px_rgba(20,32,46,0.12)]
        "
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.imageAlt || product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary text-sm text-muted-foreground">
              Image indisponible
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
          {/* Top row */}
          <div className="flex items-start justify-between gap-3">
            {product.brandName && (
              <span
                className="
                  inline-flex max-w-fit items-center rounded-full border border-cyan-100
                  bg-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]
                  text-cobam-water-blue
                "
              >
                {product.brandName}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h3 className="line-clamp-2 text-lg font-semibold tracking-tight text-cobam-dark-blue sm:text-xl">
              {product.name}
            </h3>

            {product.subtitle && (
              <p className="line-clamp-2 text-sm font-medium text-cobam-water-blue">
                {product.subtitle}
              </p>
            )}

            {product.description && (
              <p className="line-clamp-2 text-sm leading-4 text-muted-foreground">
                {product.description}
              </p>
            )}
          </div>

          {/* Price (moved here) */}
          {price && (
            <div className="pt-1">
              <span className="text-base font-semibold text-cobam-dark-blue">
                {price} DT
              </span>
            </div>
          )}

          {/* CTA */}
          <div className="mt-auto flex items-center justify-between pt-2">
            <span className="text-sm font-medium text-foreground transition-colors group-hover:text-cobam-water-blue">
              Voir le produit
            </span>

            <span
              className="
                inline-flex h-10 w-10 items-center justify-center rounded-full border border-border
                bg-background text-cobam-dark-blue transition-all duration-300
                group-hover:border-cobam-water-blue group-hover:bg-cobam-water-blue
                group-hover:text-white
              "
              aria-hidden="true"
            >
              →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}