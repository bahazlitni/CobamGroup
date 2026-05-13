import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LandingCategory } from "@/lib/home-data";
import { formatCompactNumber } from "@/lib/format";

function productCountLabel(value: number | null) {
  if (value == null) {
    return "Catalogue";
  }

  if (value === 0) {
    return "Rayon à découvrir";
  }

  return `${formatCompactNumber(value)} produits`;
}

export function CategoryShowcase({ categories }: { categories: LandingCategory[] }) {
  return (
    <section className="bg-white py-14 sm:py-18 lg:py-24">
      <div className="commerce-container">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ec-blue">
              Rayons
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-ec-ink sm:text-5xl">
              Trouver vite le bon univers produit.
            </h2>
          </div>
          <Link
            href="/catalogue"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-ec-line bg-white px-5 text-sm font-semibold text-ec-ink transition hover:border-ec-blue/40 hover:bg-ec-blue/5"
          >
            Tous les rayons
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, 8).map((category, index) => (
            <Link
              key={category.slug}
              href={category.href}
              className="group overflow-hidden rounded-[1.4rem] border border-ec-line bg-white transition duration-300 hover:-translate-y-1 hover:border-ec-blue/30 hover:shadow-[0_20px_60px_rgba(16,32,47,0.10)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ec-blue"
            >
              <div className="relative aspect-[4/2.75] bg-[#f3f0ea]">
                {category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 92vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                    priority={index < 2}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm font-bold uppercase tracking-[0.24em] text-ec-muted/45">
                    COBAM
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-semibold leading-tight text-ec-ink">
                    {category.name}
                  </h3>
                  <ArrowRight className="size-5 shrink-0 text-ec-muted transition group-hover:translate-x-1 group-hover:text-ec-blue" />
                </div>
                <p className="mt-3 line-clamp-2 min-h-[2.5rem] text-sm leading-5 text-ec-muted">
                  {category.subtitle ?? category.description ?? productCountLabel(category.productCount)}
                </p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-ec-blue">
                  {productCountLabel(category.productCount)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
