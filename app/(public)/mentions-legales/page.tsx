import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions legales | Cobam Group",
  description: "Mentions legales de Cobam Group.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function LegalNoticePage() {
  return (
    <main className="bg-cobam-light-bg px-6 py-24 text-cobam-dark-blue">
      <section className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cobam-water-blue">
          Legal
        </p>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight">
          Mentions legales
        </h1>
        <p className="mt-6 leading-7 text-cobam-carbon-grey">
          Cette page est en cours de finalisation. Elle regroupera les
          informations legales relatives a Cobam Group, a l'edition du site et
          aux responsabilites applicables.
        </p>
      </section>
    </main>
  );
}
