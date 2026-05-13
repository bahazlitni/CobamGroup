import type { PublicArticleSummary } from "@/features/articles/public";
import PublicArticleCard from "./public-article-card";

type PublicArticleSuggestionsProps = {
  articles: PublicArticleSummary[];
};

export default function PublicArticleSuggestions({
  articles,
}: PublicArticleSuggestionsProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="space-y-8">
      <div className="max-w-3xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-cobam-water-blue">
          Voir aussi
        </p>
        <h2
          className="text-3xl font-bold text-cobam-dark-blue sm:text-4xl"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          D&apos;autres articles à découvrir
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {articles.map((article) => (
          <PublicArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
