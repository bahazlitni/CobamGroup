import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="commerce-container py-16">
      <section className="mx-auto max-w-2xl rounded-[2rem] border border-ec-line bg-white p-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ec-blue">404</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-ec-ink">
          Cette page est introuvable.
        </h1>
        <p className="mt-4 text-sm leading-7 text-ec-muted">
          Le produit ou la page demandée n’est plus disponible dans cette entrée catalogue.
        </p>
        <ButtonLink href="/catalogue" className="mt-7">
          Revenir au catalogue
        </ButtonLink>
      </section>
    </main>
  );
}
