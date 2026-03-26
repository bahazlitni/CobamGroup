"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { PublicArticleSummary } from "@/features/articles/public";
import PublicArticleCard from "./public-article-card";

const ROW_BATCH_SIZE = 6;

type PublicArticlesGridProps = {
  articles: PublicArticleSummary[];
};

export default function PublicArticlesGrid({
  articles,
}: PublicArticlesGridProps) {
  const [visibleCount, setVisibleCount] = useState(
    Math.min(articles.length, ROW_BATCH_SIZE),
  );
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisibleCount(Math.min(articles.length, ROW_BATCH_SIZE));
  }, [articles]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || visibleCount >= articles.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry?.isIntersecting) {
          setVisibleCount((current) =>
            Math.min(current + ROW_BATCH_SIZE, articles.length),
          );
        }
      },
      {
        rootMargin: "320px 0px",
      },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [articles.length, visibleCount]);

  if (articles.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 px-6 py-14 text-center text-slate-500">
        Aucun article publié n&apos;est disponible pour le moment.
      </div>
    );
  }

  const visibleArticles = articles.slice(0, visibleCount);
  const hasMore = visibleCount < articles.length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {visibleArticles.map((article) => (
          <PublicArticleCard key={article.id} article={article} />
        ))}
      </div>

      <div ref={sentinelRef} className="flex min-h-12 items-center justify-center">
        {hasMore ? (
          <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500 shadow-sm">
            <Loader2 className="h-4 w-4 animate-spin text-cobam-water-blue" />
            Chargement d&apos;autres articles...
          </div>
        ) : null}
      </div>
    </div>
  );
}
