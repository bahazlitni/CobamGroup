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
    <main className="min-h-screen bg-slate-50 text-cobam-dark-blue">
      <section className="py-10 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-[92rem] px-4 sm:px-6 lg:px-8">
          <PublicProductInspectorView
            product={productData}
            breadcrumb={{
              categoryName: subcategoryData.parentName ?? "catégorie",
              categorySlug: category,
              subcategoryName: subcategoryData.name,
              subcategorySlug: subcategory,
            }}
          />
        </div>
      </section>
    </main>
  );
}
