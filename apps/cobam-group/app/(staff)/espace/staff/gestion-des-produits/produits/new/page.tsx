"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Layers3, Package, Shapes } from "lucide-react";
import Loading from "@/components/staff/Loading";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { StaffPageHeader } from "@/components/staff/ui";
import {
  getSingleProductFormOptionsClient,
  SingleProductsClientError,
} from "@/features/single-products/client";
import type { ProductTypeGroupOptionDto } from "@/features/products/types";
import { useRouter } from "next/navigation";

export default function NewSingleProductPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<ProductTypeGroupOptionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const options = await getSingleProductFormOptionsClient();
        if (!cancelled) {
          setGroups(options.productTypeGroups);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof SingleProductsClientError
              ? err.message
              : err instanceof Error
                ? err.message
                : "Impossible de charger les modèles produit.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const hasProductTypes = useMemo(
    () => groups.some((group) => group.productTypes.length > 0),
    [groups],
  );

  const openBlankForm = () => {
    router.push("/espace/staff/gestion-des-produits/produits/edit");
  };

  const openTemplateForm = (productTypeId: number) => {
    router.push(
      `/espace/staff/gestion-des-produits/produits/edit?type=${productTypeId}`,
    );
  };

  return (
    <div className="space-y-8">
      <StaffPageHeader
        eyebrow="Produits"
        title="Choisir un modèle de produit"
        icon={Package}
        actions={
          <AnimatedUIButton
            type="button"
            variant="outline"
            icon="arrow-right"
            iconPosition="right"
            onClick={openBlankForm}
          >
            Continuer sans modèle
          </AnimatedUIButton>
        }
      />

      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loading />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : hasProductTypes ? (
        <div className="space-y-8">
          {groups
            .filter((group) => group.productTypes.length > 0)
            .map((group) => (
              <section key={group.slug} className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <Layers3 className="h-4 w-4" />
                  {group.name}
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {group.productTypes.map((productType) => (
                    <button
                      key={productType.id}
                      type="button"
                      onClick={() => openTemplateForm(productType.id)}
                      className="group flex min-h-36 flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-cobam-dark-blue/40 hover:shadow-md"
                    >
                      <span className="flex items-start justify-between gap-4">
                        <span>
                          <span className="flex items-center gap-2 text-base font-semibold text-cobam-dark-blue">
                            <Shapes className="h-4 w-4 text-cobam-water-blue" />
                            {productType.displayName}
                          </span>
                          {productType.description ? (
                            <span className="mt-2 block text-sm leading-6 text-slate-500">
                              {productType.description}
                            </span>
                          ) : null}
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-cobam-dark-blue" />
                      </span>
                      <span className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                        {productType.attributes.length} attribut
                        {productType.attributes.length > 1 ? "s" : ""}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-600">
            Aucun modèle produit n&rsquo;est encore configuré.
          </p>
          <div className="mt-4">
            <AnimatedUIButton
              type="button"
              variant="secondary"
              icon="arrow-right"
              iconPosition="right"
              onClick={openBlankForm}
            >
              Continuer sans modèle
            </AnimatedUIButton>
          </div>
        </div>
      )}
    </div>
  );
}
