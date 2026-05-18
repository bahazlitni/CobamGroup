import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, BadgeCheck, ClipboardList, PackageSearch } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import type { LandingCategory, LandingProduct } from "@/lib/home-data";
import { formatCompactNumber, formatPriceTnd } from "@/lib/format";

function MailCta({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <a
      href="mailto:contact@cobamgroup.com?subject=Demande%20de%20devis%20e-cobam"
      className={`inline-flex h-14 items-center justify-center gap-2 rounded-full border border-ec-ink/15 bg-white px-6 text-base font-semibold text-ec-ink transition-all duration-200 hover:border-ec-blue/40 hover:bg-ec-blue/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ec-blue ${className}`}
    >
      {children}
    </a>
  );
}

export function HeroSection({
  heroProduct,
  productCount,
  categories,
}: {
  heroProduct: LandingProduct | null;
  productCount: number | null;
  categories: LandingCategory[];
}) {
  const heroImage = heroProduct?.image?.url ?? heroProduct?.image?.thumbnailUrl ?? null;
  const price = formatPriceTnd(heroProduct?.price);

  return (
    <section className="relative overflow-hidden border-b border-ec-line bg-ec-paper">
      <div className="commerce-container grid min-h-[calc(100svh-5rem)] gap-10 py-10 sm:py-14 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-ec-line bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ec-blue shadow-sm">
            <BadgeCheck className="size-4" />
            Boutique connectée au catalogue COBAM GROUP
          </div>

          <h1 className="mt-7 text-5xl font-black leading-[0.96] tracking-tight text-ec-ink sm:text-6xl lg:text-7xl">
            Les matériaux justes, plus faciles à choisir.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-ec-muted">
            Revêtements, robinetterie, sanitaires, étanchéité, peinture et matériaux de chantier :
            e-cobam vous aide à trouver les bonnes références, comparer les options et préparer un
            devis fiable.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/catalogue" size="lg" icon={<ArrowRight className="size-5" />}>
              Explorer le catalogue
            </ButtonLink>
            <MailCta>
              Demander un devis
              <ClipboardList className="size-5" />
            </MailCta>
          </div>

          <div className="mt-9 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-ec-line bg-white/78 p-5 shadow-sm">
              <p className="text-3xl font-black text-ec-ink">
                {productCount == null ? "400+" : formatCompactNumber(productCount)}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-ec-muted">
                références
              </p>
            </div>
            <div className="rounded-3xl border border-ec-line bg-white/78 p-5 shadow-sm">
              <p className="text-3xl font-black text-ec-ink">{formatCompactNumber(categories.length)}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-ec-muted">
                catégories
              </p>
            </div>
            <div className="rounded-3xl border border-ec-line bg-white/78 p-5 shadow-sm">
              <p className="text-3xl font-black text-ec-ink">Devis</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-ec-muted">
                accompagnés
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-[2rem] border border-white bg-white p-4 shadow-[0_30px_90px_rgba(16,32,47,0.16)]">
            <div className="relative aspect-[4/4.15] overflow-hidden rounded-[1.55rem] bg-white">
              {heroImage ? (
                <Image
                  src={heroImage}
                  alt={heroProduct?.image?.altText ?? heroProduct?.name ?? "Produit COBAM"}
                  fill
                  sizes="(min-width: 1024px) 44vw, 92vw"
                  priority
                  className="object-contain p-8"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 bg-ec-stone px-8 text-center">
                  <PackageSearch className="size-12 text-ec-blue" />
                  <p className="max-w-sm text-lg font-semibold text-ec-ink">
                    Le catalogue e-cobam est prêt pour vos produits, images et fiches techniques.
                  </p>
                </div>
              )}
            </div>

            <div className="grid gap-3 px-2 py-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ec-blue">
                  Sélection catalogue
                </p>
                <h2 className="mt-2 line-clamp-2 text-2xl font-black text-ec-ink">
                  {heroProduct?.name ?? "Produits COBAM GROUP"}
                </h2>
                <p className="mt-2 text-sm text-ec-muted">
                  {heroProduct?.brandName ?? heroProduct?.categoryName ?? "Catalogue construction et finition"}
                </p>
              </div>
              {heroProduct ? (
                <Link
                  href={heroProduct.href}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-ec-ink px-5 text-sm font-semibold text-white transition hover:bg-ec-blue"
                >
                  {price ?? "Voir le produit"}
                </Link>
              ) : null}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {categories.slice(0, 4).map((category) => (
              <Link
                key={category.slug}
                href={category.href}
                className="rounded-full border border-ec-line bg-white px-4 py-2 text-sm font-semibold text-ec-muted shadow-sm transition hover:border-ec-blue/40 hover:text-ec-ink"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
