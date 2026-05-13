import Image from "next/image";
import Link from "next/link";
import type { PublicArticleSummary } from "@/features/articles/public";
import PublicArticleMeta from "./public-article-meta";

type PublicArticleCardProps = {
  article: PublicArticleSummary;
};

export default function PublicArticleCard({
  article,
}: PublicArticleCardProps) {
  return (
    <Link
      href={`/actualites/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-300 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
        {article.coverImageThumbnailUrl ? (
          <Image
            src={article.coverImageThumbnailUrl}
            alt={article.coverImageAlt ?? article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-cobam-light-bg via-white to-cobam-light-bg px-8 text-center text-sm font-semibold text-cobam-dark-blue">
            {article.title}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-5 p-6">
        <div className="space-y-3">
          <h2
            className="text-2xl font-bold leading-tight text-cobam-dark-blue"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {article.title}
          </h2>

          <p className="line-clamp-4 text-sm leading-7 text-slate-600">
            {article.excerpt}
          </p>
        </div>

        <div className="mt-auto border-t border-slate-100 pt-5">
          <PublicArticleMeta
            createdAt={article.createdAt}
          />
        </div>
      </div>
    </Link>
  );
}
