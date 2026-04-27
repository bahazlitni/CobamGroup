import { CalendarDays, PencilLine, UserRound } from "lucide-react";

function formatArticleDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Tunis",
  }).format(new Date(value));
}

type PublicArticleMetaProps = {
  createdAt: string;
  className?: string;
};

export default function PublicArticleMeta({
  createdAt,
  className,
}: PublicArticleMetaProps) {
  return (
    <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500 ${className ?? ""}`}>
      <div className="inline-flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-cobam-water-blue" />
        <span>Créé le {formatArticleDate(createdAt)}</span>
      </div>
    </div>
  );
}
