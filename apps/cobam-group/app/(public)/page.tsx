import type { Metadata } from "next";

import { RedesignedHome } from "@/components/public/home/redesigned-home";
import { LandingEffects } from "@/components/public/home/landing-effects";
import type { JourneyCategory, BrandLogo, ShowroomLocation } from "@/components/public/home/catalog-journey";
import { listLatestPublicArticles } from "@/features/articles/public";
import { listPublicProductBrandOrganizations } from "@/features/organizations/public";
import { listPublicMegaMenuProductCategories } from "@/features/product-categories/public";
import type { PublicMegaMenuProductCategory } from "@/features/product-categories/public-types";

export const metadata: Metadata = {
  title: "COBAM Group | L'architecture des matières",
  description:
    "Depuis 1994, COBAM Group réunit matériaux, revêtements, équipements et finitions pour accompagner chaque étape du projet.",
};

export const dynamic = "force-dynamic";

type CategoryBlueprint = {
  id: string;
  number: string;
  name: string;
  categoryTerms: string[];
  subtitle: string;
  fallbackHref: string;
  fallbackImage: string;
  imageAlt: string;
  imageNeedsReplacement?: boolean;
  subcategories: string[];
};

const categoryBlueprints: CategoryBlueprint[] = [
  {
    id: "salle-bain-cuisine",
    number: "01",
    name: "Salle de bain et cuisine",
    categoryTerms: ["salle de bain", "cuisine", "sanitaire", "robinetterie"],
    subtitle:
      "Robinetterie, vasques, douches et équipements pour créer des espaces d'eau précis, élégants et durables.",
    fallbackHref: "/produits/salle-de-bain-et-cuisine",
    fallbackImage: "/images/collections/mitigeur-cascade-353x353.jpg",
    imageAlt: "Robinetterie et eau dans un univers salle de bain premium",
    subcategories: ["Éviers de cuisine", "Robinetterie", "Baignoires", "Jacuzzis", "Lavabos et vasques", "Espace douche"],
  },
  {
    id: "revetements-sols-murs",
    number: "02",
    name: "Revêtements de sols et murs",
    categoryTerms: ["revetement", "sol", "mur", "carrelage"],
    subtitle:
      "Sols, murs, dalles et textures définissent la lumière, le rythme et la personnalité d'un espace.",
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
    id: "materiaux-construction",
    number: "03",
    name: "Matériaux de construction",
    categoryTerms: ["construction", "materiaux", "materiel"],
    subtitle:
      "Matériaux de construction, ciments, briques et armatures donnent au projet sa solidité.",
    fallbackHref: "/produits/materiaux-de-construction",
    fallbackImage: "/images/hero-section/3.jpg",
    imageAlt: "Matière brute et architecture pour représenter les bases de construction",
    imageNeedsReplacement: true,
    subcategories: ["Sables et graviers", "Briques", "Treillis soudés et fers à béton", "Ciments et produits en béton", "Adjuvants"],
  },
  {
    id: "isolation-etancheite",
    number: "04",
    name: "Isolation et étanchéité",
    categoryTerms: ["isolation", "etancheite", "etanche"],
    subtitle:
      "Étanchéité et isolation améliorent le confort, la performance et la durée de vie du bâtiment.",
    fallbackHref: "/produits/isolation-et-etancheite",
    fallbackImage: "/images/hero-section/1.jpg",
    imageAlt: "Couches architecturales et lumière pour représenter la protection du bâtiment",
    imageNeedsReplacement: true,
    subcategories: ["Étanchéité", "Isolation thermique"],
  },
  {
    id: "peintures-decoration",
    number: "05",
    name: "Peintures et décoration",
    categoryTerms: ["peinture", "decoration", "couleur"],
    subtitle:
      "Peintures, béton ciré et finitions décoratives donnent une signature à chaque intérieur.",
    fallbackHref: "/produits/peintures-et-decoration",
    fallbackImage: "/images/collections/amb-arenisca-perla-353x353.jpg",
    imageAlt: "Texture murale et finition décorative minérale",
    subcategories: ["Béton ciré", "Peintures d'intérieur", "Peintures d'extérieur"],
  },
  {
    id: "piscine",
    number: "06",
    name: "Piscine",
    categoryTerms: ["piscine", "aquatique"],
    subtitle:
      "Pierres de Bali, margelles et mosaïques pour créer des espaces piscine élégants et durables.",
    fallbackHref: "/produits/piscine",
    fallbackImage: "/images/collections/carrelage-piscine-353x353.jpg",
    imageAlt: "Carrelage piscine et eau extérieure",
    subcategories: ["Pierres de Bali", "Margelles et finitions", "Mosaïques"],
  },
  {
    id: "portes-menuiserie",
    number: "07",
    name: "Portes et menuiserie",
    categoryTerms: ["porte", "menuiserie", "bois"],
    subtitle:
      "Portes, bois et menuiserie structurent les transitions avec chaleur et précision.",
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

function normalizeLabel(value: string | null | undefined) {
  return (value ?? "")
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

function buildJourneyCategories(categories: PublicMegaMenuProductCategory[]): JourneyCategory[] {
  const rootCategories = categories.filter((category) => !category.parent);

  return categoryBlueprints.map((item) => {
    const category = findCategoryByTerms(rootCategories, [item.name, ...item.categoryTerms]);
    const href = category?.href ?? item.fallbackHref;
    const image = category?.imageUrlHD || category?.imageUrl || item.fallbackImage;

    return {
      id: item.id,
      number: item.number,
      name: category?.title ?? item.name,
      subtitle: item.subtitle,
      href,
      image,
      imageAlt: item.imageAlt,
      imageNeedsReplacement: Boolean(item.imageNeedsReplacement && !(category?.imageUrlHD || category?.imageUrl)),
      isPromoted: category?.isPromoted ?? false,
      subcategories: item.subcategories.map((label) => ({
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
  const [categories, brands, latestArticles] = await Promise.all([
    listPublicMegaMenuProductCategories(),
    listPublicProductBrandOrganizations(),
    listLatestPublicArticles(3),
  ]);

  const journeyCategories = buildJourneyCategories(categories);
  const brandLogos = buildBrandLogos(brands);

  return (
    <main className="cobam-catalog-landing bg-[#fafaf9] text-[#14202e]">
      <LandingEffects />
      <RedesignedHome
        categories={journeyCategories}
        brands={brandLogos}
        articles={latestArticles}
        showrooms={showrooms}
      />
    </main>
  );
}
