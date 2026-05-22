import Link from "next/link";
import { getMailtoHref } from "@cobam/shared";
import { ArrowRight, PackageOpen } from "lucide-react";
import type { LandingProductsState } from "@/lib/home-data";
import { LandingProductCard } from "@/components/home/landing-product-card";

function ProductSectionFallback({ title, text }: { title: string; text: string }) {
  return (
    <div className="border-ec-line mt-8 rounded-[1.5rem] border border-dashed bg-white p-8 text-center">
      <PackageOpen className="text-ec-blue mx-auto size-10" />
      <h3 className="text-ec-ink mt-4 text-xl font-semibold">{title}</h3>
      <p className="text-ec-muted mx-auto mt-2 max-w-xl text-sm leading-6">{text}</p>
      <Link
        href={getMailtoHref({ subject: "Demande catalogue e-cobam" })}
        className="bg-ec-ink hover:bg-ec-blue mt-5 inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-white transition"
      >
        Demander une référence
      </Link>
    </div>
  );
}

export function FeaturedProductsSection({ products }: { products: LandingProductsState }) {
  return (
    <section className="border-ec-line bg-ec-paper border-y py-14 sm:py-18 lg:py-24">
      <div className="commerce-container">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-ec-blue text-sm font-semibold tracking-[0.24em] uppercase">
              Produits
            </p>
            <h2 className="text-ec-ink mt-3 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">
              Des références réelles, prêtes à comparer.
            </h2>
          </div>
          <Link
            href="/catalogue"
            className="border-ec-line text-ec-ink hover:border-ec-blue/40 hover:bg-ec-blue/5 inline-flex h-12 items-center justify-center gap-2 rounded-full border bg-white px-5 text-sm font-semibold transition"
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
