function PublicProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-300 bg-white shadow-sm">
      <div className="aspect-[4/3] animate-pulse bg-slate-200" />
      <div className="space-y-3 p-6">
        <div className="h-3 w-28 animate-pulse rounded-full bg-slate-200" />
        <div className="h-8 w-3/4 animate-pulse rounded-full bg-slate-200" />
        <div className="h-4 w-full animate-pulse rounded-full bg-slate-200" />
        <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-200" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <main className="min-h-screen bg-cobam-light-bg text-cobam-dark-blue">
      <section className="relative overflow-hidden bg-cobam-dark-blue">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-16 -left-10 h-72 w-72 rounded-full bg-cobam-water-blue/80" />
          <div className="absolute right-10 bottom-0 h-64 w-64 rounded-full bg-white" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mb-4 h-3 w-28 animate-pulse rounded-full bg-white/20" />
          <div className="mb-6 h-10 w-2/3 animate-pulse rounded-full bg-white/20" />
          <div className="h-5 w-full max-w-2xl animate-pulse rounded-full bg-white/15" />
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="h-4 w-44 animate-pulse rounded-full bg-slate-200" />
            <div className="h-12 w-full animate-pulse rounded-full bg-white shadow-sm md:max-w-md" />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <PublicProductCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
