function ProductInspectorSkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-300 bg-white shadow-sm">
      <div className="aspect-[4/3] animate-pulse bg-slate-200" />
      <div className="space-y-2 p-5">
        <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200" />
        <div className="h-6 w-3/4 animate-pulse rounded-full bg-slate-200" />
      </div>
    </div>
  );
}

export default function PublicProductLoading() {
  return (
    <main className="min-h-screen bg-cobam-light-bg text-cobam-dark-blue">
      <section className="border-b border-slate-200/80 bg-white/80">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-5 sm:px-6 lg:px-8">
          <div className="h-4 w-20 animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 w-4 animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 w-28 animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 w-4 animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200" />
        </div>
      </section>

      <section className="py-10 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)]">
            <div className="aspect-[5/4] animate-pulse rounded-[32px] border border-slate-300 bg-white shadow-sm" />

            <div className="space-y-5 rounded-[32px] border border-slate-300 bg-white p-6 shadow-sm sm:p-8">
              <div className="h-3 w-28 animate-pulse rounded-full bg-slate-200" />
              <div className="h-12 w-3/4 animate-pulse rounded-full bg-slate-200" />
              <div className="flex gap-3">
                <div className="h-12 w-12 animate-pulse rounded-full bg-slate-200" />
                <div className="h-12 w-12 animate-pulse rounded-full bg-slate-200" />
              </div>
              <div className="h-6 w-1/2 animate-pulse rounded-full bg-slate-200" />
              <div className="h-8 w-40 animate-pulse rounded-full bg-slate-200" />
              <div className="h-4 w-full animate-pulse rounded-full bg-slate-200" />
              <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-200" />
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="space-y-2 rounded-2xl bg-slate-100 px-4 py-3"
                  >
                    <div className="h-3 w-20 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-6 w-24 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-3 w-16 animate-pulse rounded-full bg-slate-200" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200" />
              <div className="h-9 w-60 animate-pulse rounded-full bg-slate-200" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <ProductInspectorSkeletonCard key={index} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
