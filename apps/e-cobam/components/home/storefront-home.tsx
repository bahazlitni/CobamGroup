"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ChevronRight,
  Search,
  Truck,
  Award,
  ShieldCheck,
  Globe,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

import { ProductCard } from "@/components/commerce/product-card";
import { InfinityRailCarousel, RailCarousel } from "@/components/commerce/rail-carousel";
import { SafeMediaImage } from "@/components/home/safe-media-image";
import { HeroSlider } from "@/components/home/hero-slider";
import { formatCompactNumber } from "@/lib/format";
import type {
  LandingBrand,
  LandingCategory,
  LandingHomeData,
  LandingProduct,
  LandingProductsState,
} from "@/lib/home-data";

function firstReadyItems(primary: LandingProductsState, fallback: LandingProductsState) {
  if (primary.status === "ready" && primary.items.length > 0) {
    return primary.items;
  }

  return fallback.status === "ready" ? fallback.items : [];
}

function productCountLabel(value: number | null) {
  if (value == null) return "Catalogue";
  if (value <= 0) return "Voir le rayon";
  return `${formatCompactNumber(value)} produits`;
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between border-b border-ec-line pb-6">
      <div>
        {eyebrow && (
          <span className="text-ec-brass font-sans text-xs font-black tracking-[0.22em] uppercase block mb-2">
            {eyebrow}
          </span>
        )}
        <h2 className="text-ec-ink font-serif text-3xl md:text-4xl font-semibold tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-ec-muted mt-2 text-sm max-w-2xl font-medium leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="text-ec-ink hover:text-ec-blue inline-flex items-center gap-1.5 font-sans text-xs font-bold tracking-[0.1em] uppercase transition duration-300 group mt-2 md:mt-0"
        >
          {action.label}
          <ArrowRight
            className="size-3.5 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      )}
    </div>
  );
}

function CategoryCard({ category }: { category: LandingCategory }) {
  return (
    <Link
      href={category.href}
      className="group relative block aspect-[3/4.2] overflow-hidden bg-ec-stone transition-all duration-500 border border-ec-line"
    >
      {category.imageUrl ? (
        <SafeMediaImage
          src={category.imageUrl}
          alt={category.name}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] h-full w-full"
          fallback={category.name}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-tr from-ec-stone to-ec-stone-strong" />
      )}

      {/* Luxury Dark Semi-gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-ec-ink/90 via-ec-ink/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity duration-500" />

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
        <span className="text-ec-brass font-sans text-[0.65rem] font-bold tracking-[0.2em] uppercase mb-1 block">
          {productCountLabel(category.productCount)}
        </span>
        <h3 className="text-white font-serif text-xl md:text-2xl font-semibold leading-tight mb-2 group-hover:text-ec-brass transition-colors duration-300">
          {category.name}
        </h3>
        {category.subtitle && (
          <p className="text-white/70 text-xs font-medium leading-relaxed line-clamp-2 max-h-0 group-hover:max-h-12 overflow-hidden transition-all duration-500 ease-out opacity-0 group-hover:opacity-100">
            {category.subtitle}
          </p>
        )}
        <div className="mt-4 flex items-center gap-1 text-white font-sans text-xs font-bold tracking-[0.1em] uppercase opacity-80 group-hover:opacity-100 transition-opacity duration-300">
          Découvrir
          <ChevronRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

function ProductShelf({
  title,
  subtitle,
  eyebrow,
  products,
  actionHref = "/catalogue",
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  products: LandingProduct[];
  actionHref?: string;
}) {
  return (
    <section className="bg-white py-20 sm:py-28 border-b border-ec-line/60">
      <div className="commerce-container">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          action={{ href: actionHref, label: "Découvrir tout" }}
        />
        {products.length > 0 ? (
          <RailCarousel
            itemClassName="w-[17.5rem] sm:w-[19rem] lg:w-[20.5rem]"
            viewportClassName="-mx-4 px-4"
            trackClassName="gap-5"
            previousLabel={`${title} precedents`}
            nextLabel={`${title} suivants`}
          >
            {products.slice(0, 12).map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                variants={{
                  hidden: { opacity: 0, y: 25 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
                }}
                className="h-full"
              >
                <ProductCard product={product} className="h-full" />
              </motion.div>
            ))}
          </RailCarousel>
        ) : (
          <EmptyProducts />
        )}
      </div>
    </section>
  );
}

function EmptyProducts() {
  return (
    <div className="border border-ec-line bg-ec-paper p-12 text-center">
      <Search className="text-ec-blue mx-auto size-8" aria-hidden="true" />
      <p className="text-ec-ink mt-3 font-serif text-xl font-semibold">
        Produits indisponibles pour le moment.
      </p>
      <Link href="/catalogue" className="text-ec-blue mt-2 inline-flex text-sm font-black">
        Ouvrir le catalogue
      </Link>
    </div>
  );
}

function StorySection() {
  return (
    <section className="bg-ec-ink text-white py-20 sm:py-28 relative overflow-hidden border-b border-ec-line/20">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="commerce-container grid gap-12 lg:grid-cols-2 lg:items-center">
        {/* Left Side: Story Text */}
        <div className="max-w-xl">
          <span className="text-ec-brass font-sans text-xs font-black tracking-[0.25em] uppercase block mb-4">
            COBAM GROUP
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
            La signature des architectures d&apos;exception.
          </h2>
          <p className="mt-6 text-white/70 text-base leading-relaxed font-medium">
            Depuis notre création, nous sélectionnons et distribuons les matériaux de second œuvre les
            plus raffinés. Notre vocation est d&apos;accompagner les architectes, designers et maîtres d&apos;ouvrage
            dans la réalisation de projets résidentiels et commerciaux uniques en Tunisie.
          </p>
          <p className="mt-4 text-white/75 text-sm leading-relaxed font-medium">
            De la céramique d&apos;élite aux finitions de salle de bain de haute technologie, en passant par
            les revêtements extérieurs les plus exigeants, chaque référence de notre catalogue incarne la
            durabilité technique et l&apos;harmonie visuelle.
          </p>

          <div className="mt-8 flex flex-wrap gap-6 items-center">
            <Link
              href="/catalogue"
              className="inline-flex h-12 items-center justify-center bg-white hover:bg-ec-brass hover:text-white px-6 font-sans text-xs font-bold tracking-[0.1em] uppercase text-ec-ink transition-all duration-300"
            >
              Découvrir le catalogue
            </Link>
            <a
              href="mailto:contact@cobamgroup.tn"
              className="text-white hover:text-ec-brass text-xs font-bold tracking-[0.15em] uppercase flex items-center gap-2 group transition duration-300"
            >
              Nous contacter
              <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        {/* Right Side: Editorial Image Block */}
        <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] w-full bg-ec-primary/50 overflow-hidden border border-white/10 group">
          <Image
            src="/images/hero-banners/sopal-banner.png"
            alt="Showroom COBAM"
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-80"
            sizes="(min-width: 1024px) 45vw, 92vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ec-ink via-transparent to-transparent opacity-60 pointer-events-none" />
          <div className="absolute bottom-6 left-6 right-6 text-white pointer-events-none">
            <span className="text-ec-brass font-sans text-[0.6rem] font-bold tracking-[0.2em] uppercase">
              Showroom Excellence
            </span>
            <p className="font-serif text-lg font-semibold mt-1">
              Des conseils personnalisés pour vos plans sur-mesure.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryShortcuts({ categories }: { categories: LandingCategory[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="bg-white py-20 sm:py-28 border-b border-ec-line/60">
      <div className="commerce-container">
        <SectionHeader
          eyebrow="Rayons"
          title="Acheter par catégorie"
          action={{ href: "/catalogue", label: "Voir tout le catalogue" }}
        />
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {categories.slice(0, 8).map((category) => (
            <motion.div
              key={category.slug}
              variants={{
                hidden: { opacity: 0, y: 25 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
              }}
            >
              <CategoryCard category={category} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const promos = [
  {
    title: "Sélection carrelage",
    text: "Formats, décors et finitions à commander.",
    href: "/catalogue?search=carrelage",
  },
  {
    title: "Packs salle de bain",
    text: "Sanitaires, robinetterie et accessoires.",
    href: "/catalogue?search=salle%20de%20bain",
  },
  {
    title: "Nouveaux arrivages piscine",
    text: "Mosaïques et finitions extérieures.",
    href: "/catalogue?search=piscine",
  },
];

function PromotionsSection() {
  return (
    <section id="promotions" className="bg-ec-paper py-20 sm:py-28 border-b border-ec-line/60">
      <div className="commerce-container">
        <SectionHeader
          eyebrow="Privilèges"
          title="Collections & Services Exclusifs"
          subtitle="Des offres conçues pour accompagner vos chantiers et projets résidentiels d'exception."
          action={{ href: "/catalogue?sélection=promotion", label: "Voir toutes les offres" }}
        />

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Main Hero Promotion */}
          <Link
            href="/catalogue?sélection=promotion"
            className="bg-ec-ink group relative overflow-hidden p-8 sm:p-12 text-white flex flex-col justify-between min-h-[380px] transition-all duration-500 border border-transparent hover:border-ec-brass/30"
          >
            {/* Elegant luxury gradient overlay */}
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(176,138,90,0.18),transparent_55%),radial-gradient(circle_at_10%_90%,rgba(10,141,193,0.12),transparent_50%)] pointer-events-none" />

            <div>
              <span className="text-ec-brass block font-sans text-xs font-black tracking-[0.25em] uppercase mb-4">
                Service logistique
              </span>
              <h3 className="relative max-w-xl font-serif text-3xl sm:text-4xl md:text-5xl leading-tight font-semibold">
                Livraison offerte pour vos projets d&apos;envergure
              </h3>
              <p className="relative mt-4 max-w-lg text-sm leading-relaxed text-white/70 font-medium">
                Optimisez la gestion de votre chantier. Préparez votre panier de finitions en ligne et
                profitez d&apos;une livraison sécurisée et coordonnée directement sur site.
              </p>
            </div>

            <div className="mt-8">
              <span className="inline-flex h-12 items-center gap-3 border border-white/20 bg-white/5 hover:bg-white hover:text-ec-ink px-6 font-sans text-xs font-bold tracking-[0.1em] uppercase transition-all duration-300">
                En savoir plus
                <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

          {/* Side Promo Cards */}
          <div className="flex flex-col gap-6">
            {promos.map((promo) => (
              <PromoCard key={promo.title} {...promo} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PromoCard({ title, text, href }: { title: string; text: string; href: string }) {
  return (
    <Link
      href={href}
      className="border border-ec-line hover:border-ec-brass/35 group bg-white p-6 md:p-8 transition-all duration-300 flex flex-col justify-between min-h-[110px]"
    >
      <div>
        <h4 className="text-ec-ink block font-serif text-xl font-semibold group-hover:text-ec-blue transition-colors duration-300">
          {title}
        </h4>
        <p className="text-ec-muted mt-2 text-sm font-semibold max-w-md">
          {text}
        </p>
      </div>
      <div className="mt-4 flex items-center gap-2 text-ec-brass font-sans text-xs font-bold tracking-[0.15em] uppercase">
        Découvrir
        <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

function LuxuryServices() {
  const services = [
    {
      icon: Award,
      title: "Qualité Certifiée",
      desc: "Chaque référence de notre catalogue fait l'objet d'un contrôle rigoureux de durabilité technique.",
    },
    {
      icon: ShieldCheck,
      title: "Accompagnement Commercial",
      desc: "Nos experts projets analysent vos plans et vous proposent des devis précis sous 24 à 48 heures.",
    },
    {
      icon: Truck,
      title: "Logistique Spécialisée",
      desc: "Des livraisons sécurisées directement sur votre chantier, coordonnées selon vos plannings de travaux.",
    },
    {
      icon: Globe,
      title: "Marques Internationales",
      desc: "Une sélection exclusive des meilleurs fabricants mondiaux pour garantir le prestige de vos finitions.",
    },
  ];

  return (
    <section className="bg-white py-20 sm:py-28 border-b border-ec-line/60">
      <div className="commerce-container">
        <SectionHeader
          eyebrow="Avantages"
          title="L'Engagement COBAM GROUP"
          subtitle="Plus qu'un catalogue en ligne, nous offrons une structure de service dédiée aux professionnels exigeants."
        />

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, idx) => (
            <div
              key={idx}
              className="border border-ec-line p-8 bg-ec-paper flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:border-ec-brass/40"
            >
              <div>
                <service.icon className="text-ec-brass size-6 stroke-[1.2]" />
                <h3 className="text-ec-ink font-serif text-lg font-semibold mt-6">
                  {service.title}
                </h3>
                <p className="text-ec-muted text-xs leading-relaxed mt-3 font-semibold">
                  {service.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="bg-ec-paper py-24 sm:py-32 border-b border-ec-line/60">
      <div className="commerce-container max-w-4xl text-center">
        <span className="text-ec-brass font-sans text-xs font-black tracking-[0.25em] uppercase block mb-6">
          Témoignages
        </span>
        <blockquote className="text-ec-ink font-serif text-2xl sm:text-3xl md:text-4xl leading-snug font-medium max-w-3xl mx-auto">
          « Collaborer avec COBAM GROUP, c’est l’assurance d’obtenir des matériaux d&apos;une justesse
          esthétique parfaite et d&apos;une technicité irréprochable. Le service devis est un modèle du genre. »
        </blockquote>
        <cite className="mt-8 block not-italic">
          <span className="text-ec-ink block font-sans text-sm font-black uppercase tracking-wider">
            Cabinet Ben Jemaa & Associés
          </span>
          <span className="text-ec-muted text-xs font-semibold mt-1 block">
            Architectes DPLG — Tunis
          </span>
        </cite>
      </div>
    </section>
  );
}

function BrandLoop({ brands }: { brands: LandingBrand[] }) {
  if (brands.length === 0) return null;

  return (
    <section className="bg-white py-20 sm:py-28 border-b border-ec-line/60">
      <div className="commerce-container">
        <SectionHeader
          eyebrow="Partenaires"
          title="Marques disponibles"
          subtitle="Découvrez les leaders mondiaux de la construction et de la finition qui composent notre catalogue."
          action={{ href: "/catalogue", label: "Voir toutes les marques" }}
        />
        <InfinityRailCarousel
          className="border border-ec-line bg-white py-4"
          trackClassName="gap-4"
          itemClassName="w-[15rem] sm:w-[17rem] lg:w-[18rem]"
          duration={Math.max(26, brands.length * 4)}
        >
          {brands.slice(0, 16).map((brand) => (
            <Link
              key={brand.slug}
              href={brand.href}
              className="group flex min-h-32 flex-col justify-between border border-ec-line bg-white p-6 transition-all duration-300 hover:border-ec-brass/40 hover:bg-ec-stone/30"
              draggable={false}
            >
              {brand.logoUrl ? (
                <span className="relative block h-10 w-full">
                  <SafeMediaImage
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="object-contain object-left grayscale opacity-65 transition-all duration-500 group-hover:grayscale-0 group-hover:opacity-100"
                    fallback={brand.name}
                  />
                </span>
              ) : (
                <span className="text-ec-ink line-clamp-1 font-serif text-lg font-semibold group-hover:text-ec-blue transition-colors duration-300">
                  {brand.name}
                </span>
              )}
              <span className="text-ec-muted font-sans text-[0.65rem] font-bold tracking-wider mt-4">
                {formatCompactNumber(brand.productCount)} produits
              </span>
            </Link>
          ))}
        </InfinityRailCarousel>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="bg-ec-ink py-24 text-white relative overflow-hidden border-b border-ec-line/10">
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(176,138,90,0.12),transparent_60%)] pointer-events-none" />
      <div className="commerce-container flex flex-col gap-8 md:flex-row md:items-center md:justify-between relative z-10">
        <div>
          <span className="text-ec-brass font-sans text-xs font-black tracking-[0.25em] uppercase block mb-3">
            Votre Projet, Notre Priorité
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight leading-none">
            Donnez vie à vos plans d&apos;envergure.
          </h2>
          <p className="text-white/60 mt-3 text-sm max-w-xl font-medium">
            Préparez votre panier de finitions en ligne et validez les modalités avec notre équipe
            commerciale dédiée.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
          <Link
            href="/catalogue"
            className="inline-flex h-13 items-center justify-center bg-white hover:bg-ec-brass hover:text-white px-6 font-sans text-xs font-bold tracking-[0.15em] uppercase text-ec-ink transition-all duration-300"
          >
            Explorer
          </Link>
          <Link
            href="/panier"
            className="inline-flex h-13 items-center justify-center border border-white/20 hover:border-white bg-transparent hover:bg-white/5 px-6 font-sans text-xs font-bold tracking-[0.15em] uppercase text-white transition-all duration-300"
          >
            Accéder à mon panier
          </Link>
        </div>
      </div>
    </section>
  );
}

function DiagnosticsNotice({ data }: { data: LandingHomeData }) {
  if (data.products.status !== "error") return null;

  return (
    <section className="bg-amber-50 py-4 text-amber-900">
      <div className="commerce-container flex items-center gap-3 text-sm font-semibold">
        <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
        {data.products.message}
      </div>
    </section>
  );
}

export function StorefrontHome({ data }: { data: LandingHomeData }) {
  const bestSellers = firstReadyItems(data.promotedProducts, data.products);
  const latestProducts = firstReadyItems(data.latestProducts, data.products);
  const recommendedProducts =
    data.products.status === "ready" ? data.products.items : latestProducts;

  return (
    <main className="bg-ec-paper overflow-hidden">
      <HeroSlider />
      <DiagnosticsNotice data={data} />
      <div id="best-sellers">
        <ProductShelf
          eyebrow="Exclusivités"
          title="Les plus demandés"
          products={bestSellers}
          actionHref="/catalogue?sélection=promotion"
        />
      </div>
      <div id="new-arrivals">
        <ProductShelf
          eyebrow="Nouveautés"
          title="Dernières Collections"
          products={latestProducts}
          actionHref="/catalogue?tri=latest"
        />
      </div>
      <div id="recommended">
        <ProductShelf
          eyebrow="Sélection"
          title="Recommandé pour vous"
          products={recommendedProducts}
        />
      </div>

      <CategoryShortcuts categories={data.categories} />
      <BrandLoop brands={data.brands} />
      <FinalCta />
    </main>
  );
}
