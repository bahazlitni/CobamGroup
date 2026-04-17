import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StructuredData from "@/components/seo/StructuredData";
import PublicProductInspectorView from "@/components/public/products/public-product-inspector";
import StaticHighway from "@/components/ui/custom/StaticHighway";
import { findPublicProductSubcategoryBySlugs } from "@/features/product-categories/public";
import { findPublicProductOrPackBySlug } from "@/features/products/public";
import {
  buildBreadcrumbStructuredData,
  buildSimpleProductMetadata,
  buildSimpleProductStructuredData,
} from "@/features/products/seo";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ category: string; subcategory: string; slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { category, subcategory, slug } = await params;
  const product = await findPublicProductOrPackBySlug(slug);

  if (!product) {
    return {
      title: "Produit introuvable | COBAM GROUP",
      robots: { index: false, follow: false },
    };
  }

  return buildSimpleProductMetadata(product, {
    path: `/produits/${category}/${subcategory}/${slug}`,
  });
}

export default async function PublicProductPage({ params }: ProductPageProps) {
  const { category, subcategory, slug } = await params;
  const [product, subcategoryData] = await Promise.all([
    findPublicProductOrPackBySlug(slug),
    findPublicProductSubcategoryBySlugs({
      categorySlug: category,
      subcategorySlug: subcategory,
    }),
  ]);

  if (!product || !subcategoryData) {
    notFound();
  }

  const breadcrumb = {
    categoryName: subcategoryData.parentName ?? "Produits",
    categorySlug: category,
    subcategoryName: subcategoryData.name,
    subcategorySlug: subcategory,
  };
  const path = `/produits/${category}/${subcategory}/${product.slug}`;

  return (
    <main className="relative min-h-screen bg-white text-cobam-dark-blue">
      <StructuredData
        data={[
          buildBreadcrumbStructuredData({
            breadcrumb,
            currentLabel: product.name,
            currentPath: path,
          }),
          buildSimpleProductStructuredData(product, { path }),
        ]}
      />
      <StaticHighway direction="left" />
      <section className="py-10 sm:py-12 lg:py-20 border-t border-cobam-quill-grey/30">
        <div className="mx-auto max-w-[92rem] px-4 sm:px-6 lg:px-8">
          <PublicProductInspectorView product={product} breadcrumb={breadcrumb} />
        </div>
      </section>
    </main>
  );
}
