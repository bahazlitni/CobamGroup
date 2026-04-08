import { slugify } from "@/lib/slugify";

export enum ProductBrandKind {
    PARTNER,
    REFERENCE,
    BOTH,
    NONE,
}

type BrandRecord = {
    value: string
    label: string;
    logoUrl: string;
    isProductBrand: boolean;
    description: string;
    kind: ProductBrandKind;
}

export type Brand = BrandRecord & {
    name: string;
    slug: string;
    imageUrl: string;
}

const BRAND_RECORDS: BrandRecord[] = [
  {
    value: "GEOTILES_CERAMICA",
    label: "Geotiles Ceramica",
    logoUrl: "/images/brands/geotiles-ceramica.png",
    isProductBrand: true,
    description: "Marque espagnole renommée pour ses revêtements de sol et muraux en céramique au design avant-gardiste.",
    kind: ProductBrandKind.PARTNER,
  },
  {
    value: "SOPAL",
    label: "Sopal",
    logoUrl: "/images/brands/sopal.png",
    isProductBrand: true,
    description: "Leader tunisien dans la fabrication de robinetterie, d'articles sanitaires et d'accessoires de plomberie.",
    kind: ProductBrandKind.PARTNER,
  },
  {
    value: "CARTHAGO_CERAMIC",
    label: "Carthago Ceramic",
    logoUrl: "/images/brands/carthago-ceramic.png",
    isProductBrand: true,
    description: "L'un des principaux producteurs tunisiens de carreaux céramiques, grès cérame et équipements sanitaires.",
    kind: ProductBrandKind.PARTNER,
  },
  {
    value: "KTL_CERAMICA",
    label: "KTL Ceramica",
    logoUrl: "/images/brands/ktl-ceramica.png",
    isProductBrand: true,
    description: "Fabricant espagnol de céramique proposant des solutions innovantes et durables pour les sols et les murs.",
    kind: ProductBrandKind.PARTNER,
  },
  {
    value: "TAU_CERAMICA",
    label: "TAU Ceramica",
    logoUrl: "/images/brands/tau-ceramica.png",
    isProductBrand: true,
    description: "Référence mondiale dans la production de céramique espagnole, reconnue pour sa qualité et son innovation technique.",
    kind: ProductBrandKind.PARTNER,
  },
  {
    value: "PRISSMACER_CERAMICA",
    label: "Prissmacer Ceramica",
    logoUrl: "/images/brands/prissmacer-ceramica.png",
    isProductBrand: true,
    description: "Marque espagnole de carrelage offrant une large gamme de produits céramiques de haute qualité à des prix compétitifs.",
    kind: ProductBrandKind.PARTNER,
  },
  {
    value: "GEBERIT",
    label: "Geberit",
    logoUrl: "/images/brands/geberit.png",
    isProductBrand: true,
    description: "Groupe suisse et leader européen dans le domaine des produits sanitaires et des systèmes de tuyauterie.",
    kind: ProductBrandKind.PARTNER,
  },
  {
    value: "DEUTSCH_COLOR",
    label: "Deutsch Color",
    logoUrl: "/images/brands/deutsch-color.png",
    isProductBrand: true,
    description: "Fabricant international spécialisé dans la production de peintures, mastics et matériaux de construction.",
    kind: ProductBrandKind.PARTNER,
  },
  {
    value: "ROCERSA",
    label: "Rocersa",
    logoUrl: "/images/brands/rocersa.png",
    isProductBrand: true,
    description: "Entreprise espagnole pionnière dans la fabrication de grès cérame de grandes dimensions et de solutions pour l'extérieur.",
    kind: ProductBrandKind.PARTNER,
  },
  {
    value: "SIKA",
    label: "Sika",
    logoUrl: "/images/brands/sika.png",
    isProductBrand: true,
    description: "Groupe suisse leader dans les produits chimiques de spécialité pour la construction et l'industrie, notamment l'étanchéité.",
    kind: ProductBrandKind.PARTNER,
  },
  {
    value: "UNDEFASA",
    label: "Undefasa",
    logoUrl: "/images/brands/undefasa.png",
    isProductBrand: true,
    description: "Fabricant espagnol de carreaux de céramique alliant une forte tradition industrielle à des designs contemporains.",
    kind: ProductBrandKind.PARTNER,
  },
  {
    value: "ALAPLANA_CERAMICA",
    label: "Alaplana Ceramica",
    logoUrl: "/images/brands/alaplana-ceramica.png",
    isProductBrand: true,
    description: "Marque espagnole innovante spécialisée dans les revêtements de sol et muraux en céramique.",
    kind: ProductBrandKind.PARTNER,
  },
  {
    value: "NAVARTI_CERAMICA",
    label: "Navarti Ceramica",
    logoUrl: "/images/brands/navarti-ceramica.png",
    isProductBrand: true,
    description: "Entreprise espagnole produisant une vaste sélection de carreaux de sol et de mur de haute qualité.",
    kind: ProductBrandKind.PARTNER,
  },
  {
    value: "PAMESA_CERAMICA",
    label: "Pamesa Ceramica",
    logoUrl: "/images/brands/pamesa-ceramica.png",
    isProductBrand: true,
    description: "Groupe industriel espagnol de premier plan, spécialiste mondial du grès cérame et des revêtements céramiques.",
    kind: ProductBrandKind.PARTNER,
  },
  {
    value: "NEW_TILES",
    label: "New Tiles",
    logoUrl: "/images/brands/new-tiles.png",
    isProductBrand: true,
    description: "Fabricant de céramique proposant des designs modernes et élégants adaptés aux divers espaces architecturaux.",
    kind: ProductBrandKind.PARTNER,
  },
  {
    value: "SOMOCER_GROUP",
    label: "Somocer Group",
    logoUrl: "/images/brands/somocer-group.png",
    isProductBrand: true,
    description: "Acteur majeur en Tunisie dans la production et la commercialisation de carreaux en céramique et d'articles sanitaires.",
    kind: ProductBrandKind.PARTNER,
  },
  {
    value: "ECOCERAMIC_CERAMICA",
    label: "Ecoceramic Ceramica",
    logoUrl: "/images/brands/ecoceramic-ceramica.png",
    isProductBrand: true,
    description: "Marque espagnole proposant des produits céramiques écologiques, durables et innovants pour l'habitat.",
    kind: ProductBrandKind.PARTNER,
  },
  {
    value: "MARAZZI",
    label: "Marazzi",
    logoUrl: "/images/brands/marazzi.png",
    isProductBrand: true,
    description: "Marque italienne d'envergure internationale, symbole du meilleur design et de la qualité dans le secteur des carreaux de céramique.",
    kind: ProductBrandKind.PARTNER,
  },
  {
    value: "SAN_MARCO",
    label: "San Marco",
    logoUrl: "/images/brands/san-marco.png",
    isProductBrand: true,
    description: "Entreprise italienne spécialisée dans les systèmes de peinture et les revêtements décoratifs professionnels pour le bâtiment.",
    kind: ProductBrandKind.PARTNER,
  },
  {
    value: "JAQUAR",
    label: "Jaquar",
    logoUrl: "/images/brands/jaquar.png",
    isProductBrand: true,
    description: "Fabricant mondial d'équipements de salle de bains complets, incluant la robinetterie haut de gamme et les sanitaires.",
    kind: ProductBrandKind.NONE,
  },
  {
    value: "GROHE",
    label: "Grohe",
    logoUrl: "/images/brands/grohe.png",
    isProductBrand: true,
    description: "Marque allemande de renommée mondiale fournissant des équipements sanitaires et des systèmes d'eau innovants.",
    kind: ProductBrandKind.NONE,
  },
  {
    value: "CIMENT_DE_GABES",
    label: "Ciment de Gabès",
    logoUrl: "/images/brands/ciment-de-gabes.png",
    isProductBrand: true,
    description: "Société tunisienne de référence spécialisée dans la production et la distribution de ciment et de matériaux de construction.",
    kind: ProductBrandKind.NONE,
  },
  {
    value: "ROBINSON",
    label: "Robinson",
    logoUrl: "/images/brands/robinson.png",
    isProductBrand: false,
    description: "Chaîne de clubs de vacances premium, notamment présente avec son célèbre Club Robinson à Djerba.",
    kind: ProductBrandKind.REFERENCE,
  },
  {
    value: "DJERBA_LAND",
    label: "Djerba Land",
    logoUrl: "/images/brands/djerba-land.png",
    isProductBrand: false,
    description: "Parc d'attractions et de loisirs emblématique situé à Djerba, offrant diverses activités pour les familles.",
    kind: ProductBrandKind.REFERENCE,
  },
  {
    value: "POLE_HOSPITALIER_INTERNATIONAL_ECHIFA",
    label: "Pôle Hospitalier International Echifa",
    logoUrl: "/images/brands/pole-hospitalier-international-echifa.png",
    isProductBrand: false,
    description: "Établissement de santé privé, multidisciplinaire et moderne situé à Houmt Souk sur l'île de Djerba.",
    kind: ProductBrandKind.REFERENCE,
  },
  {
    value: "WELCOME_MERIDIANA",
    label: "Welcome Meridiana",
    logoUrl: "/images/brands/welcome-meridiana.png",
    isProductBrand: false,
    description: "Complexe hôtelier de charme situé à Djerba, réputé pour son architecture authentique et ses services de qualité.",
    kind: ProductBrandKind.REFERENCE,
  },
  {
    value: "VIS_A_VIS_IMMO_DJERBA",
    label: "Vis-à-Vis Immo Djerba",
    logoUrl: "/images/brands/vis-a-vis-immo-djerba.png",
    isProductBrand: false,
    description: "Agence immobilière agréée basée à Midoun (Djerba), spécialisée dans l'achat, la vente et la construction clé en main.",
    kind: ProductBrandKind.REFERENCE,
  },
  {
    value: "DJERBA_BREACH_HOTEL",
    label: "Djerba Beach Hotel",
    logoUrl: "/images/brands/djerba-beach-hotel.png",
    isProductBrand: false,
    description: "Hôtel balnéaire étoilé offrant des séjours de détente sur les plages paradisiaques de l'île de Djerba.",
    kind: ProductBrandKind.REFERENCE,
  },
  {
    value: "ARIJ_POLYCLINIQUE",
    label: "Arij Polyclinique",
    logoUrl: "/images/brands/arij-polyclinique.png",
    isProductBrand: false,
    description: "Polyclinique moderne inaugurée en 2020 près de Midoun (Djerba), proposant des soins médicaux de pointe et des urgences 24h/24.",
    kind: ProductBrandKind.REFERENCE,
  },
  {
    value: "HOTEL_LES_QUATRE_SAISONS",
    label: "Hôtel les quatre saisons",
    logoUrl: "/images/brands/hotel-les-quatre-saisons.png",
    isProductBrand: false,
    description: "Établissement hôtelier tunisien réputé offrant un accueil chaleureux et des prestations d'hébergement confortables.",
    kind: ProductBrandKind.REFERENCE,
  },
  {
    value: "POLYCLINIQUE_DJERBA_INTERNATIONALE",
    label: "Polyclinique Djerba Internationale",
    logoUrl: "/images/brands/polyclinique-djerba-internationale.png",
    isProductBrand: false,
    description: "Centre hospitalier privé de référence à Djerba, équipé de technologies médicales de dernière génération.",
    kind: ProductBrandKind.REFERENCE,
  },
];

export const BRANDS: Brand[] = BRAND_RECORDS.map((brand) => ({
    ...brand,
    imageUrl: brand.logoUrl,
    name: brand.label,
    slug: slugify(brand.label),
}));

export const PRODUCT_BRANDS: Brand[] = BRANDS.filter(b => b.isProductBrand);
export const PARTNER_BRANDS: Brand[] = BRANDS.filter(b => b.kind === ProductBrandKind.PARTNER || b.kind === ProductBrandKind.BOTH);
export const REFERENCE_BRANDS: Brand[] = BRANDS.filter(b => b.kind === ProductBrandKind.REFERENCE || b.kind === ProductBrandKind.BOTH);

function normalizeBrandKey(value: string | null | undefined) {
    return (value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

export function resolveProductBrand(value: string | null | undefined): Brand | null {
    const normalizedValue = normalizeBrandKey(value);

    if (!normalizedValue) {
        return null;
    }

    return (
        PRODUCT_BRANDS.find(
            (brand) =>
                normalizeBrandKey(brand.value) === normalizedValue ||
                normalizeBrandKey(brand.label) === normalizedValue,
        ) ?? null
    );
}

export function normalizeProductBrandValue(value: string | null | undefined) {
    const trimmedValue = (value ?? "").trim();

    if (!trimmedValue) {
        return null;
    }

    return resolveProductBrand(trimmedValue)?.value ?? trimmedValue;
}

export function formatProductBrandValue(value: string | null | undefined) {
    if (!value) {
        return null;
    }

    return resolveProductBrand(value)?.label ?? value;
}

export function getProductBrandSuggestions(query: string): string[] {
    if (!query) return [];
    const lowerQuery = normalizeBrandKey(query);
    return PRODUCT_BRANDS
        .filter((brand) => normalizeBrandKey(brand.label).startsWith(lowerQuery))
        .map((brand) => brand.label);
}
