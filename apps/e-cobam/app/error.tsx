"use client";

import { Button, ButtonLink } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="commerce-container py-16">
      <section className="mx-auto max-w-2xl rounded-[2rem] border border-ec-line bg-white p-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-600">
          Erreur
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-ec-ink">
          Le catalogue n’a pas pu se charger.
        </h1>
        <p className="mt-4 text-sm leading-7 text-ec-muted">
          Réessayez dans un instant. Si le problème persiste, il faudra vérifier la connexion à la
          base partagée.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <Button type="button" variant="secondary" onClick={reset}>
            Réessayer
          </Button>
          <ButtonLink href="/catalogue">Catalogue</ButtonLink>
        </div>
      </section>
    </main>
  );
}
