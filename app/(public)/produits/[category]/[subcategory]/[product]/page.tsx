import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import PublicProductInspectorView from "@/components/public/products/public-product-inspector";
import { findPublicProductSubcategoryBySlugs } from "@/features/product-categories/public";
import { findPublicProductBySlugs } from "@/features/products/public";

export const dynamic = "force-dynamic";

export default async function PublicProductPage({
  params,
}: {
  params: Promise<{ category: string; subcategory: string; product: string }>;
}) {
  const { category, subcategory, product } = await params;
  const [subcategoryData, productData] = await Promise.all([
    findPublicProductSubcategoryBySlugs({
      categorySlug: category,
      subcategorySlug: subcategory,
    }),
    findPublicProductBySlugs({
      categorySlug: category,
      subcategorySlug: subcategory,
      productSlug: product,
    }),
  ]);

  if (!subcategoryData || !productData) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-cobam-light-bg text-cobam-dark-blue">
      <section className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-5 text-sm text-slate-500 sm:px-6 lg:px-8">
          <Link href="/produits" className="transition hover:text-cobam-water-blue">
            Produits
          </Link>
          <ChevronRight className="h-4 w-4 text-slate-300" />
          <Link
            href={`/produits/${category}`}
            className="transition hover:text-cobam-water-blue"
          >
            {subcategoryData.parentName ?? "Categorie"}
          </Link>
          <ChevronRight className="h-4 w-4 text-slate-300" />
          <Link
            href={`/produits/${category}/${subcategory}`}
            className="transition hover:text-cobam-water-blue"
          >
            {subcategoryData.name}
          </Link>
          <ChevronRight className="h-4 w-4 text-slate-300" />
          <span className="font-medium text-cobam-dark-blue">{productData.name}</span>
        </div>
      </section>

      <section className="py-10 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PublicProductInspectorView product={productData} />
        </div>
      </section>
    </main>
  );
}
