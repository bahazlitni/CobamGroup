import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import StructuredData from "@/components/seo/StructuredData";
import PublicProductInspectorView from "@/components/public/products/public-product-inspector";
import StaticHighway from "@/components/ui/custom/StaticHighway";
import { findPublicProductSubcategoryBySlugs } from "@/features/product-categories/public";
import {
  findPublicFamilySlugForVariant,
  findProductLifecycleBySlug,
  findPublicProductBySlug,
  findPublicRelatedProducts,
} from "@/features/products/public";
import {
  buildBreadcrumbStructuredData,
  buildSimpleProductMetadata,
  buildSimpleProductStructuredData,
  resolveVariantFamilyCanonicalPath,
  resolveSimpleProductCanonicalPath,
} from "@/features/products/seo";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ category: string; subcategory: string; slug: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { category, subcategory, slug } = await params;
  const product = await findPublicProductBySlug(slug);

  if (!product) {
    return {
      title: "Produit introuvable | COBAM GROUP",
      robots: { index: false, follow: false },
    };
  }

  const familySlug = product.kind === "VARIANT" ? await findPublicFamilySlugForVariant(slug) : null;
  const fallbackPath = `/produits/${category}/${subcategory}/${slug}`;

  return buildSimpleProductMetadata(product, {
    path: familySlug
      ? resolveVariantFamilyCanonicalPath(product, familySlug, fallbackPath)
      : resolveSimpleProductCanonicalPath(product, fallbackPath),
    noIndex: Boolean(familySlug),
  });
}

export default async function PublicProductPage({ params }: ProductPageProps) {
  const { category, subcategory, slug } = await params;
  const [product, subcategoryData] = await Promise.all([
    findPublicProductBySlug(slug),
    findPublicProductSubcategoryBySlugs({
      categorySlug: category,
      subcategorySlug: subcategory,
    }),
  ]);

  if (!product) {
    const lifecycle = await findProductLifecycleBySlug(slug);
    if (lifecycle === "DISCONTINUED") {
      redirect("/produits");
    }

    notFound();
  }

  if (!subcategoryData) {
    notFound();
  }

  const relatedProducts = await findPublicRelatedProducts(product);
  const breadcrumb = {
    categoryName: subcategoryData.parentName ?? "Produits",
    categorySlug: category,
    subcategoryName: subcategoryData.name,
    subcategorySlug: subcategory,
  };
  const currentPath = `/produits/${category}/${subcategory}/${product.slug}`;
  const familySlug =
    product.kind === "VARIANT" ? await findPublicFamilySlugForVariant(product.slug) : null;
  const canonicalPath = familySlug
    ? resolveVariantFamilyCanonicalPath(product, familySlug, currentPath)
    : resolveSimpleProductCanonicalPath(product, currentPath);
  const structuredData = [
    buildBreadcrumbStructuredData({
      breadcrumb,
      currentLabel: product.name,
      currentPath,
    }),
    ...(familySlug ? [] : [buildSimpleProductStructuredData(product, { path: canonicalPath })]),
  ];

  return (
    <main className="text-cobam-dark-blue relative min-h-screen bg-white">
      <StructuredData data={structuredData} />
      <StaticHighway direction="left" />
      <section className="border-cobam-quill-grey/30 border-t py-10 sm:py-12 lg:py-20">
        <div className="mx-auto max-w-[92rem] px-4 sm:px-6 lg:px-8">
          <PublicProductInspectorView
            product={product}
            breadcrumb={breadcrumb}
            relatedProducts={relatedProducts}
          />
        </div>
      </section>
    </main>
  );
}
