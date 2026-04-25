import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  htmlLimitedBots: /.*/,
  images: {
    localPatterns: [
      {
        pathname: "/images/**",
      },
      {
        pathname: "/api/media/**",
      },
      {
        pathname: "/api/staff/medias/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/2025/08/26/guide-expert-2025-marbre-et-faience",
        destination: "/actualites/gres-cerame-faience-ou-marbre-le-guide-d-expert-2025-qui-va-revolutionner-votre-choix",
        permanent: true,
      },
      {
        source: "/2025/09/05/erreurs-choix-materiaux-de-construction",
        destination: "/actualites/les-7-erreurs-a-eviter-dans-le-choix-de-vos-fournisseurs-de-materiaux-de-construction",
        permanent: true,
      },
      {
        source: "/produit-de-finition-en-tunisie",
        destination: "/produits/revetements-de-sols-et-murs/produits-de-pose-finition",
        permanent: true,
      },
      {
        source: "/coming-soon/",
        destination: "/",
        permanent: true,
      },
      {
        source: "/product/melangeur-de-bain-douche-monastir",
        destination: "/produits/salle-de-bain-et-cuisine/robinetterie/famille/melangeur-de-bain-douche-monastir",
        permanent: true,
      },
      {
        source: "/produit-de-finition-en-tunisie/robinetterie",
        destination: "/produits/salle-de-bain-et-cuisine/robinetterie",
        permanent: true,
      },
      {
        source: "/produit-de-finition-en-tunisie/robinetterie/jaquar/:path*",
        destination: "/produits/salle-de-bain-et-cuisine/robinetterie?search=brand:2=jaquar",
        permanent: true,
      },
      {
        source: "/produit-de-finition-en-tunisie/robinetterie/sopal/:path*",
        destination: "/produits/salle-de-bain-et-cuisine/robinetterie?search=brand:2=sopal",
        permanent: true,
      },
      {
        source: "/produits/robinetterie/robinetterie-cuisine",
        destination: "/produits/salle-de-bain-et-cuisine/robinetterie",
        permanent: true,
      },
      {
        source: "/produit-de-base-en-tunisie/fer",
        destination: "/produits/materiaux-de-construction/treillis-soudes-et-fers-a-beton",
        permanent: true,
      },
      {
        source: "/produit-de-base-en-tunisie/produits-rouge",
        destination: "/produits/materiaux-de-construction/briques",
        permanent: true,
      },
      {
        source: "/product/pierre-de-bali-eco-ceramic",
        destination: "/produits/piscine/pierres-de-bali",
        permanent: true,
      },
      {
        source: "/product/meuble-eco/",
        destination: "/produits",
        permanent: true,
      },
      {
        source: "/product/meuble-nobel/",
        destination: "/produits",
        permanent: true,
      },
      {
        source: "/product/meuble-seville/",
        destination: "/produits",
        permanent: true,
      },
      {
        source: "/product/melangeur-de-lavabo-monastir",
        destination: "/produits/salle-de-bain-et-cuisine/robinetterie",
        permanent: true,
      },
      {
        source: "/product/melangeur-devier-tabarka",
        destination: "/produits/salle-de-bain-et-cuisine/robinetterie",
        permanent: true,
      },
      {
        source: "/product/melangeur-devier-tozeur",
        destination: "/produits/salle-de-bain-et-cuisine/robinetterie",
        permanent: true,
      },
      {
        source: "/product/melangeur-monastir",
        destination: "/produits/salle-de-bain-et-cuisine/robinetterie",
        permanent: true,
      },
      {
        source: "/product/mitigeur-de-bain-douche-douz",
        destination: "/produits/salle-de-bain-et-cuisine/robinetterie",
        permanent: true,
      },
      {
        source: "/product/mitigeur-devier-3-entrees-2-sorties-bizerte",
        destination: "/produits/salle-de-bain-et-cuisine/robinetterie",
        permanent: true,
      },
      {
        source: "/product/mitigeur-devier-a-col-de-cygne-djerba",
        destination: "/produits/salle-de-bain-et-cuisine/robinetterie",
        permanent: true,
      },
      {
        source: "/product/mitigeur-electronique-mural-avec-pile-maktaris",
        destination: "/produits/salle-de-bain-et-cuisine/robinetterie",
        permanent: true,
      },
      {
        source: "/product/exposed-part-kit-of-cloud-touch-shower-system-2",
        destination: "/produits/salle-de-bain-et-cuisine/espace-douche",
        permanent: true,
      },
      {
        source: "/product/robinet-electronique-pour-lavabo-avec-pile-7-2v-aqua/",
        destination: "/produits/salle-de-bain-et-cuisine/robinetterie",
        permanent: true,
      },
      {
        source: "/category/marbre",
        destination: "/produits/revetements-de-sols-et-murs/carrelage-interieur",
        permanent: true,
      },
      {
        source: "/coming-soon",
        destination: "/",
        permanent: true,
      },
    ];
  },
};










export default nextConfig;
