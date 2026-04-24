import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de cookies",
  description: "Politique de cookies de Cobam Group.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function CookiePolicyPage() {
  return (
    <main className="bg-cobam-light-bg px-6 py-24 text-cobam-dark-blue">
      <section className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cobam-water-blue">
          Legal
        </p>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight">
          Politique de cookies
        </h1>
        <p className="mt-6 leading-7 text-cobam-carbon-grey">
          Cette page est volontairement minimale pour le moment. La politique de
          cookies sera completee lorsque l'usage des cookies et outils de mesure
          sera definitivement configure.
        </p>
      </section>
    </main>
  );
}
