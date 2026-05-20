import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Phone } from "lucide-react";

import { COBAM_SOCIAL_LINKS } from "@/data/contact-details";
import { CategoryJourneyParallax } from "@/components/public/home/category-journey-parallax";
import type { PublicArticleSummary } from "@/features/articles/public";
import { LiquidHero } from "./liquid-hero";

export type JourneySubcategory = {
  label: string;
  href: string;
};

export type JourneyCategory = {
  id: string;
  number: string;
  name: string;
  subtitle: string;
  href: string;
  image: string;
  imageAlt: string;
  subcategories: JourneySubcategory[];
  imageNeedsReplacement?: boolean;
  isPromoted?: boolean;
};

export type BrandLogo = {
  id: string;
  name: string;
  image: string;
  href: string;
};

export type ShowroomLocation = {
  name: string;
  label: string;
  address: string;
  phone: string;
  image: string;
  map: string;
};

const collections = [
  {
    title: "Marbre clair",
    subtitle: "Surfaces lumineuses, grands formats et détails minéraux.",
    image: "/images/collections/faedo-marbre-blanc-353x353.jpg",
    href: "/produits?search=marbre",
  },
  {
    title: "Salle de bain premium",
    subtitle: "Vasques, colonnes de douche et robinetterie précise.",
    image: "/images/collections/vasque-ovale-premium-353x353.jpg",
    href: "/produits?search=vasque",
  },
  {
    title: "Piscine & extérieur",
    subtitle: "Mosaïques, margelles et matières fraîches pour espaces d'eau.",
    image: "/images/collections/carrelage-piscine-353x353.jpg",
    href: "/produits?search=piscine",
  },
  {
    title: "Bois naturel",
    subtitle: "Chaleur, portes et finitions bois pour transitions intérieures.",
    image: "/images/collections/decor-bois-naturel-353x353.jpg",
    href: "/produits?search=bois",
  },
  {
    title: "Minéral urbain",
    subtitle: "Gris, béton, textures sobres et surfaces techniques.",
    image: "/images/collections/tessino-gris-353x353.jpg",
    href: "/produits?search=gris",
  },
  {
    title: "Eau & chrome",
    subtitle: "Mitigeurs, reflets et équipements au geste quotidien.",
    image: "/images/collections/mitigeur-cascade-353x353.jpg",
    href: "/produits?search=mitigeur",
  },
];

function revealDelay(ms: number): CSSProperties {
  return { "--reveal-delay": `${ms}ms` } as CSSProperties;
}

function formatArticleDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Tunis",
  }).format(new Date(value));
}

export function LandingHero({ categories }: { categories: JourneyCategory[] }) {
  return <LiquidHero categories={categories} />;
}


export function AboutNutshell() {
  return (
    <section className="bg-[#f4f1eb] py-20 md:py-28">
      <div className="mx-auto grid max-w-[1500px] gap-10 px-5 sm:px-8 lg:grid-cols-[0.78fr_1fr] lg:px-12">
        <div data-landing-reveal>
          <p className="cobam-section-kicker text-[#0a8dc1]">COBAM en bref</p>
          <h2 className="cobam-editorial-title mt-4">Une maison de matières, depuis 1994.</h2>
        </div>
        <div className="grid gap-8" data-landing-reveal>
          <p className="max-w-3xl text-xl leading-9 text-[#56606b]">
            COBAM Group accompagne les professionnels et les particuliers dans le choix de matériaux, revêtements, équipements et finitions capables de transformer un projet en espace durable, précis et élégant.
          </p>
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              ["30+", "années d'expertise"],
              ["5,000+", "références produits"],
              ["4", "showrooms en Tunisie"],
              ["1994", "année de création"],
            ].map(([value, label], index) => (
              <div
                key={label}
                className="cobam-motion-card border-t border-[#14202e]/14 pt-5"
                data-landing-reveal
                style={revealDelay(index * 70)}
              >
                <p className="text-4xl font-semibold text-[#14202e]">{value}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-[#59636e]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function CategoryJourneySection({ categories }: { categories: JourneyCategory[] }) {
  return <CategoryJourneyParallax categories={categories} />;
}

export function CollectionsSection() {
  return (
    <section className="bg-[#f4f1eb] py-24 md:py-32">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1fr] lg:items-end" data-landing-reveal>
          <div>
            <p className="cobam-section-kicker text-[#0a8dc1]">Collections</p>
            <h2 className="cobam-editorial-title mt-4">Inspirations prêtes à explorer.</h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-[#56606b]">
            Une sélection visuelle de matières et d&apos;équipements pour passer plus vite de l&apos;idée à la bonne famille de produits.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection, index) => (
            <Link
              key={collection.title}
              href={collection.href}
              className={index === 0 ? "cobam-motion-card group relative min-h-[30rem] overflow-hidden bg-[#14202e] lg:row-span-2" : "cobam-motion-card group relative min-h-[19rem] overflow-hidden bg-[#14202e]"}
              data-landing-reveal
              data-parallax-speed={index % 2 === 0 ? "0.025" : "-0.018"}
              style={revealDelay(index * 55)}
            >
              <Image
                src={collection.image}
                alt={collection.title}
                fill
                sizes="(min-width: 1024px) 33vw, 100vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07111d]/84 via-[#07111d]/16 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="cobam-section-kicker text-[#8fdcff]">Collection</p>
                <h3 className="mt-3 text-3xl font-semibold">{collection.title}</h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-white/70">{collection.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function NewsSection({ articles }: { articles: PublicArticleSummary[] }) {
  const latestArticles = articles.slice(0, 3);

  if (latestArticles.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#f4f1eb] py-24 md:py-32">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1fr] lg:items-end" data-landing-reveal>
          <div>
            <p className="cobam-section-kicker text-[#0a8dc1]">Actualités</p>
            <h2 className="cobam-editorial-title mt-4">Nos actualités.</h2>
          </div>
          <div className="flex flex-col gap-6 lg:items-end">
            <p className="max-w-2xl text-lg leading-8 text-[#56606b]">
              Conseils, inspirations et nouveautés pour choisir les bonnes matières et accompagner vos projets.
            </p>
            <Link href="/actualites" className="cobam-premium-button cobam-premium-button-line">
              Voir toutes les actualités
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {latestArticles.map((article, index) => {
            const imageUrl = article.coverImageThumbnailUrl ?? article.coverImageUrl;

            return (
              <Link
                key={article.id}
                href={`/actualites/${article.slug}`}
                className="cobam-motion-card group flex min-h-[31rem] flex-col overflow-hidden border border-[#14202e]/10 bg-white/62 shadow-sm transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl"
                data-landing-reveal
                style={revealDelay(index * 65)}
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-[#14202e]">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={article.coverImageAlt ?? article.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-8 text-center text-sm font-semibold text-white/55">
                      {article.title}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07111d]/58 via-transparent to-transparent" />
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <p className="cobam-section-kicker text-[#0a8dc1]">
                    {formatArticleDate(article.publishedAt ?? article.createdAt)}
                  </p>
                  <h3 className="mt-4 text-3xl font-semibold leading-tight text-[#14202e]">
                    {article.title}
                  </h3>
                  <p className="mt-4 line-clamp-3 text-sm leading-7 text-[#56606b]">
                    {article.excerpt}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-2 pt-8 text-xs font-black uppercase tracking-[0.16em] text-[#14202e] transition group-hover:text-[#0a8dc1]">
                    Lire l&apos;article
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function BrandConstellation({ brands }: { brands: BrandLogo[] }) {
  if (!brands.length) return null;

  return (
    <section className="bg-[#f4f1eb] py-24 md:py-32">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1fr] lg:items-end" data-landing-reveal>
          <div>
            <p className="cobam-section-kicker text-[#0a8dc1]">Marques</p>
            <h2 className="cobam-editorial-title mt-4">Une constellation de marques</h2>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/partenaires" className="cobam-premium-button cobam-premium-button-navy">
                Nos partenaires
              </Link>
              <Link href="/references" className="cobam-premium-button cobam-premium-button-line">
                Nos références
              </Link>
            </div>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-[#56606b]">
            Les références COBAM se découvrent sans bruit : un réseau de fabricants et de partenaires pour chaque étape du projet.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 border-l border-t border-[#14202e]/10 sm:grid-cols-3 lg:grid-cols-6">
          {brands.slice(0, 24).map((brand) => (
            <Link
              key={brand.id}
              href={brand.href}
              className="cobam-motion-card group flex h-32 items-center justify-center border-b border-r border-[#14202e]/10 bg-white/42 p-6 transition duration-300 hover:bg-white"
              data-landing-reveal
            >
              <Image
                src={brand.image}
                alt={brand.name}
                width={160}
                height={72}
                className="max-h-14 w-auto object-contain grayscale opacity-55 transition duration-300 group-hover:grayscale-0 group-hover:opacity-100"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ShowroomSection({ showrooms }: { showrooms: ShowroomLocation[] }) {
  return (
    <section id="showrooms" className="bg-[#e8e1d7] py-24 md:py-32">
      <div className="mx-auto grid max-w-[1500px] gap-10 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
        <div className="cobam-motion-card relative min-h-[560px] overflow-hidden bg-[#14202e]" data-landing-reveal data-parallax-speed="0.035">
          <Image
            src="/images/showrooms/siege.png"
            alt="Showroom COBAM Group"
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="cobam-parallax-layer object-cover"
            data-parallax-speed="-0.025"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07111d]/72 via-transparent to-transparent" />
        </div>

        <div className="flex flex-col justify-center" data-landing-reveal>
          <p className="cobam-section-kicker text-[#0a8dc1]">Showrooms</p>
          <h2 className="cobam-editorial-title mt-4">Voir, toucher, comparer.</h2>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#56606b]">
            Nos showrooms vous accueillent pour transformer l&apos;inspiration en choix concret.
          </p>
          <div className="mt-10 divide-y divide-[#14202e]/12 border-y border-[#14202e]/12">
            {showrooms.map((showroom, index) => (
              <article
                key={showroom.name}
                className="cobam-motion-card py-6"
                data-landing-reveal
                style={revealDelay(index * 60)}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="cobam-section-kicker text-[#0a8dc1]">{showroom.label}</p>
                    <h3 className="mt-2 text-2xl font-semibold">{showroom.name}</h3>
                    <p className="mt-3 flex gap-3 text-sm leading-6 text-[#56606b]">
                      <MapPin className="mt-1 h-4 w-4 shrink-0 text-[#0a8dc1]" aria-hidden="true" />
                      {showroom.address}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <a href={`tel:${showroom.phone.replace(/\s/g, "")}`} className="cobam-icon-action" aria-label={`Appeler ${showroom.name}`}>
                      <Phone className="h-4 w-4" aria-hidden="true" />
                    </a>
                    <a href={showroom.map} target="_blank" rel="noreferrer" className="cobam-icon-action" aria-label={`Itinéraire ${showroom.name}`}>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-[#14202e] py-24 text-white md:py-36">
      <Image
        src="/images/hero-section/2.jpg"
        alt="Ambiance matière et lumière COBAM Group"
        fill
        sizes="100vw"
        className="cobam-parallax-layer object-cover opacity-34"
        data-parallax-speed="-0.03"
      />
      <div className="absolute inset-0 bg-[#07111d]/78" />
      <div className="relative mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12" data-landing-reveal>
        <p className="cobam-section-kicker text-[#8fdcff]">Projet</p>
        <h2 className="mt-5 max-w-5xl text-balance text-6xl font-normal leading-[0.9] md:text-9xl" style={{ fontFamily: "var(--font-playfair), serif" }}>
          Votre projet commence par la bonne matière.
        </h2>
        <p className="mt-8 max-w-2xl text-lg leading-8 text-white/72">
          Parcourez le catalogue COBAM Group ou contactez notre équipe pour construire, rénover et sublimer vos espaces.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/produits" className="cobam-premium-button cobam-premium-button-light">
            Explorer le catalogue
          </Link>
          <Link href="/contact" className="cobam-premium-button cobam-premium-button-ghost">
            Nous contacter
          </Link>
        </div>
      </div>
    </section>
  );
}

export function SocialLinksSection() {
  return (
    <section className="bg-[#07111d] py-16 text-white">
      <div className="mx-auto grid max-w-[1500px] gap-8 px-5 sm:px-8 lg:grid-cols-[0.75fr_1fr] lg:items-center lg:px-12">
        <div data-landing-reveal>
          <p className="cobam-section-kicker text-[#8fdcff]">Réseaux sociaux</p>
          <h2 className="mt-4 text-4xl font-normal leading-tight md:text-6xl" style={{ fontFamily: "var(--font-playfair), serif" }}>
            Suivez les matières, les projets et les nouveautés.
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {COBAM_SOCIAL_LINKS.map((social, index) => {
            const Icon = social.Icon;

            return (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="cobam-motion-card group flex items-center justify-between border border-white/12 bg-white/[0.04] p-4 transition hover:border-[#8fdcff]/60 hover:bg-white/[0.08]"
                data-landing-reveal
                style={revealDelay(index * 55)}
              >
                <span>
                  <span className="block text-sm font-semibold">{social.label}</span>
                  <span className="mt-1 block text-xs text-white/50">{social.handle}</span>
                </span>
                <Icon className="h-5 w-5 text-[#8fdcff] transition group-hover:scale-110" aria-hidden="true" />
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
