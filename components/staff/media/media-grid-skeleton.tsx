export default function MediaGridSkeleton({
  count = 8,
}: {
  count?: number;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`media-skeleton-${index}`}
          className="overflow-hidden rounded-3xl border border-slate-300 bg-white shadow-sm"
        >
          <div className="aspect-[4/3] animate-pulse bg-slate-200/80" />
          <div className="space-y-3 px-4 py-4">
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-200/80" />
            <div className="h-3 w-1/2 animate-pulse rounded-full bg-slate-100" />
            <div className="flex gap-2">
              <div className="h-7 w-16 animate-pulse rounded-full bg-slate-100" />
              <div className="h-7 w-20 animate-pulse rounded-full bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
