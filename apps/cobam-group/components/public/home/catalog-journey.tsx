import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Phone } from "lucide-react";

import { cn } from "@/lib/utils";
import { HeroMotionShell } from "@/components/public/home/hero-motion";

export type JourneySubcategory = {
  label: string;
  href: string;
};

export type JourneyWorld = {
  id: string;
  number: string;
  world: string;
  categoryTitle: string;
  title: string;
  subtitle: string;
  href: string;
  cta: string;
  image: string;
  imageAlt: string;
  subcategories: JourneySubcategory[];
  imageNeedsReplacement?: boolean;
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

export function LandingHero({ worlds }: { worlds: JourneyWorld[] }) {
  const heroSlides = [
    {
      src: "/images/hero-section/3.jpg",
      alt: "Composition architecturale sombre autour des matières COBAM",
      label: "Architecture",
    },
    {
      src: "/images/hero-section/2.jpg",
      alt: "Salle de bain et matière premium COBAM",
      label: "Eau",
    },
    ...worlds.slice(0, 2).map((world) => ({
      src: world.image,
      alt: world.imageAlt,
      label: world.world,
    })),
  ].filter((slide, index, slides) => slides.findIndex((item) => item.src === slide.src) === index);

  return (
    <HeroMotionShell slides={heroSlides}>
      <div className="mx-auto grid min-h-[calc(100svh-7rem)] max-w-[1500px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:py-20">
        <div className="cobam-hero-copy relative z-10 flex flex-col justify-center">
          <p className="cobam-section-kicker text-[#8fdcff]">Depuis 1994 / COBAM Group</p>
          <h1
            className="mt-6 max-w-5xl text-balance text-[clamp(4rem,8.5vw,8rem)] font-normal leading-[0.84]"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            L&apos;architecture des matières.
          </h1>
          <p className="mt-7 max-w-2xl text-pretty text-lg leading-8 text-white/74 md:text-xl">
            Un parcours à travers les univers COBAM Group : de l&apos;eau à la surface, de la structure à la signature finale.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="#parcours" className="cobam-premium-button cobam-premium-button-light">
              Commencer le parcours
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/produits" className="cobam-premium-button cobam-premium-button-ghost">
              Explorer le catalogue
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

      </div>


    </HeroMotionShell>
  );
}

export function JourneyIndex({ worlds }: { worlds: JourneyWorld[] }) {
  return (
    <section id="parcours" className="bg-[#f4f1eb] py-20 md:py-28">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1fr] lg:items-end">
          <div>
            <p className="cobam-section-kicker text-[#0a8dc1]">Index du parcours</p>
            <h2 className="cobam-editorial-title mt-4">Les sept univers.</h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-[#56606b]">
            Une entrée plus naturelle dans le catalogue : partir d&apos;une sensation, puis rejoindre la bonne famille de produits.
          </p>
        </div>

        <div className="mt-14 divide-y divide-[#14202e]/12 border-y border-[#14202e]/12">
          {worlds.map((world) => (
            <Link key={world.id} href={`#${world.id}`} className="cobam-journey-index-row group">
              <span className="text-sm font-semibold text-[#0a8dc1]">{world.number}</span>
              <strong>{world.world}</strong>
              <em>{world.categoryTitle}</em>
              <p>{world.subtitle}</p>
              <ArrowRight className="h-5 w-5 transition duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SubcategoryList({ items }: { items: JourneySubcategory[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {items.map((item, index) => (
        <li key={`${item.label}-${index}`}>
          <Link href={item.href} className="cobam-subcategory-link">
            <span>{String(index + 1).padStart(2, "0")}</span>
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function CatalogChapter({
  world,
  reverse = false,
  quiet = false,
}: {
  world: JourneyWorld;
  reverse?: boolean;
  quiet?: boolean;
}) {
  return (
    <section id={world.id} className={cn("cobam-catalog-chapter", quiet ? "is-quiet" : "")}>
      <div className={cn("mx-auto grid max-w-[1500px] gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:px-12", reverse ? "lg:[&>*:first-child]:order-2" : "")}>
        <div className="flex flex-col justify-center py-8 lg:py-16">
          <p className="cobam-section-kicker text-[#0a8dc1]">{world.number} / {world.world}</p>
          <h2 className="mt-5 max-w-3xl text-balance text-6xl font-normal leading-[0.9] md:text-8xl" style={{ fontFamily: "var(--font-playfair), serif" }}>
            {world.title}
          </h2>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-[#56606b] md:text-xl">{world.subtitle}</p>
          <div className="mt-10">
            <SubcategoryList items={world.subcategories} />
          </div>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href={world.href} className="cobam-premium-button cobam-premium-button-navy">
              {world.cta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link href="/produits" className="cobam-premium-button cobam-premium-button-line">
              Voir les produits
            </Link>
          </div>
        </div>

        <figure className="relative min-h-[520px] overflow-hidden bg-[#14202e] lg:min-h-[720px]">
          <Image
            src={world.image}
            alt={world.imageAlt}
            fill
            sizes="(min-width: 1024px) 48vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07111d]/54 via-transparent to-transparent" />
          <figcaption className="absolute bottom-6 left-6 right-6 border-t border-white/24 pt-4 text-xs font-semibold uppercase tracking-[0.24em] text-white/78">
            {world.categoryTitle}
            {world.imageNeedsReplacement ? <span className="ml-3 text-[#8fdcff]">Image à remplacer</span> : null}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

export function BrandConstellation({ brands }: { brands: BrandLogo[] }) {
  if (!brands.length) return null;

  return (
    <section className="bg-[#f4f1eb] py-24 md:py-32">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1fr] lg:items-end">
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
            <Link key={brand.id} href={brand.href} className="group flex h-32 items-center justify-center border-b border-r border-[#14202e]/10 bg-white/42 p-6 transition duration-300 hover:bg-white">
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
        <div className="relative min-h-[560px] overflow-hidden bg-[#14202e]">
          <Image
            src="/images/showrooms/siege.png"
            alt="Showroom COBAM Group"
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07111d]/72 via-transparent to-transparent" />
        </div>

        <div className="flex flex-col justify-center">
          <p className="cobam-section-kicker text-[#0a8dc1]">Showrooms</p>
          <h2 className="cobam-editorial-title mt-4">Voir, toucher, comparer.</h2>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-[#56606b]">
            Nos showrooms vous accueillent pour transformer l&apos;inspiration en choix concret.
          </p>
          <div className="mt-10 divide-y divide-[#14202e]/12 border-y border-[#14202e]/12">
            {showrooms.map((showroom) => (
              <article key={showroom.name} className="py-6">
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
        className="object-cover opacity-34"
      />
      <div className="absolute inset-0 bg-[#07111d]/78" />
      <div className="relative mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
        <p className="cobam-section-kicker text-[#8fdcff]">Projet</p>
        <h2 className="mt-5 max-w-5xl text-balance text-6xl font-normal leading-[0.9] md:text-9xl" style={{ fontFamily: "var(--font-playfair), serif" }}>
          Votre projet commence par la bonne matière.
        </h2>
        <p className="mt-8 max-w-2xl text-lg leading-8 text-white/72">
          Parcourez le catalogue COBAM Group ou visitez nos showrooms pour construire, rénover et sublimer vos espaces.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/produits" className="cobam-premium-button cobam-premium-button-light">
            Explorer le catalogue
          </Link>
          <Link href="/contact#showrooms" className="cobam-premium-button cobam-premium-button-ghost">
            Trouver un showroom
          </Link>
          <Link href="/contact" className="cobam-premium-button cobam-premium-button-ghost">
            Nous contacter
          </Link>
        </div>
      </div>
    </section>
  );
}
