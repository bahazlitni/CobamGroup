import type { Metadata } from "next";
import Image from "next/image";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import StructuredData from "@/components/seo/StructuredData";
import ArticleDocumentReader from "@/components/staff/articles/article-document-reader";
import PublicArticleMeta from "@/components/public/articles/public-article-meta";
import PublicArticleSuggestions from "@/components/public/articles/public-article-suggestions";
import { findPublicArticleBySlug } from "@/features/articles/public";
import { getStaffSessionByRefreshToken } from "@/features/auth/server/session";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import {
  buildArticleStructuredData,
  buildBreadcrumbListStructuredData,
} from "@/lib/seo/structured-data";

export const dynamic = "force-dynamic";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

async function getPublicArticleStaffSession() {
  const cookieStore = await cookies();

  return getStaffSessionByRefreshToken(cookieStore.get("staff_refresh_token")?.value);
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const staffSession = await getPublicArticleStaffSession();
  const article = await findPublicArticleBySlug(slug, { staffSession });

  if (!article) {
    return {
      title: "Article introuvable",
      robots: { index: false, follow: false },
    };
  }

  return buildSeoMetadata({
    title: article.ogTitle?.trim() || article.title,
    description: article.ogDescription?.trim() || article.descriptionSeo || article.excerpt,
    path: `/actualites/${slug}`,
    imageUrl: article.ogImageUrl ?? article.coverImageUrl,
    imageAlt: article.coverImageAlt ?? article.title,
    noIndex: article.isDraft,
    type: "article",
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
    authors: article.authors,
  });
}

export default async function PublicArticleDetailPage({
  params,
}: ArticlePageProps) {
  const { slug } = await params;
  const staffSession = await getPublicArticleStaffSession();
  const article = await findPublicArticleBySlug(slug, { staffSession });

  if (!article) {
    notFound();
  }

  const path = `/actualites/${article.slug}`;
  const articleDescription =
    article.ogDescription?.trim() || article.descriptionSeo || article.excerpt;

  return (
    <main className="min-h-screen bg-white text-cobam-dark-blue">
      <StructuredData
        data={[
          buildBreadcrumbListStructuredData([
            { name: "Accueil", path: "/" },
            { name: "Actualités", path: "/actualites" },
            { name: article.title, path },
          ]),
          article.isDraft
            ? null
            : buildArticleStructuredData({
                title: article.ogTitle?.trim() || article.title,
                description: articleDescription,
                path,
                imageUrl: article.ogImageUrl ?? article.coverImageUrl,
                publishedAt: article.publishedAt,
                updatedAt: article.updatedAt,
                authors: article.authors,
              }),
        ]}
      />
      <section className="border-b border-slate-300 bg-cobam-light-bg/80">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">

          <div className="space-y-6">
            {article.categories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {article.categories.map((category) => (
                  <span
                    key={category.id}
                    className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]"
                    style={{
                      borderColor: `${category.color}33`,
                      backgroundColor: `${category.color}14`,
                      color: category.color,
                    }}
                  >
                    <span>{category.name}</span>
                    <span>{category.score}%</span>
                  </span>
                ))}
              </div>
            ) : null}

            <h1
              className="max-w-4xl text-4xl font-bold leading-tight text-cobam-dark-blue sm:text-5xl"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              {article.title}
            </h1>

            <PublicArticleMeta
              createdAt={article.createdAt}
            />

            {article.coverImageUrl ? (
              <div className="overflow-hidden rounded-[32px] border border-slate-300 bg-white shadow-sm">
                <div className="relative aspect-[16/9]">
                  <Image
                    src={article.coverImageUrl}
                    alt={article.coverImageAlt ?? article.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <ArticleDocumentReader content={article.content} />
        </div>
      </section>

      <section className="border-t border-slate-300 bg-cobam-light-bg/60 py-14 sm:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PublicArticleSuggestions articles={article.suggestions} />
        </div>
      </section>
    </main>
  );
}
