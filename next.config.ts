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
        source: "/a-propos-de-nous/:slash?",
        destination: "/a-propos",
        permanent: true,
      },
      {
        source: "/2025/08/26/guide-expert-2025-marbre-et-faience/:slash?",
        destination: "/actualites/gres-cerame-faience-ou-marbre-le-guide-d-expert-2025-qui-va-revolutionner-votre-choix",
        permanent: true,
      },
      {
        source: "/2025/09/05/erreurs-choix-materiaux-de-construction/:slash?",
        destination: "/actualites/les-7-erreurs-a-eviter-dans-le-choix-de-vos-fournisseurs-de-materiaux-de-construction",
        permanent: true,
      },
      {
        source: "/produit-de-finition-en-tunisie/:slash?",
        destination: "/produits/revetements-de-sols-et-murs/produits-de-pose-finition",
        permanent: true,
      },
      {
        source: "/coming-soon/:slash?",
        destination: "/",
        permanent: true,
      },
      {
        source: "/product/melangeur-de-bain-douche-monastir/:slash?",
        destination: "/produits/salle-de-bain-et-cuisine/robinetterie/famille/melangeur-de-bain-douche-monastir",
        permanent: true,
      },
      {
        source: "/produit-de-finition-en-tunisie/robinetterie/:slash?",
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
        source: "/produits/robinetterie/robinetterie-cuisine/:slash?",
        destination: "/produits/salle-de-bain-et-cuisine/robinetterie",
        permanent: true,
      },
      {
        source: "/produit-de-base-en-tunisie/fer/:slash?",
        destination: "/produits/materiaux-de-construction/treillis-soudes-et-fers-a-beton",
        permanent: true,
      },
      {
        source: "/produit-de-base-en-tunisie/produits-rouge/:slash?",
        destination: "/produits/materiaux-de-construction/briques",
        permanent: true,
      },
      {
        source: "/product/pierre-de-bali-eco-ceramic/:slash?",
        destination: "/produits/piscine/pierres-de-bali",
        permanent: true,
      },
      {
        source: "/product/meuble-eco/:slash?",
        destination: "/produits",
        permanent: true,
      },
      {
        source: "/product/meuble-nobel/:slash?",
        destination: "/produits",
        permanent: true,
      },
      {
        source: "/product/meuble-seville/:slash?",
        destination: "/produits",
        permanent: true,
      },
      {
        source: "/product/melangeur-de-lavabo-monastir/:slash?",
        destination: "/produits/salle-de-bain-et-cuisine/robinetterie",
        permanent: true,
      },
      {
        source: "/product/melangeur-devier-tabarka/:slash?",
        destination: "/produits/salle-de-bain-et-cuisine/robinetterie",
        permanent: true,
      },
      {
        source: "/product/melangeur-devier-tozeur/:slash?",
        destination: "/produits/salle-de-bain-et-cuisine/robinetterie",
        permanent: true,
      },
      {
        source: "/product/melangeur-monastir/:slash?",
        destination: "/produits/salle-de-bain-et-cuisine/robinetterie",
        permanent: true,
      },
      {
        source: "/product/mitigeur-de-bain-douche-douz/:slash?",
        destination: "/produits/salle-de-bain-et-cuisine/robinetterie",
        permanent: true,
      },
      {
        source: "/product/mitigeur-devier-3-entrees-2-sorties-bizerte/:slash?",
        destination: "/produits/salle-de-bain-et-cuisine/robinetterie",
        permanent: true,
      },
      {
        source: "/product/mitigeur-devier-a-col-de-cygne-djerba/:slash?",
        destination: "/produits/salle-de-bain-et-cuisine/robinetterie",
        permanent: true,
      },
      {
        source: "/product/mitigeur-electronique-mural-avec-pile-maktaris/:slash?",
        destination: "/produits/salle-de-bain-et-cuisine/robinetterie",
        permanent: true,
      },
      {
        source: "/product/exposed-part-kit-of-cloud-touch-shower-system-2/:slash?",
        destination: "/produits/salle-de-bain-et-cuisine/espace-douche",
        permanent: true,
      },
      {
        source: "/product/robinet-electronique-pour-lavabo-avec-pile-7-2v-aqua/:slash?",
        destination: "/produits/salle-de-bain-et-cuisine/robinetterie",
        permanent: true,
      },
      {
        source: "/category/marbre/:slash?",
        destination: "/produits/revetements-de-sols-et-murs/carrelage-interieur",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
