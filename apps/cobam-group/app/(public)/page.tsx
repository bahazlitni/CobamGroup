import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Droplets,
  Layers3,
  MapPin,
  Palette,
  Phone,
  Ruler,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { listPublicArticles } from "@/features/articles/public";
import { listPublicProductBrandOrganizations } from "@/features/organizations/public";
import { listPublicMegaMenuProductCategories } from "@/features/product-categories/public";
import type { PublicMegaMenuProductCategory } from "@/features/product-categories/public-types";
import { makeMediaPublicMany } from "@/features/media/repository";
import { prisma } from "@/lib/server/db/prisma";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "COBAM Group | L'architecture des matières",
  description:
    "Depuis 1994, COBAM Group sélectionne les revêtements, sanitaires, matériaux techniques et finitions premium pour les projets d'exception en Tunisie.",
};

export const dynamic = "force-dynamic";

type UniverseBlueprint = {
  title: string;
  eyebrow: string;
  description: string;
  match: string[];
  fallbackHref: string;
  fallbackImage: string;
  accent: string;
};

const heroBadges = [
  "Depuis 1994",
  "30+ années d'expertise",
  "5,000+ références",
  "4 showrooms",
];

const universeBlueprints: UniverseBlueprint[] = [
  {
    title: "Revêtements de sols et murs",
    eyebrow: "01 / Surfaces",
    description:
      "Carrelages, effets pierre, marbre, bois et grands formats pour composer des volumes précis.",
    match: ["revet", "sol", "mur", "carrelage"],
    fallbackHref: "/produits?category=revetements-de-sols-et-murs",
    fallbackImage: "/images/hero-section/1.jpg",
    accent: "#d6c3a3",
  },
  {
    title: "Matériaux de construction",
    eyebrow: "02 / Structure",
    description:
      "Solutions robustes pour bâtir, protéger et préparer les projets avec sérénité.",
    match: ["construction", "materiaux", "materiel"],
    fallbackHref: "/produits?category=materiaux-de-construction",
    fallbackImage: "/images/hero-section/2.jpg",
    accent: "#7f8792",
  },
  {
    title: "Isolation et étanchéité",
    eyebrow: "03 / Protection",
    description:
      "Des systèmes techniques fiables pour protéger les ouvrages de l'eau, du temps et des contraintes.",
    match: ["isolation", "etanche", "protection"],
    fallbackHref: "/produits?category=isolation-et-etancheite",
    fallbackImage: "/images/hero-section/3.jpg",
    accent: "#0a8dc1",
  },
  {
    title: "Salle de bain et cuisine",
    eyebrow: "04 / Eau",
    description:
      "Sanitaires, robinetterie, mobilier et équipements qui transforment l'usage quotidien en expérience.",
    match: ["bain", "cuisine", "sanitaire", "robinetterie"],
    fallbackHref: "/produits?category=salle-de-bain-et-cuisine",
    fallbackImage: "/images/hero-section/1.jpg",
    accent: "#e8edf0",
  },
  {
    title: "Peintures et décoration",
    eyebrow: "05 / Finition",
    description:
      "Couleurs, textures et effets décoratifs pour donner de la profondeur aux intérieurs.",
    match: ["peinture", "decoration", "couleur", "finition"],
    fallbackHref: "/produits?category=peintures-et-decoration",
    fallbackImage: "/images/hero-section/2.jpg",
    accent: "#a66f50",
  },
  {
    title: "Piscine",
    eyebrow: "06 / Extérieur",
    description:
      "Revêtements, équipements et ingénierie de l'eau pour créer des espaces aquatiques durables.",
    match: ["piscine", "aquatique"],
    fallbackHref: "/produits?category=piscine",
    fallbackImage: "/images/hero-section/3.jpg",
    accent: "#41b8d6",
  },
  {
    title: "Portes et menuiserie",
    eyebrow: "07 / Détail",
    description:
      "Des ouvertures et finitions qui signent les espaces avec précision et caractère.",
    match: ["porte", "menuiserie", "bois"],
    fallbackHref: "/produits?category=portes-et-menuiserie",
    fallbackImage: "/images/hero-section/2.jpg",
    accent: "#c9a06d",
  },
];

const materialPillars = [
  {
    title: "Sols & surfaces",
    text: "Du grand format minéral aux textures urbaines, les surfaces deviennent l'ossature visuelle du projet.",
    Icon: Layers3,
  },
  {
    title: "Eau & bien-être",
    text: "Robinetterie, sanitaire, piscine et équipements d'eau dessinés pour le confort et la maîtrise technique.",
    Icon: Droplets,
  },
  {
    title: "Structure & protection",
    text: "Isolation, étanchéité et solutions de chantier pour garantir la performance des ouvrages dans le temps.",
    Icon: ShieldCheck,
  },
  {
    title: "Couleur & finition",
    text: "Peintures, effets décoratifs et détails de menuiserie pour révéler la personnalité d'un lieu.",
    Icon: Palette,
  },
];

const stats = [
  { value: "30+", label: "années d'expertise", detail: "une culture durable de la matière" },
  { value: "5,000+", label: "références produits", detail: "pour chaque phase du projet" },
  { value: "4", label: "showrooms en Tunisie", detail: "des lieux pour voir et choisir" },
  { value: "1,000+", label: "clients accompagnés", detail: "professionnels et particuliers" },
];

const showrooms = [
  {
    name: "Houmt Souk",
    label: "Showroom 01",
    address: "Route de l'aéroport, Houmt Souk, Djerba",
    phone: "+216 75 650 650",
    image: "/images/showrooms/houmt-souk.png",
    map: "https://maps.google.com/?q=COBAM+Houmt+Souk+Djerba",
  },
  {
    name: "Siège",
    label: "Showroom 02",
    address: "Zone industrielle, Djerba",
    phone: "+216 75 653 000",
    image: "/images/showrooms/siege.png",
    map: "https://maps.google.com/?q=COBAM+Group+Djerba",
  },
  {
    name: "Céram",
    label: "Showroom 03",
    address: "Avenue principale, Djerba",
    phone: "+216 75 656 700",
    image: "/images/showrooms/ceram.png",
    map: "https://maps.google.com/?q=COBAM+Ceram+Djerba",
  },
  {
    name: "Midoun",
    label: "Showroom 04",
    address: "Route touristique, Midoun, Djerba",
    phone: "+216 75 730 730",
    image: "/images/showrooms/midoun.png",
    map: "https://maps.google.com/?q=COBAM+Midoun+Djerba",
  },
];

function normalizeLabel(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function buildPublicMediaUrl(mediaId: bigint | number, variant: "original" | "thumbnail" = "thumbnail") {
  return `/api/media/${mediaId.toString()}/file?variant=${variant}`;
}

async function listHomeFinishCards() {
  const finishes = await prisma.productFinish.findMany({
    where: {
      imageMediaId: {
        not: null,
      },
      imageMedia: {
        is: {
          kind: "IMAGE",
          isActive: true,
          deletedAt: null,
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }, { label: "asc" }, { id: "asc" }],
    take: 8,
    select: {
      id: true,
      key: true,
      label: true,
      color: true,
      imageMediaId: true,
    },
  });

  await makeMediaPublicMany(
    finishes
      .map((finish) => finish.imageMediaId)
      .filter((mediaId): mediaId is bigint => mediaId != null)
      .map(Number),
  );

  return finishes.flatMap((finish) => {
    if (finish.imageMediaId == null) {
      return [];
    }

    return [{
      id: Number(finish.id),
      title: finish.label,
      key: finish.key,
      color: finish.color,
      image: buildPublicMediaUrl(finish.imageMediaId, "thumbnail"),
      href: `/produits?search=${encodeURIComponent(finish.label)}`,
    }];
  });
}

function pickCategory(
  blueprint: UniverseBlueprint,
  categories: PublicMegaMenuProductCategory[],
  usedCategoryIds: Set<number | string>,
  index: number,
) {
  const matched = categories.find((category) => {
    const id = category.id ?? category.slug;
    if (usedCategoryIds.has(id)) return false;

    const searchable = normalizeLabel(
      `${category.title} ${category.subtitle ?? ""} ${category.descriptionSEO ?? ""} ${category.slug}`,
    );

    return blueprint.match.some((term) => searchable.includes(normalizeLabel(term)));
  });

  const fallback = matched ?? categories.find((category) => !usedCategoryIds.has(category.id ?? category.slug));

  if (fallback) {
    usedCategoryIds.add(fallback.id ?? fallback.slug);
  }

  return {
    ...blueprint,
    title: matched?.title ?? blueprint.title,
    href: matched?.href ?? fallback?.href ?? blueprint.fallbackHref,
    image: matched?.imageUrlHD || matched?.imageUrl || fallback?.imageUrlHD || fallback?.imageUrl || blueprint.fallbackImage,
    index: String(index + 1).padStart(2, "0"),
  };
}

export default async function HomePage() {
  const [articles, categories, brands, finishCards] = await Promise.all([
    listPublicArticles(),
    listPublicMegaMenuProductCategories(),
    listPublicProductBrandOrganizations(),
    listHomeFinishCards(),
  ]);

  const rootCategories = categories.filter((category) => !category.parent);
  const usedCategoryIds = new Set<number | string>();
  const universes = universeBlueprints.map((blueprint, index) =>
    pickCategory(blueprint, rootCategories, usedCategoryIds, index),
  );

  const brandLogos = brands
    .map((brand) => ({
      id: brand.slug || brand.name,
      name: brand.name,
      image: brand.logoUrl || brand.imageUrl,
    }))
    .filter((brand): brand is { id: string; name: string; image: string } => Boolean(brand.image));

  const marqueeBrands = [...brandLogos, ...brandLogos];
  const featuredArticles = articles.slice(0, 3);
  const materialPanelAssets = [
    {
      className: "left-0 top-14 h-64 w-44 rotate-[-8deg]",
      src: finishCards[0]?.image ?? universes[0]?.image ?? "/images/hero-section/1.jpg",
      alt: finishCards[0]?.title ?? universes[0]?.title ?? "Echantillon de matière COBAM",
    },
    {
      className: "right-8 top-0 h-80 w-52 rotate-[7deg]",
      src: finishCards[1]?.image ?? universes[3]?.image ?? "/images/hero-section/2.jpg",
      alt: finishCards[1]?.title ?? universes[3]?.title ?? "Echantillon architectural COBAM",
    },
    {
      className: "bottom-0 left-24 h-72 w-52 rotate-[3deg]",
      src: finishCards[2]?.image ?? universes[5]?.image ?? "/images/hero-section/3.jpg",
      alt: finishCards[2]?.title ?? universes[5]?.title ?? "Echantillon de surface COBAM",
    },
  ];
  const experiencePillars = materialPillars.map((pillar, index) => ({
    ...pillar,
    image:
      [
        universes[0]?.image,
        finishCards[0]?.image ?? universes[3]?.image,
        universes[2]?.image,
        finishCards[1]?.image ?? universes[4]?.image,
      ][index] ?? "/images/hero-section/1.jpg",
  }));

  return (
    <main className="cobam-home-shell bg-[#f4f1eb] text-[#14202e]">
      <section className="relative isolate min-h-[96svh] overflow-hidden bg-[#07111d] text-white">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-section/1.jpg"
            alt="Composition architecturale de matières premium COBAM Group"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_28%,rgba(10,141,193,0.35),transparent_32%),linear-gradient(95deg,rgba(7,17,29,0.98)_0%,rgba(7,17,29,0.76)_42%,rgba(7,17,29,0.24)_100%)]" />
          <div className="absolute inset-0 cobam-hero-grid opacity-55" />
          <div className="absolute inset-0 cobam-noise opacity-25" />
        </div>

        <div className="absolute right-[7vw] top-[18vh] hidden h-[52vh] w-[30vw] min-w-[340px] max-w-[520px] lg:block">
          {materialPanelAssets.map((panel, index) => (
            <div
              key={panel.src}
              className={cn(
                "cobam-material-panel absolute overflow-hidden border border-white/15 bg-white/10 shadow-2xl shadow-black/35 backdrop-blur",
                panel.className,
              )}
              style={{ animationDelay: `${index * 900}ms` }}
            >
              <Image src={panel.src} alt={panel.alt} fill sizes="240px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07111d]/60 via-transparent to-white/10" />
            </div>
          ))}
        </div>

        <div className="relative z-10 mx-auto flex min-h-[96svh] max-w-[1460px] flex-col justify-end px-5 pb-9 pt-36 sm:px-8 lg:px-12">
          <div className="max-w-5xl pb-10">
            <p className="mb-6 inline-flex items-center gap-3 border border-white/20 bg-white/10 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-white/75 backdrop-blur">
              <Sparkles className="h-4 w-4 text-[#7fd6ff]" aria-hidden="true" />
              From raw matter to architectural emotion
            </p>
            <h1
              className="max-w-4xl text-balance text-[clamp(4rem,12vw,10.5rem)] font-normal leading-[0.78] tracking-normal"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              L&apos;architecture des matières
            </h1>
            <p className="mt-8 max-w-2xl text-pretty text-lg leading-8 text-white/78 md:text-xl">
              Depuis 1994, COBAM Group sélectionne les revêtements, sanitaires, matériaux techniques et
              finitions qui donnent du caractère aux espaces d&apos;exception.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/produits"
                className="group inline-flex min-h-14 items-center justify-center gap-3 bg-white px-7 text-sm font-semibold uppercase tracking-[0.18em] text-[#14202e] transition duration-300 hover:bg-[#0a8dc1] hover:text-white"
              >
                Explorer le catalogue
                <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link
                href="/contact"
                className="group inline-flex min-h-14 items-center justify-center gap-3 border border-white/25 px-7 text-sm font-semibold uppercase tracking-[0.18em] text-white transition duration-300 hover:border-white hover:bg-white/10"
              >
                Visiter nos showrooms
                <MapPin className="h-4 w-4 transition duration-300 group-hover:-translate-y-0.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="grid gap-3 border-t border-white/15 pt-6 sm:grid-cols-2 lg:grid-cols-4">
            {heroBadges.map((badge) => (
              <div key={badge} className="border border-white/12 bg-white/[0.055] px-4 py-4 backdrop-blur">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-white/45">COBAM</p>
                <p className="mt-2 text-sm font-medium text-white">{badge}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-5 border-t border-white/10 pt-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-[#7fd6ff]">
                Material index
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {universes.slice(0, 6).map((universe) => (
                  <Link
                    key={universe.title}
                    href={universe.href}
                    className="border border-white/15 bg-white/[0.06] px-3 py-2 text-xs text-white/72 transition duration-300 hover:border-[#0a8dc1] hover:text-white"
                  >
                    {universe.title}
                  </Link>
                ))}
              </div>
            </div>
            <a
              href="#brand-wall"
              className="inline-flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-white/60 transition duration-300 hover:text-white"
            >
              Découvrir l&apos;univers COBAM
              <span className="h-px w-14 bg-white/40" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section id="brand-wall" className="overflow-hidden border-y border-[#14202e]/10 bg-[#ede8df] py-16">
        <div className="mx-auto max-w-[1460px] px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-[#0a8dc1]">
                Partenaires
              </p>
              <h2
                className="mt-3 max-w-3xl text-balance text-4xl font-normal leading-tight md:text-6xl"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Les plus grandes marques réunies dans un seul univers.
              </h2>
            </div>
            <Link
              href="/partenaires"
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#14202e] transition duration-300 hover:text-[#0a8dc1]"
            >
              Voir les marques
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="cobam-brand-marquee mt-10 overflow-hidden">
          <div className="cobam-brand-track flex w-max gap-4">
            {marqueeBrands.map((brand, index) => (
              <Link
                key={`${brand.id}-${index}`}
                href={`/produits?search=${encodeURIComponent(brand.name)}`}
                className="group flex h-28 w-52 items-center justify-center border border-[#14202e]/10 bg-white/55 px-8 backdrop-blur transition duration-300 hover:border-[#0a8dc1]/50 hover:bg-white"
                aria-label={`Voir les produits ${brand.name}`}
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

      <section className="bg-[#f7f4ef] py-24 md:py-32">
        <div className="mx-auto grid max-w-[1460px] gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_0.78fr] lg:px-12">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-[#0a8dc1]">Manifeste</p>
            <h2
              className="mt-5 max-w-4xl text-balance text-5xl font-normal leading-[0.98] md:text-7xl"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Nous ne vendons pas seulement des matériaux. Nous composons des espaces.
            </h2>
            <p className="mt-8 max-w-3xl text-lg leading-8 text-[#4c5661]">
              Chaque surface, chaque texture, chaque finition participe à l&apos;émotion d&apos;un lieu. COBAM Group
              accompagne les professionnels et les particuliers dans le choix de solutions durables, esthétiques
              et techniquement fiables.
            </p>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {[
                ["Matière", "La sensation juste, du minéral au décoratif."],
                ["Technique", "Des solutions pensées pour tenir et performer."],
                ["Élégance", "Une sélection qui élève les espaces sans les surcharger."],
              ].map(([title, text]) => (
                <div key={title} className="border-l border-[#14202e]/15 pl-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#14202e]">{title}</p>
                  <p className="mt-3 text-sm leading-6 text-[#66717c]">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[560px] overflow-hidden bg-[#14202e] p-4 text-white">
            <Image
              src="/images/hero-section/2.jpg"
              alt="Matières architecturales sélectionnées par COBAM Group"
              fill
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07111d]/92 via-[#07111d]/16 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 border border-white/15 bg-white/10 p-6 backdrop-blur-md">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[#a8e2ff]">
                Depuis 1994
              </p>
              <p className="mt-4 text-2xl leading-snug">
                La confiance d&apos;un partenaire tunisien pour construire, rénover et sublimer.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#07111d] py-24 text-white md:py-32">
        <div className="mx-auto max-w-[1460px] px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-[#7fd6ff]">Univers</p>
              <h2
                className="mt-4 text-balance text-5xl font-normal leading-none md:text-7xl"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Explorez nos univers
              </h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-white/66">
              Des fondations aux dernières touches décoratives, COBAM Group réunit les univers essentiels pour
              construire, rénover et sublimer.
            </p>
          </div>

          <div className="mt-14 grid auto-rows-[minmax(360px,auto)] gap-5 lg:grid-cols-12">
            {universes.map((universe, index) => (
              <Link
                key={universe.title}
                href={universe.href}
                className={cn(
                  "group relative isolate flex min-h-[360px] overflow-hidden border border-white/12 bg-white/[0.04] p-6 transition duration-500 hover:-translate-y-1 hover:border-[#0a8dc1]/70",
                  index === 0 || index === 3 ? "lg:col-span-7" : "lg:col-span-5",
                  index === 2 || index === 5 ? "lg:min-h-[440px]" : "",
                )}
              >
                <Image
                  src={universe.image}
                  alt={universe.title}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover opacity-72 transition duration-700 group-hover:scale-105 group-hover:opacity-88"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07111d]/95 via-[#07111d]/40 to-transparent" />
                <div className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-[#0a8dc1] transition duration-500 group-hover:scale-x-100" />
                <div className="relative mt-auto max-w-xl">
                  <div className="flex items-center justify-between gap-6">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-white/56">
                      {universe.eyebrow}
                    </p>
                    <span className="text-5xl text-white/18" style={{ fontFamily: "var(--font-playfair), serif" }}>
                      {universe.index}
                    </span>
                  </div>
                  <h3 className="mt-4 text-3xl font-semibold tracking-normal text-white md:text-4xl">
                    {universe.title}
                  </h3>
                  <p className="mt-4 max-w-lg text-sm leading-7 text-white/70">{universe.description}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#7fd6ff]">
                    Découvrir
                    <ArrowRight
                      className="h-4 w-4 transition duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f4f1eb] py-24 md:py-32">
        <div className="mx-auto max-w-[1460px] px-5 sm:px-8 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1fr] lg:items-end">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-[#0a8dc1]">Expérience</p>
              <h2
                className="mt-4 text-balance text-5xl font-normal leading-none md:text-7xl"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Une matière pour chaque ambition.
              </h2>
            </div>
            <p className="text-lg leading-8 text-[#4c5661]">
              Voir, toucher, comparer, choisir. L&apos;offre COBAM relie l&apos;esthétique, la performance et la mise en
              oeuvre pour guider chaque décision du projet.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {experiencePillars.map((pillar) => (
              <article
                key={pillar.title}
                className="group relative isolate min-h-[480px] overflow-hidden border border-[#14202e]/10 bg-[#14202e] p-6 text-white"
              >
                <Image
                  src={pillar.image}
                  alt={pillar.title}
                  fill
                  sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover opacity-70 transition duration-700 group-hover:scale-105 group-hover:opacity-88"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07111d]/96 via-[#07111d]/28 to-transparent" />
                <div className="relative flex h-full min-h-[432px] flex-col justify-between">
                  <pillar.Icon className="h-8 w-8 text-[#a8e2ff]" aria-hidden="true" />
                  <div>
                    <h3 className="text-2xl font-semibold">{pillar.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-white/72">{pillar.text}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0b1623] py-24 text-white md:py-32">
        <div className="absolute inset-0 cobam-blueprint-grid opacity-35" />
        <div className="relative mx-auto max-w-[1460px] px-5 sm:px-8 lg:px-12">
          <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-[#0b1623]/86 p-8 md:p-10">
                <p
                  className="text-6xl font-normal leading-none text-white md:text-7xl"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  {stat.value}
                </p>
                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.22em] text-[#7fd6ff]">{stat.label}</p>
                <p className="mt-4 text-sm leading-6 text-white/58">{stat.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {finishCards.length > 0 ? (
        <section className="bg-[#f7f4ef] py-24 md:py-32">
          <div className="mx-auto max-w-[1460px] px-5 sm:px-8 lg:px-12">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-[#0a8dc1]">
                  Inspiration
                </p>
                <h2
                  className="mt-4 text-balance text-5xl font-normal leading-none md:text-7xl"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  Collections d&apos;inspiration
                </h2>
              </div>
              <Link
                href="/produits"
                className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#14202e] transition duration-300 hover:text-[#0a8dc1]"
              >
                Parcourir le catalogue
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {finishCards.map((finish, index) => (
                <Link
                  key={finish.id}
                  href={finish.href}
                  className={cn(
                    "group relative isolate min-h-[360px] overflow-hidden bg-[#14202e]",
                    index === 1 || index === 6 ? "xl:row-span-2 xl:min-h-[520px]" : "",
                  )}
                >
                  <Image
                    src={finish.image}
                    alt={finish.title}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover opacity-78 transition duration-700 group-hover:scale-105 group-hover:opacity-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07111d]/88 via-transparent to-transparent" />
                  <div
                    className="absolute inset-x-0 top-0 h-1 opacity-80"
                    style={{ backgroundColor: finish.color ?? "#0a8dc1" }}
                  />
                  <div className="relative flex h-full min-h-[360px] flex-col justify-end p-6">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-white/54">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold text-white">{finish.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-[#e9e2d8] py-24 md:py-32">
        <div className="mx-auto max-w-[1460px] px-5 sm:px-8 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1fr] lg:items-end">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-[#0a8dc1]">Showrooms</p>
              <h2
                className="mt-4 text-balance text-5xl font-normal leading-none md:text-7xl"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Visitez nos showrooms
              </h2>
            </div>
            <p className="text-lg leading-8 text-[#4c5661]">
              Découvrez les matières, comparez les finitions et échangez avec nos experts dans nos espaces à Djerba.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {showrooms.map((showroom) => (
              <article key={showroom.name} className="group bg-[#f7f4ef] shadow-[0_24px_80px_rgba(20,32,46,0.10)]">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#14202e]">
                  <Image
                    src={showroom.image}
                    alt={`Showroom COBAM ${showroom.name}`}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07111d]/65 via-transparent to-transparent" />
                  <p className="absolute left-5 top-5 border border-white/25 bg-white/10 px-3 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur">
                    {showroom.label}
                  </p>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold">{showroom.name}</h3>
                  <p className="mt-4 flex gap-3 text-sm leading-6 text-[#59636e]">
                    <MapPin className="mt-1 h-4 w-4 shrink-0 text-[#0a8dc1]" aria-hidden="true" />
                    {showroom.address}
                  </p>
                  <a
                    href={`tel:${showroom.phone.replace(/\s/g, "")}`}
                    className="mt-3 flex gap-3 text-sm font-semibold text-[#14202e] transition duration-300 hover:text-[#0a8dc1]"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-[#0a8dc1]" aria-hidden="true" />
                    {showroom.phone}
                  </a>
                  <a
                    href={showroom.map}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#0a8dc1]"
                  >
                    Itinéraire
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f4ef] py-24 md:py-32">
        <div className="mx-auto max-w-[1460px] px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-[#0a8dc1]">Le Mag</p>
              <h2
                className="mt-4 text-balance text-5xl font-normal leading-none md:text-7xl"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Le Mag COBAM
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[#4c5661]">
                Conseils, inspirations et guides pour choisir les bonnes matières.
              </p>
            </div>
            <Link
              href="/actualites"
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#14202e] transition duration-300 hover:text-[#0a8dc1]"
            >
              Voir les articles
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {featuredArticles.map((article) => (
              <Link
                key={article.id}
                href={`/actualites/${article.slug}`}
                className="group overflow-hidden border border-[#14202e]/10 bg-white shadow-[0_24px_80px_rgba(20,32,46,0.08)]"
              >
                <div className="relative aspect-[16/11] overflow-hidden bg-[#14202e]">
                  <Image
                    src={article.coverImageUrl || "/images/hero-section/3.jpg"}
                    alt={article.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[#0a8dc1]">
                    {article.categories[0]?.name ?? "Inspiration"}
                  </p>
                  <h3 className="mt-4 text-2xl font-semibold leading-snug">{article.title}</h3>
                  {article.excerpt ? (
                    <p className="mt-4 line-clamp-3 text-sm leading-7 text-[#59636e]">{article.excerpt}</p>
                  ) : null}
                  <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#14202e]">
                    Lire
                    <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-[#07111d] py-24 text-white md:py-36">
        <Image
          src="/images/hero-section/3.jpg"
          alt="Ambiance finale COBAM Group"
          fill
          sizes="100vw"
          className="object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_36%,rgba(10,141,193,0.28),transparent_34%),linear-gradient(90deg,rgba(7,17,29,0.95),rgba(7,17,29,0.70))]" />
        <div className="relative mx-auto max-w-[1460px] px-5 sm:px-8 lg:px-12">
          <div className="max-w-4xl">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-[#7fd6ff]">Projet</p>
            <h2
              className="mt-5 text-balance text-5xl font-normal leading-[0.98] md:text-8xl"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Votre prochain espace commence ici.
            </h2>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/72">
              Explorez le catalogue COBAM Group ou visitez l&apos;un de nos showrooms pour donner forme à votre projet.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <Link
                href="/produits"
                className="inline-flex min-h-14 items-center justify-center gap-3 bg-white px-7 text-sm font-semibold uppercase tracking-[0.18em] text-[#14202e] transition duration-300 hover:bg-[#0a8dc1] hover:text-white"
              >
                Explorer le catalogue
                <Ruler className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-14 items-center justify-center gap-3 border border-white/25 px-7 text-sm font-semibold uppercase tracking-[0.18em] text-white transition duration-300 hover:border-white hover:bg-white/10"
              >
                Nous contacter
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/contact#showrooms"
                className="inline-flex min-h-14 items-center justify-center gap-3 border border-white/25 px-7 text-sm font-semibold uppercase tracking-[0.18em] text-white transition duration-300 hover:border-white hover:bg-white/10"
              >
                Trouver un showroom
                <MapPin className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
