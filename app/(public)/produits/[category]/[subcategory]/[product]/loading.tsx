function SkeletonLine({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-full bg-slate-200 ${className}`} />;
}

function VariantCardSkeleton() {
  return (
    <div className="min-w-[14rem] overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white">
      <div className="aspect-square animate-pulse bg-slate-100" />
      <div className="space-y-2 p-4">
        <SkeletonLine className="h-5 w-2/3" />
        <SkeletonLine className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export default function PublicProductLoading() {
  return (
    <main className="min-h-screen bg-slate-50 text-cobam-dark-blue">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[92rem] items-center gap-2 px-4 py-5 sm:px-6 lg:px-8">
          <SkeletonLine className="h-4 w-20" />
          <SkeletonLine className="h-4 w-4" />
          <SkeletonLine className="h-4 w-24" />
          <SkeletonLine className="h-4 w-4" />
          <SkeletonLine className="h-4 w-32" />
        </div>
      </section>

      <section className="py-10 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-[92rem] space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(20rem,0.92fr)_minmax(0,1.08fr)]">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-4 sm:p-5">
              <div className="aspect-square animate-pulse rounded-[1.4rem] bg-slate-100" />
              <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-square animate-pulse rounded-[1rem] bg-slate-100"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 sm:p-8">
                <div className="space-y-4">
                  <SkeletonLine className="h-3 w-24" />
                  <SkeletonLine className="h-4 w-2/3" />
                  <SkeletonLine className="h-12 w-4/5" />
                  <SkeletonLine className="h-6 w-1/2" />
                  <div className="flex gap-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="space-y-2">
                        <div className="h-11 w-11 animate-pulse rounded-full bg-slate-100" />
                        <SkeletonLine className="h-3 w-14" />
                      </div>
                    ))}
                  </div>
                  <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4">
                    <SkeletonLine className="h-4 w-16" />
                    <SkeletonLine className="mt-3 h-5 w-32" />
                  </div>
                  <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4">
                    <SkeletonLine className="h-4 w-16" />
                    <SkeletonLine className="mt-3 h-10 w-40" />
                  </div>
                  <div className="space-y-3">
                    <SkeletonLine className="h-4 w-full" />
                    <SkeletonLine className="h-4 w-11/12" />
                    <SkeletonLine className="h-4 w-4/5" />
                    <SkeletonLine className="h-4 w-5/6" />
                  </div>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 sm:p-8">
                <div className="space-y-5">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="space-y-3">
                      <SkeletonLine className="h-4 w-24" />
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 4 }).map((__, optionIndex) => (
                          <SkeletonLine key={optionIndex} className="h-10 w-20" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <SkeletonLine className="h-4 w-24" />
            <SkeletonLine className="h-8 w-48" />
            <div className="flex gap-4 overflow-x-auto pb-1">
              {Array.from({ length: 4 }).map((_, index) => (
                <VariantCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
