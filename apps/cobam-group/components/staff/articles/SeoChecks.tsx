import { StaffBadge } from "@/components/staff/ui";
import type { ArticleSeoAnalyzerResult } from "@/features/articles/seo-analyzer";

type SeoChecksProps = {
  analysis: ArticleSeoAnalyzerResult;
};

function getStatusBadge(status: ArticleSeoAnalyzerResult["status"]) {
  switch (status) {
    case "SEO_READY":
      return { color: "green" as const, icon: "badge-check" as const, label: "SEO_READY" };
    case "NEEDS_IMPROVEMENT":
      return { color: "amber" as const, icon: "warning" as const, label: "NEEDS_IMPROVEMENT" };
    case "NOT_READY":
    default:
      return { color: "red" as const, icon: "warning" as const, label: "NOT_READY" };
  }
}

type FeedbackTheme = "error" | "warning" | "info" | "success";

const feedbackThemeStyles: Record<
  FeedbackTheme,
  {
    title: string;
    dot: string;
    text: string;
  }
> = {
  error: {
    title: "text-rose-600",
    dot: "bg-rose-500",
    text: "text-slate-650",
  },
  warning: {
    title: "text-amber-600",
    dot: "bg-amber-500",
    text: "text-slate-650",
  },
  info: {
    title: "text-cobam-water-blue",
    dot: "bg-cobam-water-blue",
    text: "text-slate-650",
  },
  success: {
    title: "text-emerald-600",
    dot: "bg-emerald-500",
    text: "text-slate-650",
  },
};

function FeedbackList({
  title,
  items,
  theme,
}: {
  title: string;
  items: Array<{ code: string; message: string }>;
  theme: FeedbackTheme;
}) {
  if (items.length === 0) {
    return null;
  }

  const styles = feedbackThemeStyles[theme];

  return (
    <div>
      <p className={`text-xs font-semibold tracking-[0.14em] uppercase ${styles.title}`}>{title}</p>

      <ul className={`mt-2 space-y-2 text-sm leading-6 ${styles.text}`}>
        {items.slice(0, 6).map((item) => (
          <li key={item.code} className="flex gap-2">
            <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${styles.dot}`} />
            <span>{item.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SeoChecks({ analysis }: SeoChecksProps) {
  const badge = getStatusBadge(analysis.status);

  return (
    <section className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
            Analyse SEO
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Score : <span className="font-semibold">{analysis.score}/100</span>
          </p>
        </div>

        <StaffBadge size="lg" color={badge.color} icon={badge.icon}>
          {badge.label}
        </StaffBadge>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold tracking-[0.14em] text-slate-400 uppercase">
          Aperçu Google
        </p>
        <p className="mt-3 truncate text-base leading-snug font-semibold text-blue-700">
          {analysis.searchPreview.title}
        </p>
        <p className="truncate text-xs text-green-700">
          cobamgroup.com{analysis.searchPreview.url}
        </p>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
          {analysis.searchPreview.description}
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <FeedbackList theme="error" title="Bloquants" items={analysis.criticalIssues} />
        <FeedbackList theme="warning" title="Alertes" items={analysis.warnings} />
        <FeedbackList theme="info" title="Recommandations" items={analysis.recommendations} />
        <FeedbackList theme="success" title="Validé" items={analysis.passedChecks} />
      </div>
    </section>
  );
}
