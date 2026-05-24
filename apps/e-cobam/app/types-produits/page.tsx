import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Boxes, SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listCommerceProductTypes } from "@/lib/commerce";
import { formatCompactNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explorer par type de produit",
  description: "Parcourez le catalogue e-cobam par templates et familles techniques de produits.",
};

export default async function ProductTypesPage() {
  const groups = await listCommerceProductTypes();
  const totalTypes = groups.reduce((sum, group) => sum + group.productTypes.length, 0);
  const totalProducts = groups.reduce(
    (sum, group) =>
      sum + group.productTypes.reduce((groupSum, type) => groupSum + type.productCount, 0),
    0,
  );

  return (
    <main className="commerce-container py-8 sm:py-10 lg:py-14">
      <section className="rounded-[2rem] bg-ec-ink p-6 text-white sm:p-8 lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-ec-blue">
          Exploration par type
        </p>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
              Explorez par template produit.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
              Une entree plus technique que le catalogue classique : choisissez un type de produit,
              puis affinez avec les attributs filtrables propres a ce template.
            </p>
          </div>
          <Card className="border-white/10 bg-white/[0.06] text-white shadow-none">
            <CardContent className="grid gap-4 p-5 sm:grid-cols-2 sm:p-5">
              <div>
                <p className="text-3xl font-black">{formatCompactNumber(totalTypes)}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-white/50">
                  types actifs
                </p>
              </div>
              <div>
                <p className="text-3xl font-black">{formatCompactNumber(totalProducts)}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-white/50">
                  références
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-8 space-y-8">
        {groups.length > 0 ? (
          groups.map((group) => (
            <div key={group.slug}>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-ec-blue">
                    Groupe
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-ec-ink sm:text-3xl">{group.name}</h2>
                </div>
                <Badge variant="outline">{group.productTypes.length} type(s)</Badge>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.productTypes.map((type) => (
                  <Card
                    key={type.slug}
                    className="overflow-hidden transition hover:-translate-y-0.5 hover:border-ec-blue/35 hover:shadow-xl hover:shadow-ec-ink/5"
                  >
                    <Link href={`/types-produits/${type.slug}`} className="block">
                      {type.image?.thumbnailUrl || type.image?.url ? (
                        <div className="relative aspect-[16/8] bg-ec-stone">
                          <Image
                            src={type.image.thumbnailUrl ?? type.image.url}
                            alt={type.image.altText ?? type.displayName}
                            fill
                            sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 90vw"
                            className="object-cover"
                          />
                        </div>
                      ) : null}
                      <CardHeader>
                        <div className="mb-4 grid size-11 place-items-center rounded-2xl bg-ec-blue/10 text-ec-blue">
                          <Boxes className="size-5" />
                        </div>
                        <CardTitle>{type.displayName}</CardTitle>
                        <CardDescription>
                          {type.description || "Explorer les produits rattaches a ce template."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-wrap items-center gap-2">
                        <Badge variant="blue">{formatCompactNumber(type.productCount)} produits</Badge>
                        {type.filterableAttributeCount > 0 ? (
                          <Badge variant="secondary">
                            <SlidersHorizontal className="size-3" />
                            {type.filterableAttributeCount} filtre(s)
                          </Badge>
                        ) : (
                          <Badge variant="outline">Sans filtre template</Badge>
                        )}
                        <span className="ml-auto inline-flex items-center gap-1 text-sm font-black text-ec-blue">
                          Explorer <ArrowRight className="size-4" />
                        </span>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          ))
        ) : (
          <Card>
            <CardContent className="p-10 text-center sm:p-10">
              <h2 className="text-2xl font-black text-ec-ink">Aucun type disponible</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-ec-muted">
                Les types de produits apparaitront ici lorsque des produits visibles seront
                rattaches aux templates.
              </p>
              <ButtonLink href="/catalogue" className="mt-6" variant="secondary">
                Revenir au catalogue
              </ButtonLink>
            </CardContent>
          </Card>
        )}
      </section>
    </main>
  );
}
