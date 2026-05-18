import Link from "next/link";
import { ArrowRight, PackageOpen } from "lucide-react";
import type { LandingProductsState } from "@/lib/home-data";
import { LandingProductCard } from "@/components/home/landing-product-card";

function ProductSectionFallback({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="mt-8 rounded-[1.5rem] border border-dashed border-ec-line bg-white p-8 text-center">
      <PackageOpen className="mx-auto size-10 text-ec-blue" />
      <h3 className="mt-4 text-xl font-semibold text-ec-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-ec-muted">{text}</p>
      <Link
        href="mailto:contact@cobamgroup.com?subject=Demande%20catalogue%20e-cobam"
        className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-ec-ink px-5 text-sm font-semibold text-white transition hover:bg-ec-blue"
      >
        Demander une référence
      </Link>
    </div>
  );
}

export function FeaturedProductsSection({ products }: { products: LandingProductsState }) {
  return (
    <section className="border-y border-ec-line bg-ec-paper py-14 sm:py-18 lg:py-24">
      <div className="commerce-container">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ec-blue">
              Produits
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-ec-ink sm:text-5xl">
              Des références réelles, prêtes à comparer.
            </h2>
          </div>
          <Link
            href="/catalogue"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-ec-line bg-white px-5 text-sm font-semibold text-ec-ink transition hover:border-ec-blue/40 hover:bg-ec-blue/5"
          >
            Ouvrir le catalogue
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {products.status === "ready" ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.items.map((product, index) => (
              <LandingProductCard key={product.id} product={product} priority={index < 4} />
            ))}
          </div>
        ) : products.status === "empty" ? (
          <ProductSectionFallback
            title="Les produits seront bientôt disponibles en ligne."
            text="Le catalogue existe, mais aucune référence publiable n'est encore prête pour l'e-commerce. L'équipe COBAM peut tout de même vous orienter."
          />
        ) : (
          <ProductSectionFallback
            title="Impossible de charger les produits pour le moment."
            text={products.message}
          />
        )}
      </div>
    </section>
  );
}
