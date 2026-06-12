import { Metadata } from "next";
import StructuredData from "@/components/seo/StructuredData";
import PageHeader from "@/components/ui/custom/PageHeader";
import PublicArticlesGrid from "@/components/public/articles/public-articles-grid";
import { listPublicArticles } from "@/features/articles/public";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import {
  buildBreadcrumbListStructuredData,
  buildItemListStructuredData,
} from "@/lib/seo/structured-data";

export const metadata: Metadata = buildSeoMetadata({
  title: "Actualités",
  description:
    "Retrouvez les dernières actualités COBAM GROUP, nos inspirations produits et nos conseils pour vos projets.",
  path: "/actualites",
});

export const dynamic = "force-dynamic";

export default async function PublicArticlesPage() {
  const articles = await listPublicArticles();

  return (
    <main className="min-h-screen bg-cobam-light-bg text-cobam-dark-blue">
      <StructuredData
        data={[
          buildBreadcrumbListStructuredData([
            { name: "Accueil", path: "/" },
            { name: "Actualités", path: "/actualites" },
          ]),
          buildItemListStructuredData({
            name: "Actualités COBAM GROUP",
            path: "/actualites",
            items: articles.slice(0, 12).map((article) => ({
              name: article.title,
              path: `/actualites/${article.slug}`,
              imageUrl: article.coverImageThumbnailUrl ?? article.coverImageUrl,
            })),
          }),
        ]}
      />
      <PageHeader
        subtitle="Actualités"
        title="Nos articles, conseils et nouveautés"
        description="Retrouvez les dernières actualités COBAM GROUP, nos inspirations produits et nos conseils pour vos projets."
      />

      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PublicArticlesGrid articles={articles} />
        </div>
      </section>
    </main>
  );
}
