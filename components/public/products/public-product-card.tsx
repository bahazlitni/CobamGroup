"use client";
import Image from "next/image";
import Link from "next/link";
import type { PublicProductSummary } from "@/features/products/public";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import { normalizeThemeColor, withThemeAlpha } from "@/lib/theme-color";

type PublicProductCardProps = {
  product: PublicProductSummary;
  href: string;
  themeColor?: string | null;
};

function formatPrice(price: string | null) {
  if (!price) return null;
  return price;
}

export default function ProductCard({
  product,
  href = `/produits/${product.slug}`,
  themeColor,
}: PublicProductCardProps) {
  const imageSrc = product.imageThumbnailUrl || product.imageUrl || null;
  const price = formatPrice(product.price);
  const resolvedThemeColor = normalizeThemeColor(themeColor);

  return (
    <Link
      href={href}
      className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`Voir le produit ${product.name}`}
    >
      <article
        className="
          flex h-full flex-col overflow-hidden rounded-3xl border border-cobam-quill-grey/30 bg-white
          transition-all duration-500 hover:shadow-[0_20px_40px_rgba(20,32,46,0.06)] group-hover:-translate-y-1
        "
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-50">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.imageAlt || product.name}
              fill
              className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-[1.08]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary text-sm text-muted-foreground">
              Image indisponible
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-4 p-6 sm:p-7">
          {/* Top row */}
          <div className="flex items-start justify-between gap-3">
            {product.brandName && (
              <span
                className="
                  inline-flex max-w-fit items-center rounded-full border px-3 py-1 text-[10px]
                  font-semibold uppercase tracking-[0.22em]
                "
                style={{
                  borderColor: withThemeAlpha(resolvedThemeColor, 0.18),
                  backgroundColor: withThemeAlpha(resolvedThemeColor, 0.1),
                  color: resolvedThemeColor,
                }}
              >
                {product.brandName}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="space-y-3 pb-3">
            <h3
              className="line-clamp-2 text-2xl font-light leading-tight text-[#14202e] transition-colors"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {product.name}
            </h3>

            {product.subtitle && (
              <p
                className="line-clamp-2 text-sm font-medium"
                style={{ color: resolvedThemeColor || "#5e5e5e" }}
              >
                {product.subtitle}
              </p>
            )}

            {product.description && (
              <p className="line-clamp-2 text-sm leading-4 text-muted-foreground">
                {product.description}
              </p>
            )}
          </div>

          {/* Price */}
          {price && (
            <div className="pt-1">
              <span className="text-lg font-medium text-[#14202e]">
                {price} TND
              </span>
            </div>
          )}

          {/* CTA */}
          <div className="mt-auto flex items-center justify-between pt-2">
            <span
              className="text-xs font-bold uppercase tracking-[0.1em] transition-colors"
              style={{ color: resolvedThemeColor || "#14202e" }}
            >
              Plus de details
            </span>

            <AnimatedUIButton
              variant="secondary"
              size="sm"
              className="rounded-full"
              icon="chevron-right"
              aria-hidden="true"
            />
          </div>
        </div>
      </article>
    </Link>
  );
}
