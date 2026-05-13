export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-10">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col justify-center">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700">
          COBAM GROUP
        </p>
        <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight text-slate-950">
          e-cobam
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          Nouvelle application e-commerce branchée sur le même schéma Prisma et
          la même base de données que l&apos;espace principal.
        </p>
      </section>
    </main>
  );
}
