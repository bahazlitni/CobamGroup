import { StaffBadge } from "@/components/staff/ui";
import {
  getArticleFirstParagraphText,
  getArticlePlainText,
} from "@/features/articles/document";

type SeoChecksProps = {
  title: string;
  slug: string;
  description: string;
  content: string;
  focusKeyword: string;
};

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function SeoChecks({
  title,
  slug,
  description,
  content,
  focusKeyword,
}: SeoChecksProps) {
  const titleLength = title.trim().length;
  const descLength = description.trim().length;
  const contentText = getArticlePlainText(content);
  const firstParagraphText = getArticleFirstParagraphText(content);
  const keyword = focusKeyword.trim().toLowerCase();

  const wordCount = contentText
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const keywordOccurrences =
    keyword.length === 0
      ? 0
      : (contentText
          .toLowerCase()
          .match(new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "g")) || []
        ).length;

  const keywordDensity =
    wordCount > 0 ? (keywordOccurrences / wordCount) * 100 : 0;

  const keywordInTitle = !!keyword && title.toLowerCase().includes(keyword);
  const keywordInDescription =
    !!keyword && description.toLowerCase().includes(keyword);
  const keywordInFirstParagraph =
    !!keyword && firstParagraphText.toLowerCase().includes(keyword);

  const keywordInSlug =
    !!keyword &&
    slug.toLowerCase().includes(keyword.replace(/\s+/g, "-"));

  let score = 0;
  const checks: { label: string; ok: boolean }[] = [];

  const addCheck = (label: string, ok: boolean, points: number) => {
    checks.push({ label, ok });
    if (ok) {
      score += points;
    }
  };

  addCheck("Titre entre 35 et 60 caracteres", titleLength >= 35 && titleLength <= 60, 10);
  addCheck("Meta description entre 120 et 160 caracteres", descLength >= 120 && descLength <= 160, 10);
  addCheck("Contenu d'au moins 600 mots", wordCount >= 600, 15);
  addCheck("Mot-cle present dans le titre", keywordInTitle, 10);
  addCheck("Mot-cle present dans la meta description", keywordInDescription, 10);
  addCheck("Mot-cle present dans le slug", keywordInSlug, 5);
  addCheck("Mot-cle present dans l'intro", keywordInFirstParagraph, 10);
  addCheck("Densite du mot-cle entre 1% et 1,5%", keywordDensity >= 1 && keywordDensity <= 1.5, 10);
  addCheck("Slug propre et en minuscules", !!slug && slug === slug.toLowerCase() && !/\s/.test(slug), 5);

  const maxScore = 85;
  const normalizedScore = Math.round(Math.min(100, (score / maxScore) * 100));
  const scoreBadge =
    normalizedScore >= 80
      ? { color: "green" as const, icon: "badge-check" as const }
      : normalizedScore >= 50
        ? { color: "amber" as const, icon: "warning" as const }
        : { color: "red" as const, icon: "warning" as const };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Analyse SEO
          </p>
          <p className="text-xs text-slate-400">
            Verification rapide dans l&apos;esprit de WordPress/Rank Math.
          </p>
        </div>

        <StaffBadge size="lg" color={scoreBadge.color} icon={scoreBadge.icon}>
          Score estime : {normalizedScore}/100
        </StaffBadge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ul className="space-y-2 text-sm">
          {checks.map((check, index) => (
            <li key={index} className="flex items-start gap-2">
              <span
                className={`mt-1 h-2.5 w-2.5 rounded-full ${
                  check.ok ? "bg-emerald-500" : "bg-slate-300"
                }`}
              />
              <span className={check.ok ? "text-slate-700" : "text-slate-500"}>
                {check.label}
              </span>
            </li>
          ))}
        </ul>

        <div className="space-y-2 text-sm text-slate-600">
          <p>
            Nombre de mots : <span className="font-semibold">{wordCount}</span>
          </p>
          <p>
            Occurrences du mot-cle :{" "}
            <span className="font-semibold">{keywordOccurrences}</span>
          </p>
          <p>
            Densite :{" "}
            <span className="font-semibold">
              {keywordDensity ? keywordDensity.toFixed(2) : "0.00"}%
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
