import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/commerce/product-card";
import { ProductDetailClient } from "@/components/commerce/product-detail-client";
import { findCommerceProductBySlug } from "@/lib/commerce";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await findCommerceProductBySlug(slug);

  if (!product) {
    return {
      title: "Produit introuvable",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: product.name,
    description:
      product.descriptionSeo ??
      product.variants[0]?.summary ??
      product.subtitle ??
      "Produit disponible dans le catalogue e-cobam.",
    openGraph: {
      title: product.name,
      description:
        product.descriptionSeo ??
        product.variants[0]?.summary ??
        product.subtitle ??
        "Produit disponible dans le catalogue e-cobam.",
      images: product.coverImage?.url ? [{ url: product.coverImage.url }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await findCommerceProductBySlug(slug);

  if (!product || product.variants.length === 0) {
    notFound();
  }

  return (
    <main className="commerce-container py-8 sm:py-10 lg:py-14">
      <ProductDetailClient product={product} />

      {product.relatedProducts.length > 0 ? (
        <section className="mt-16 border-t border-ec-line pt-12">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ec-blue">
                À comparer
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-ec-ink">
                Produits proches
              </h2>
            </div>
          </div>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {product.relatedProducts.map((item) => (
              <ProductCard key={`${item.entityType}-${item.id}`} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
