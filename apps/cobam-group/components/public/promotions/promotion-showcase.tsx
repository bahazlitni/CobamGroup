import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgePercent } from "lucide-react";
import RailCarousel from "@/components/ui/custom/RailCarousel";
import type { PublicPromotion, PublicPromotionTargetCard } from "@/features/promotions/public";

const promotionTypeLabels: Record<PublicPromotion["kind"], string> = {
  PRODUCT: "Produits selectionnes",
  BRAND: "Produits de marques en promotion",
  CATEGORY: "Produits de categories en promotion",
  GENERAL: "Selection catalogue",
};

function PromotionTargetCard({ card }: { card: PublicPromotionTargetCard }) {
  return (
    <Link
      href={card.href}
      className="group flex h-full w-[17rem] shrink-0 flex-col overflow-hidden rounded-2xl border border-[#14202e]/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:w-[19rem]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#14202e]">
        {card.imageUrl ? (
          <Image
            src={card.imageUrl}
            alt={card.title}
            fill
            sizes="19rem"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm font-semibold text-white/55">
            {card.title}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#07111d]/58 via-transparent to-transparent" />
      </div>
      <div className="flex flex-1 flex-col space-y-3 p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0a8dc1]">
          Produit
        </p>
        <h3 className="text-xl font-semibold leading-tight text-[#14202e]">{card.title}</h3>
        {card.subtitle ? (
          <p className="line-clamp-2 text-sm leading-6 text-[#5f6872]">{card.subtitle}</p>
        ) : null}
        <span className="mt-auto inline-flex items-center gap-2 pt-2 text-xs font-black uppercase tracking-[0.16em] text-[#14202e] transition group-hover:text-[#0a8dc1]">
          Voir le produit
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

export function PromotionBannerCarousel({ promotions }: { promotions: PublicPromotion[] }) {
  const banners = promotions.filter((promotion) => promotion.bannerImageUrl);

  if (banners.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#f4f1eb] py-16 md:py-24">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#0a8dc1]">
              Promotions
            </p>
            <h2 className="mt-3 text-4xl font-semibold text-[#14202e] md:text-6xl">
              Offres du moment
            </h2>
          </div>
          <Link
            href="/promotions"
            className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-[#14202e] transition hover:text-[#0a8dc1]"
          >
            Voir toutes les offres
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <RailCarousel
          autoScroll={banners.length > 1}
          autoScrollSpeed={18}
          autoScrollDirection="rtl"
          showButtons="always"
          allowDrag={true}
          applyPhysics={true}
          modularScroll={banners.length > 1}
          className="-mx-2 px-2"
          viewportClassName="p-2 pb-6"
          trackClassName="gap-5"
          previousButtonLabel="Promotions precedentes"
          nextButtonLabel="Promotions suivantes"
        >
          {banners.map((promotion) => (
            <Link
              key={promotion.id}
              href={promotion.href}
              className="group relative block min-h-[24rem] w-[88vw] shrink-0 overflow-hidden rounded-3xl bg-[#14202e] text-white shadow-[0_30px_80px_rgba(20,32,46,0.18)] md:w-[45rem] lg:w-[58rem]"
            >
              <Image
                src={promotion.bannerImageUrl!}
                alt={promotion.bannerImageAlt}
                fill
                sizes="(min-width: 1024px) 58rem, 88vw"
                className="object-cover transition duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,17,29,0.88),rgba(7,17,29,0.48),rgba(7,17,29,0.18))]" />
              <div className="absolute inset-x-0 bottom-0 p-7 md:p-10">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#8fdcff] backdrop-blur">
                  <BadgePercent className="h-3.5 w-3.5" aria-hidden="true" />
                  {promotion.discountLabel}
                </span>
                <h3 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight md:text-6xl">
                  {promotion.displayName}
                </h3>
                {promotion.description ? (
                  <p className="mt-4 max-w-xl text-sm leading-7 text-white/72 md:text-base">
                    {promotion.description}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </RailCarousel>
      </div>
    </section>
  );
}

export function PromotionShowcase({ promotions }: { promotions: PublicPromotion[] }) {
  if (promotions.length === 0) {
    return null;
  }

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute left-3 top-0 hidden h-full w-px bg-[#14202e]/10 lg:block" />
      <div className="divide-y divide-[#14202e]/10">
        {promotions.map((promotion, index) => {
          const cards = promotion.productCards;

          return (
            <section key={promotion.id} className="relative py-16 first:pt-0 last:pb-0 md:py-20">
              <div className="pointer-events-none absolute left-0 top-20 hidden h-2 w-7 border-y border-[#14202e]/20 lg:block" />
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0a8dc1]">
                    {String(index + 1).padStart(2, "0")} / {promotionTypeLabels[promotion.kind]}
                  </p>
                  <h2 className="mt-3 text-4xl font-semibold leading-tight text-[#14202e] md:text-6xl">
                    {promotion.displayName}
                  </h2>
                  {promotion.description ? (
                    <p className="mt-4 text-base leading-8 text-[#5f6872]">
                      {promotion.description}
                    </p>
                  ) : null}
                </div>
                <Link
                  href={promotion.href}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#14202e] px-5 text-xs font-black uppercase tracking-[0.18em] text-white shadow-[0_14px_30px_rgba(20,32,46,0.18)] transition hover:bg-[#0a8dc1]"
                >
                  Voir les produits
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              {cards.length > 0 ? (
                <RailCarousel
                  autoScroll={false}
                  showButtons="on-hover"
                  allowDrag={true}
                  applyPhysics={true}
                  modularScroll={false}
                  className="-mx-2 mt-8 px-2"
                  viewportClassName="p-2 pb-6"
                  trackClassName="gap-5"
                  previousButtonLabel="Produits precedents"
                  nextButtonLabel="Produits suivants"
                >
                  {cards.map((card) => (
                    <PromotionTargetCard
                      key={`${promotion.id}-${card.kind}-${card.id}`}
                      card={card}
                    />
                  ))}
                </RailCarousel>
              ) : (
                <div className="mt-8 rounded-2xl border border-dashed border-[#14202e]/15 bg-white/55 px-5 py-8 text-sm text-[#5f6872]">
                  <p>Cette offre concerne l&apos;ensemble du catalogue visible.</p>
                  <Link
                    href={promotion.href}
                    className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#14202e] transition hover:text-[#0a8dc1]"
                  >
                    Voir les produits concernes
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
