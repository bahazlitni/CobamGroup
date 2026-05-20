import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  PromotionBannerCarousel,
  PromotionShowcase,
} from "@/components/public/promotions/promotion-showcase";
import PageHeader from "@/components/ui/custom/PageHeader";
import { listPublicPromotions } from "@/features/promotions/public";

export const metadata: Metadata = {
  title: "Promotions",
  description:
    "Consultez les promotions, offres et opportunites speciales proposees par COBAM GROUP.",
  alternates: {
    canonical: "/promotions",
  },
};

export default function PromotionsPage() {
  const promotionsPromise = listPublicPromotions();

  return (
    <main className="min-h-screen bg-[#f4f1eb] text-[#14202e]">
      <PageHeader
        subtitle="Promotions COBAM Group"
        title="Des offres sélectionnées pour vos projets."
        description="Retrouvez les promotions publiques actives sur les produits du catalogue COBAM Group, avec des selections liees aux marques, categories et univers concernes."
        className="!border-b-0 !bg-[#f4f1eb]"
      />

      <PromotionsPageContent promotionsPromise={promotionsPromise} />
    </main>
  );
}

async function PromotionsPageContent({
  promotionsPromise,
}: {
  promotionsPromise: Promise<Awaited<ReturnType<typeof listPublicPromotions>>>;
}) {
  const promotions = await promotionsPromise;

  if (promotions.length === 0) {
    return (
      <section className="px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[#14202e]/10 bg-white p-10 text-center shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0a8dc1]">
            Aucune offre active
          </p>
          <h2 className="mt-4 text-3xl font-semibold">Les promotions arrivent bientot.</h2>
          <p className="mt-4 text-sm leading-7 text-[#5f6872]">
            En attendant, vous pouvez explorer l&apos;ensemble du catalogue COBAM Group.
          </p>
          <Link
            href="/produits"
            className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#14202e] px-5 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#0a8dc1]"
          >
            Explorer le catalogue
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <PromotionBannerCarousel promotions={promotions} />
      <section className="px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1500px]">
          <PromotionShowcase promotions={promotions} />
        </div>
      </section>
    </>
  );
}
