
export interface Category {
  href: string;
  title: string;
  subtitle: string;
  descriptionSEO: string;
  imageUrl: string;
  imageUrlHD: string;
  slug: string; // it is treated as an ID
  parent: string | null;
}

export interface Product {
  title: string;
  subtitle: string;
  descriptionSEO: string;
  imageUrl: string;
  imageUrlHD: string;
  slug: string; // it is treated as an ID
}

export type ProductCategoryLink = {
  prodslug: string;
  catslug: string;
};


export const productsData: Product[] = [
  {
    title: "Carrelage Grand Format",
    subtitle: "60x120 cm - Effet Marbre",
    descriptionSEO: "Carrelage grand format effet marbre pour sols modernes et lumineux.",
    imageUrl: "/images/products/carrelage-grand-format.jpg",
    imageUrlHD: "/images/products/HD/carrelage-grand-format.jpg",
    slug: "carrelage-grand-format",
  },
  {
    title: "Mitigeur Cuisine Extractible",
    subtitle: "Bec rétractable + mousseur anti-calcaire",
    descriptionSEO: "Mitigeur extractible pour cuisine avec douchette et finition inox brossé.",
    imageUrl: "/images/products/mitigeur-cuisine-extractible.jpg",
    imageUrlHD: "/images/products/HD/mitigeur-cuisine-extractible.jpg",
    slug: "mitigeur-cuisine-extractible",
  },
  {
    title: "Receveur de Douche Extra-plat",
    subtitle: "80x120 cm - Anti-dérapant",
    descriptionSEO: "Receveur de douche extra-plat antidérapant pour installation facile.",
    imageUrl: "/images/products/receveur-douche-extraplat.jpg",
    imageUrlHD: "/images/products/HD/receveur-douche-extraplat.jpg",
    slug: "receveur-douche-extraplat",
  },
  {
    title: "Ciment Colle Flex",
    subtitle: "20 kg - Haute adhérence",
    descriptionSEO: "Ciment colle flex pour carrelage intérieur et extérieur, haute résistance.",
    imageUrl: "/images/products/ciment-colle-flex.jpg",
    imageUrlHD: "/images/products/HD/ciment-colle-flex.jpg",
    slug: "ciment-colle-flex",
  },
  {
    title: "Perceuse Visseuse Sans Fil",
    subtitle: "18 V - Batterie 2 Ah",
    descriptionSEO: "Perceuse visseuse sans fil compacte pour travaux pro et bricolage.",
    imageUrl: "/images/products/perceuse-visseuse-sans-fil.jpg",
    imageUrlHD: "/images/products/HD/perceuse-visseuse-sans-fil.jpg",
    slug: "perceuse-visseuse-sans-fil",
  },
];

export const productCategoryLinks: ProductCategoryLink[] = [
  { prodslug: "carrelage-grand-format", catslug: "sol-interieur" },
  { prodslug: "mitigeur-cuisine-extractible", catslug: "mitigeurs-cuisine" },
  { prodslug: "receveur-douche-extraplat", catslug: "espace-douche" },
  { prodslug: "ciment-colle-flex", catslug: "colles-et-joints" },
  { prodslug: "perceuse-visseuse-sans-fil", catslug: "outillage-electroportatif" },
];


export const categoriesData: Category[] = [
  {
    title: "Carrelage & Revêtements",
    subtitle: "",
    slug: "carrelage-et-revetements",
    descriptionSEO: "Découvrez notre sélection de carrelage sol intérieur, sol extérieur antidérapant, faïence murale cuisine salle de bain, mosaïque piscine et margelles pour revêtements durables et design.",
    href: "#",
    imageUrl: "/images/categories/carrelage-et-revetements/index.jpg",
    imageUrlHD: "/images/categories/carrelage-et-revetements/HD/index.jpg",
    parent: null,
    
  }
  , {  parent: "carrelage-et-revetements", slug: "sol-interieur", href: "",            imageUrl: "/images/categories/carrelage-et-revetements/sol-interieur.jpg", imageUrlHD: "/images/categories/carrelage-et-revetements/HD/sol-interieur.jpg", title: "Sol Intérieur", subtitle: "Grès, Émaillé, Poli, Effet Marbre", descriptionSEO: "Carrelage sol intérieur grès cérame, émaillé poli effet marbre pour espaces résidentiels et commerciaux élégants et résistants." }
  , {  parent: "carrelage-et-revetements", slug: "sol-exterieur", href: "",            imageUrl: "/images/categories/carrelage-et-revetements/sol-exterieur.jpg", imageUrlHD: "/images/categories/carrelage-et-revetements/HD/sol-exterieur.jpg", title: "Sol Extérieur", subtitle: "Antidérapant, Terrasse", descriptionSEO: "Carrelage sol extérieur antidérapant terrasse pour extérieurs durables, résistants au gel et faciles d'entretien." }
  , {  parent: "carrelage-et-revetements", slug: "faience-murale", href: "",           imageUrl: "/images/categories/carrelage-et-revetements/faience-murale.jpg", imageUrlHD: "/images/categories/carrelage-et-revetements/HD/faience-murale.jpg", title: "Faïence Murale", subtitle: "Cuisine, Salle de bain, Décors", descriptionSEO: "Faïence murale cuisine salle de bain décors design pour revêtements muraux modernes et imperméables." }
  , {  parent: "carrelage-et-revetements", slug: "piscine-et-mosaique", href: "",      imageUrl: "/images/categories/carrelage-et-revetements/piscine-et-mosaique.jpg", imageUrlHD: "/images/categories/carrelage-et-revetements/HD/piscine-et-mosaique.jpg", title: "Piscine & Mosaïque", subtitle: "Pâte de verre, Grès Cérame", descriptionSEO: "Mosaïque piscine pâte de verre grès cérame antidérapante pour bassins et espaces aquatiques sécurisés." }
  , {  parent: "carrelage-et-revetements", slug: "margelles-et-finitions", href: "",   imageUrl: "/images/categories/carrelage-et-revetements/margelles-et-finitions.jpg", imageUrlHD: "/images/categories/carrelage-et-revetements/HD/margelles-et-finitions.jpg", title: "Margelles & Finitions", subtitle: "Margelles, Appuis de fenêtre", descriptionSEO: "Margelles piscine appuis de fenêtre en pierre ou cérame pour finitions extérieures élégantes et résistantes." }
  , {  parent: "carrelage-et-revetements", slug: "plinthes-et-accessoires", href: "",  imageUrl: "/images/categories/carrelage-et-revetements/plinthes-et-accessoires.jpg", imageUrlHD: "/images/categories/carrelage-et-revetements/HD/plinthes-et-accessoire.jpg", title: "Plinthes & Accessoires", subtitle: "", descriptionSEO: "Plinthes carrelage et accessoires de finition pour un rendu professionnel et impeccable." }

  , {
    title: "Sanitaire & Bain",
    subtitle: "",
    slug: "sanitaire-et-bain",
    descriptionSEO: "Meubles salle de bain design, WC suspendus, lavabos vasques, receveurs douche, baignoires balnéo pour salle de bain moderne et fonctionnelle.",
    imageUrl: "/images/categories/sanitaire-et-bain/index.jpg",
    imageUrlHD: "/images/categories/sanitaire-et-bain/HD/index.jpg",
    href: "#",
    parent: null,
    
  }
   , {  parent: "sanitaire-et-bain", slug: "meubles-de-salle-de-bain", href: "", imageUrl: "/images/categories/sanitaire-et-bain/meubles-de-salle-de-bain.jpg", imageUrlHD: "/images/categories/sanitaire-et-bain/HD/meubles-de-salle-de-bain.jpg", title: "Meubles de Salle de Bain", subtitle: "", descriptionSEO: "Meubles de salle de bain suspendus modulables avec vasques intégrées pour rangement optimisé et design contemporain." }
   , {  parent: "sanitaire-et-bain", slug: "cuvettes-et-wc", href: "", imageUrl: "/images/categories/sanitaire-et-bain/cuvettes-et-wc.jpg", imageUrlHD: "/images/categories/sanitaire-et-bain/HD/cuvettes-et-wc.jpg", title: "Cuvettes & WC", subtitle: "Suspendus, Au sol, Packs WC", descriptionSEO: "Cuvettes & WC suspendus au sol packs complets économes en eau et faciles à installer." }
   , {  parent: "sanitaire-et-bain", slug: "lavabos-et-vasques", href: "", imageUrl: "/images/categories/sanitaire-et-bain/lavabos-et-vasques.jpg", imageUrlHD: "/images/categories/sanitaire-et-bain/HD/lavabos-et-vasques.jpg", title: "Lavabos & Vasques", subtitle: "", descriptionSEO: "Lavabos & vasques salle de bain encastrés ou posés en céramique design pour tous styles." }
   , {  parent: "sanitaire-et-bain", slug: "espace-douche", href: "", imageUrl: "/images/categories/sanitaire-et-bain/espace-douche.jpg", imageUrlHD: "/images/categories/sanitaire-et-bain/HD/espace-douche.jpg", title: "Espace Douche", subtitle: "Receveurs, Parois, Cabines", descriptionSEO: "Receveurs douche parois verre cabines italiennes pour espace douche italienne sécurisé et esthétique." }
   , {  parent: "sanitaire-et-bain", slug: "baignoires-et-balnea", href: "", imageUrl: "/images/categories/sanitaire-et-bain/baignoires-et-balneo.jpg", imageUrlHD: "/images/categories/sanitaire-et-bain/HD/baignoires-et-balneo.jpg", title: "Baignoires & Balnéo", subtitle: "", descriptionSEO: "Baignoires & balnéo massage hydrojets pour détente bien-être luxe dans votre salle de bain." }
  
  , {
    title: "Robinetterie",
    subtitle: "",
    slug: "robinetterie",
    imageUrl: "/images/categories/robinetterie/index.jpg",
    imageUrlHD: "/images/categories/robinetterie/HD/index.jpg",
    descriptionSEO: "Robinetterie salle de bain lavabo bidet, mitigeurs cuisine, colonnes douche thermostatiques, robinetterie PMR temporisée.",
    href: "#",
    parent: null,
    
  }
  , {  parent: "robinetterie", slug: "robinetterie-salle-de-bain", href: "", imageUrl: "/images/categories/robinetterie/robinetterie-salle-de-bain.jpg", imageUrlHD: "/images/categories/robinetterie/HD/robinetterie-salle-de-bain.jpg", title: "Robinetterie Salle de Bain", subtitle: "Lavabo, Bidet, Encastré", descriptionSEO: "Robinetterie Salle de Bain: Robinet lavabo bidet salle de bain encastré design chromé ou mat noir." }
  , {  parent: "robinetterie", slug: "robinetterie-cuisine", href: "", imageUrl: "/images/categories/robinetterie/robinetterie-cuisine.jpg", imageUrlHD: "/images/categories/robinetterie/HD/robinetterie-cuisine.jpg", title: "Robinetterie Cuisine", subtitle: "", descriptionSEO: "Robinetterie Cuisine: Mitigeur évier cuisine extractible anticalcaire pour usage intensif." }
  , {  parent: "robinetterie", slug: "colonnes-de-douche", href: "", imageUrl: "/images/categories/robinetterie/colonnes-de-douche.jpg", imageUrlHD: "/images/categories/robinetterie/HD/colonnes-de-douche.jpg", title: "Colonnes de Douche", subtitle: "Colonnes, Barres, Pommeaux", descriptionSEO: "Colonnes de Douche thermostatiques barres de douche pommeaux pluie multifonctions." }
  , {  parent: "robinetterie", slug: "collectivite-et-pmr", href: "", imageUrl: "/images/categories/robinetterie/collectivite-et-pmr.jpg", imageUrlHD: "/images/categories/robinetterie/HD/collectivite-et-pmr.jpg", title: "Collectivité & PMR", subtitle: "Temporisé, Électronique", descriptionSEO: "Collectivité & PMR: Robinetterie PMR collectivité temporisée électronique sans contact hygiénique." }

  , {
    title: "Univers Cuisine",
    subtitle: "",
    slug: "univers-cuisine",
    descriptionSEO: "Éviers cuisine inox granit céramique, mitigeurs extractibles, accessoires rangements tiroirs pour cuisine équipée moderne.",
    imageUrl: "/images/categories/univers-cuisine/index.jpg",
    imageUrlHD: "/images/categories/univers-cuisine/HD/index.jpg",
    href: "#",
    parent: null,
    
  }
  , {  parent: "univers-cuisine", slug: "eviers-de-cuisine", href: "", imageUrl: "/images/categories/univers-cuisine/eviers-de-cuisine.jpg", imageUrlHD: "/images/categories/univers-cuisine/HD/eviers-de-cuisine.jpg", title: "Éviers de Cuisine", subtitle: "Inox, Granit, Céramique", descriptionSEO: "Éviers de cuisine inox granit composite céramique 1 ou 2 cuves avec égouttoir." }
  , {  parent: "univers-cuisine", slug: "mitigeurs-cuisine", href: "", imageUrl: "/images/categories/univers-cuisine/mitigeurs-cuisine.jpg", imageUrlHD: "/images/categories/univers-cuisine/HD/mitigeurs-cuisine.jpg", title: "Mitigeurs Cuisine", subtitle: "", descriptionSEO: "Mitigeurs cuisine haut extractible bec rétractable pour vaisselle facile." }
  , {  parent: "univers-cuisine", slug: "accessoires-et-rangements", href: "", imageUrl: "/images/categories/univers-cuisine/accessoires-et-rangements.jpg", imageUrlHD: "/images/categories/univers-cuisine/HD/accessoires-et-rangements.jpg", title: "Accessoires & Rangements", subtitle: "", descriptionSEO: "Accessoires & Rangements cuisine doseurs savon vidage paniers tiroirs modulables." }

  , {
    title: "Matériaux de Construction",
    subtitle: "",
    slug: "materiaux-de-construction",
    descriptionSEO: "Ciments colles carrelage joints silicone, produits étanchéité sous-carrelage, nettoyants protecteurs pour chantiers pros.",
    imageUrl: "/images/categories/materiaux-de-construction/index.jpg",
    imageUrlHD: "/images/categories/materiaux-de-construction/HD/index.jpg",
    href: "#",
    parent: null,
    
  }
  , {  parent: "materiaux-de-construction", slug: "ciments-et-liants", href: "", imageUrl: "", imageUrlHD: "", title: "Ciments & Liants", subtitle: "Fer, Sable, Gravier, Briques", descriptionSEO: "Ciments liants chaux mortier sable gravier briques pour maçonnerie et fondations." }
  , {  parent: "materiaux-de-construction", slug: "colles-et-joints", href: "", imageUrl: "", imageUrlHD: "", title: "Colles & Joints", subtitle: "Colle, Époxy, Joint Piscine", descriptionSEO: "Colle carrelage flex adhésif époxy joints silicone piscine hydrofuges." }
  , {  parent: "materiaux-de-construction", slug: "etancheite", href: "", imageUrl: "", imageUrlHD: "", title: "Étanchéité", subtitle: "Sous-carrelage, Bassin Piscine", descriptionSEO: "Étanchéité liquide sous-carrelage membrane bassin piscine imperméable." }
  , {  parent: "materiaux-de-construction", slug: "traitment-et-nettoyage", href: "", imageUrl: "", imageUrlHD: "", title: "Traitement & Nettoyage", subtitle: "Protecteurs, Nettoyants", descriptionSEO: "Produits traitement pierre protecteurs imperméabilisants nettoyants carrelage anti-moisissure." }
  
 , {
    title: "Peintures & Décoration",
    subtitle: "",
    slug: "peintures-et-decoration",
    descriptionSEO: "Large sélection de peintures et solutions décoratives pour sublimer vos espaces intérieurs et extérieurs. Produits de qualité professionnelle offrant durabilité, finition élégante et protection optimale pour tous vos projets de rénovation et de décoration.",
    imageUrl: "/images/categories/peintures-et-decoration/index.jpg",
    imageUrlHD: "/images/categories/peintures-et-decoration/HD/index.jpg",
    href: "#",
    parent: null,
    
  }
  , {  parent: "peintures-et-decoration", slug: "gamme-interieure", href: "", imageUrl: "", imageUrlHD: "", title: "Peintures", subtitle: "Peinture murale, encre de peinture", descriptionSEO: "Peintures murales et encre de peinture pour intérieur et extérieur, résistantes aux intempéries et faciles à appliquer." }
  , {  parent: "peintures-et-decoration", slug: "gamme-exterieure", href: "", imageUrl: "", imageUrlHD: "", title: "Décoration", subtitle: "Papier peint, revêtements muraux", descriptionSEO: "Solutions décoratives pour sublimer vos espaces intérieurs et extérieurs, papier peint et revêtements muraux de qualité." }
  , {  parent: "peintures-et-decoration", slug: "beton-cire", href: "", imageUrl: "", imageUrlHD: "", title: "Béton Ciré", subtitle: "Solutions pour le sol", descriptionSEO: "Solutions pour le sol: béton ciré, revêtements de sol de qualité." }

];
