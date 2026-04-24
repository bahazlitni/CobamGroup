import { Metadata } from "next";
import PageHeader from "@/components/ui/custom/PageHeader";
import PublicArticlesGrid from "@/components/public/articles/public-articles-grid";
import { listPublicArticles } from "@/features/articles/public";

export const metadata: Metadata = {
  title: "Actualites",
  description:
    "Retrouvez les dernieres actualites COBAM GROUP, nos inspirations produits et nos conseils pour vos projets.",
  alternates: {
    canonical: "/actualites",
  },
};

export const dynamic = "force-dynamic";

export default async function PublicArticlesPage() {
  const articles = await listPublicArticles();

  return (
    <main className="min-h-screen bg-cobam-light-bg text-cobam-dark-blue">
      <PageHeader
        subtitle="Actualites"
        title="Nos articles, conseils et nouveautes"
        description="Retrouvez les dernieres actualites COBAM GROUP, nos inspirations produits et nos conseils pour vos projets."
      />

      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PublicArticlesGrid articles={articles} />
        </div>
      </section>
    </main>
  );
}
