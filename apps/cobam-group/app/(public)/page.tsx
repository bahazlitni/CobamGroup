import type { Metadata } from "next";

import {
  BrandConstellation,
  CatalogChapter,
  FinalCTA,
  JourneyIndex,
  LandingHero,
  ShowroomSection,
  type BrandLogo,
  type JourneyWorld,
  type ShowroomLocation,
} from "@/components/public/home/catalog-journey";
import { listPublicProductBrandOrganizations } from "@/features/organizations/public";
import { listPublicMegaMenuProductCategories } from "@/features/product-categories/public";
import type { PublicMegaMenuProductCategory } from "@/features/product-categories/public-types";

export const metadata: Metadata = {
  title: "COBAM Group | L'architecture des matières",
  description:
    "Depuis 1994, COBAM Group réunit matériaux, revêtements, équipements et finitions pour accompagner chaque étape du projet.",
};

export const dynamic = "force-dynamic";

type CatalogWorldBlueprint = {
  id: string;
  number: string;
  world: string;
  categoryTitle: string;
  categoryTerms: string[];
  title: string;
  subtitle: string;
  cta: string;
  fallbackHref: string;
  fallbackImage: string;
  imageAlt: string;
  imageNeedsReplacement?: boolean;
  subcategories: string[];
};

const catalogWorldBlueprints: CatalogWorldBlueprint[] = [
  {
    id: "water",
    number: "01",
    world: "Eau",
    categoryTitle: "Salle de bain et cuisine",
    categoryTerms: ["salle de bain", "cuisine", "sanitaire", "robinetterie"],
    title: "L'eau comme point de départ.",
    subtitle:
      "Robinetterie, vasques, douches et équipements pour créer des espaces d'eau précis, élégants et durables.",
    cta: "Découvrir l'univers salle de bain & cuisine",
    fallbackHref: "/produits/salle-de-bain-et-cuisine",
    fallbackImage: "/images/collections/mitigeur-cascade-353x353.jpg",
    imageAlt: "Robinetterie et eau dans un univers salle de bain premium",
    subcategories: ["Éviers de cuisine", "Robinetterie", "Baignoires", "Jacuzzis", "Lavabos et vasques", "Espace douche"],
  },
  {
    id: "surface",
    number: "02",
    world: "Surface",
    categoryTitle: "Revêtements de sols et murs",
    categoryTerms: ["revetement", "sol", "mur", "carrelage"],
    title: "La surface donne le caractère.",
    subtitle:
      "Sols, murs, dalles et textures définissent la lumière, le rythme et la personnalité d'un espace.",
    cta: "Explorer les revêtements",
    fallbackHref: "/produits/revetements-de-sols-et-murs",
    fallbackImage: "/images/collections/faedo-marbre-blanc-353x353.jpg",
    imageAlt: "Surface minérale claire et revêtement architectural",
    subcategories: [
      "Carrelage intérieur",
      "Carrelage extérieur",
      "Faïence murale",
      "Plinthes et accessoires",
      "Mosaïque à l'italienne",
      "Carrelage antidérapant R11",
      "Grandes dalles",
      "Carrelage effet béton",
      "Grès effet pierre naturelle",
      "Grès effet parquet",
      "Produits de pose & finition",
    ],
  },
  {
    id: "structure",
    number: "03",
    world: "Structure",
    categoryTitle: "Matériaux de construction",
    categoryTerms: ["construction", "materiaux", "materiel"],
    title: "Avant l'esthétique, la base.",
    subtitle:
      "Matériaux de construction, ciments, briques et armatures donnent au projet sa solidité.",
    cta: "Voir les matériaux de construction",
    fallbackHref: "/produits/materiaux-de-construction",
    fallbackImage: "/images/hero-section/3.jpg",
    imageAlt: "Matière brute et architecture pour représenter les bases de construction",
    imageNeedsReplacement: true,
    subcategories: ["Sables et graviers", "Briques", "Treillis soudés et fers à béton", "Ciments et produits en béton", "Adjuvants"],
  },
  {
    id: "protection",
    number: "04",
    world: "Protection",
    categoryTitle: "Isolation et étanchéité",
    categoryTerms: ["isolation", "etancheite", "etanche"],
    title: "Protéger ce qui dure.",
    subtitle:
      "Étanchéité et isolation améliorent le confort, la performance et la durée de vie du bâtiment.",
    cta: "Découvrir isolation & étanchéité",
    fallbackHref: "/produits/isolation-et-etancheite",
    fallbackImage: "/images/hero-section/1.jpg",
    imageAlt: "Couches architecturales et lumière pour représenter la protection du bâtiment",
    imageNeedsReplacement: true,
    subcategories: ["Étanchéité", "Isolation thermique"],
  },
  {
    id: "color",
    number: "05",
    world: "Couleur",
    categoryTitle: "Peintures et décoration",
    categoryTerms: ["peinture", "decoration", "couleur"],
    title: "La couleur transforme l'espace.",
    subtitle:
      "Peintures, béton ciré et finitions décoratives donnent une signature à chaque intérieur.",
    cta: "Explorer peintures & décoration",
    fallbackHref: "/produits/peintures-et-decoration",
    fallbackImage: "/images/collections/amb-arenisca-perla-353x353.jpg",
    imageAlt: "Texture murale et finition décorative minérale",
    subcategories: ["Béton ciré", "Peintures d'intérieur", "Peintures d'extérieur"],
  },
  {
    id: "outdoor",
    number: "06",
    world: "Extérieur",
    categoryTitle: "Piscine",
    categoryTerms: ["piscine", "aquatique"],
    title: "L'extérieur devient une expérience.",
    subtitle:
      "Pierres de Bali, margelles et mosaïques pour créer des espaces piscine élégants et durables.",
    cta: "Découvrir l'univers piscine",
    fallbackHref: "/produits/piscine",
    fallbackImage: "/images/collections/carrelage-piscine-353x353.jpg",
    imageAlt: "Carrelage piscine et eau extérieure",
    subcategories: ["Pierres de Bali", "Margelles et finitions", "Mosaïques"],
  },
  {
    id: "passage",
    number: "07",
    world: "Passage",
    categoryTitle: "Portes et menuiserie",
    categoryTerms: ["porte", "menuiserie", "bois"],
    title: "Chaque passage mérite une finition.",
    subtitle:
      "Portes, bois et menuiserie structurent les transitions avec chaleur et précision.",
    cta: "Explorer portes & menuiserie",
    fallbackHref: "/produits/portes-et-menuiserie",
    fallbackImage: "/images/collections/decor-bois-naturel-353x353.jpg",
    imageAlt: "Texture bois et détail de menuiserie intérieure",
    subcategories: ["Portes coulissantes", "Portes en bois"],
  },
];

const showrooms: ShowroomLocation[] = [
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
    .replace(/&/g, " ")
    .toLowerCase();
}

function findCategoryByTerms(categories: PublicMegaMenuProductCategory[], terms: string[]) {
  return categories.find((category) => {
    const searchable = normalizeLabel(`${category.title} ${category.subtitle} ${category.slug} ${category.descriptionSEO}`);
    return terms.some((term) => searchable.includes(normalizeLabel(term)));
  });
}

function resolveSubcategory(
  categories: PublicMegaMenuProductCategory[],
  rootCategory: PublicMegaMenuProductCategory | undefined,
  label: string,
) {
  const candidates = rootCategory
    ? categories.filter((category) => category.parent === rootCategory.slug)
    : categories.filter((category) => category.parent != null);
  const normalizedLabel = normalizeLabel(label);

  return (
    candidates.find((category) => normalizeLabel(category.title) === normalizedLabel) ??
    candidates.find((category) => normalizeLabel(category.title).includes(normalizedLabel) || normalizedLabel.includes(normalizeLabel(category.title)))
  );
}

function buildJourneyWorlds(categories: PublicMegaMenuProductCategory[]): JourneyWorld[] {
  const rootCategories = categories.filter((category) => !category.parent);

  return catalogWorldBlueprints.map((world) => {
    const category = findCategoryByTerms(rootCategories, [world.categoryTitle, ...world.categoryTerms]);
    const href = category?.href ?? world.fallbackHref;
    const image = category?.imageUrlHD || category?.imageUrl || world.fallbackImage;

    return {
      id: world.id,
      number: world.number,
      world: world.world,
      categoryTitle: category?.title ?? world.categoryTitle,
      title: world.title,
      subtitle: world.subtitle,
      href,
      cta: world.cta,
      image,
      imageAlt: world.imageAlt,
      imageNeedsReplacement: Boolean(world.imageNeedsReplacement && !(category?.imageUrlHD || category?.imageUrl)),
      subcategories: world.subcategories.map((label) => ({
        label,
        href: resolveSubcategory(categories, category, label)?.href ?? href,
      })),
    };
  });
}

function buildBrandLogos(brands: Awaited<ReturnType<typeof listPublicProductBrandOrganizations>>): BrandLogo[] {
  return brands
    .map((brand) => ({
      id: brand.slug || brand.name,
      name: brand.name,
      image: brand.logoUrl || brand.imageUrl,
      href: `/produits?search=${encodeURIComponent(brand.name)}`,
    }))
    .filter((brand): brand is BrandLogo => Boolean(brand.image));
}

export default async function HomePage() {
  const [categories, brands] = await Promise.all([
    listPublicMegaMenuProductCategories(),
    listPublicProductBrandOrganizations(),
  ]);

  const worlds = buildJourneyWorlds(categories);
  const brandLogos = buildBrandLogos(brands);

  return (
    <main className="cobam-catalog-landing bg-[#f4f1eb] text-[#14202e]">
      <LandingHero worlds={worlds} />
      <JourneyIndex worlds={worlds} />
      {worlds.map((world, index) => (
        <CatalogChapter
          key={world.id}
          world={world}
          reverse={index % 2 === 1}
          quiet={index === 2 || index === 5}
        />
      ))}
      <BrandConstellation brands={brandLogos} />
      <ShowroomSection showrooms={showrooms} />
      <FinalCTA />
    </main>
  );
}
