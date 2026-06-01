import type { NextConfig } from "next";

function getMediaUploadBodyLimit() {
  const parsedMegabytes = Number(process.env.MEDIA_MAX_UPLOAD_MB ?? "100");
  const megabytes = Number.isFinite(parsedMegabytes) && parsedMegabytes > 0 ? parsedMegabytes : 100;

  return Math.ceil(megabytes * 1024 * 1024);
}

const nextConfig: NextConfig = {
  transpilePackages: ["@cobam/db", "@cobam/media-storage", "@cobam/shared"],
  htmlLimitedBots: /.*/,
  experimental: {
    proxyClientMaxBodySize: getMediaUploadBodyLimit(),
  },
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
        destination:
          "/actualites/gres-cerame-faience-ou-marbre-le-guide-d-expert-2025-qui-va-revolutionner-votre-choix",
        permanent: true,
      },
      {
        source: "/2025/09/05/erreurs-choix-materiaux-de-construction/:slash?",
        destination:
          "/actualites/les-7-erreurs-a-eviter-dans-le-choix-de-vos-fournisseurs-de-materiaux-de-construction",
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
        destination:
          "/produits/salle-de-bain-et-cuisine/robinetterie/famille/melangeur-de-bain-douche-monastir",
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

      {
        source: "/services/:slash?",
        destination: "/",
        permanent: true,
      },
      {
        source: "/produit-de-finition-en-tunisie/page/2/:slash?",
        destination: "/produits/revetements-de-sols-et-murs/produits-de-pose-finition",
        permanent: true,
      },
      {
        source: "/produit-de-base-en-tunisie/produits-carriere/:slash?",
        destination: "/produits/materiaux-de-construction",
        permanent: true,
      },
      {
        source: "/produit-de-base-en-tunisie/ciment/:slash?",
        destination: "/produits/materiaux-de-construction/ciments-et-produits-en-beton",
        permanent: true,
      },
      {
        source: "/product/thin-rim-table-top-basin-organic-white-matt/:slash?",
        destination: "/produits",
        permanent: true,
      },
      {
        source: "/produit-de-base-en-tunisie/:slash?",
        destination: "/produits/materiaux-de-construction",
        permanent: true,
      },
      {
        source: "/product/pierre-de-bali-pamesa/:slash?",
        destination: "/produits/piscine/pierres-de-bali",
        permanent: true,
      },
      {
        source: "/product/niagara-paroi-fixe-avec-bras-de-soutien/:slash?",
        destination: "/produits",
        permanent: true,
      },
      {
        source: "/product/meuble-eclat/:slash?",
        destination: "/produits",
        permanent: true,
      },
      {
        source: "/product/meuble-perla/:slash?",
        destination: "/produits",
        permanent: true,
      },
      {
        source: "/product/meuble-bora/:slash?",
        destination: "/produits",
        permanent: true,
      },
      {
        source: "/product/colonne-de-douche-avec-inverseur-zarzis/:slash?",
        destination:
          "/produits/salle-de-bain-et-cuisine/espace-douche/sopal-colonne-de-douche-carre-avec-inverseur-zarzis",
        permanent: true,
      },
      {
        source: "/product/ciment-colle/:slash?",
        destination: "/produits?search=ciment%20colle",
        permanent: true,
      },
      {
        source: "/product/ciment/:slash?",
        destination: "/produits/materiaux-de-construction/ciments-et-produits-en-beton",
        permanent: true,
      },
      {
        source: "/product/briques-rouges-platriere/:slash?",
        destination: "/produits/materiaux-de-construction/briques",
        permanent: true,
      },
      {
        source: "/product/celer/:slash?",
        destination: "/produits",
        permanent: true,
      },
      {
        source: "/product-category/produit-de-finition/robinetterie/sopal/:slash?",
        destination: "/produits?search=brand%3A2%3DSopal",
        permanent: true,
      },
      {
        source:
          "/product-category/produit-de-finition/robinetterie/jaquar/sanitaire-jaquar/jdr/:slash?",
        destination: "/produits?search=brand%3A2%3DJaquar",
        permanent: true,
      },
      {
        source:
          "/product-category/produit-de-finition/robinetterie/jaquar/sanitaire-jaquar/:slash?",
        destination: "/produits?search=brand%3A2%3DJaquar",
        permanent: true,
      },
      {
        source: "/product-category/produit-de-finition/robinetterie/jaquar/:slash?",
        destination: "/produits?search=brand%3A2%3DJaquar",
        permanent: true,
      },
      {
        source: "/product-category/produit-de-finition/robinetterie/jaquar/robinets/:slash?",
        destination: "/produits?search=brand%3A2%3DJaquar",
        permanent: true,
      },
      {
        source: "/product-category/produit-de-base/produits-carriere/:slash?",
        destination: "/produits",
        permanent: true,
      },
      {
        source: "/product-category/produit-de-finition/robinetterie/:slash?",
        destination: "/produits/salle-de-bain-et-cuisine/robinetterie",
        permanent: true,
      },
      {
        source: "/nos-histoire/:slash?",
        destination: "/a-propos",
        permanent: true,
      },
      {
        source: "/category/materiaux-de-construction/:slash?",
        destination: "/produits/materiaux-de-construction",
        permanent: true,
      },
      {
        source: "/about/:slash?",
        destination: "/a-propos",
        permanent: true,
      },
      {
        "source": "/produits/revetements-de-sols-et-murs/produits-de-pose-finition/deutsch-color-carrojoint-beige-18-intense-%C3%A9tanche-5kg-00249058",
        "destination": "/produits/revetements-de-sols-et-murs/produits-de-pose-finition/deutsch-color-carrojoint-beige-18-intense-etanche-5kg-00249058",
        "permanent": true
      },
      {
        "source": "/produits/revetements-de-sols-et-murs/produits-de-pose-finition/deutsch-color-carrojoint-dark-bleu-24-intense-%C3%A9tanche-2kg-00235150",
        "destination": "/produits/revetements-de-sols-et-murs/produits-de-pose-finition/deutsch-color-carrojoint-dark-bleu-24-intense-etanche-2kg-00235150",
        "permanent": true
      },
      {
        "source": "/produits/revetements-de-sols-et-murs/produits-de-pose-finition/deutsch-color-carrojoint-blanc-intense-%C3%A9tanche-5kg-00221993",
        "destination": "/produits/revetements-de-sols-et-murs/produits-de-pose-finition/deutsch-color-carrojoint-blanc-intense-etanche-5kg-00221993",
        "permanent": true
      },
      {
        "source": "/produits/revetements-de-sols-et-murs/produits-de-pose-finition/deutsch-color-carrojoint-gris-04-intense-%C3%A9tanche-5kg-00225137",
        "destination": "/produits/revetements-de-sols-et-murs/produits-de-pose-finition/deutsch-color-carrojoint-gris-04-intense-etanche-5kg-00225137",
        "permanent": true
      },
      {
        "source": "/produits/revetements-de-sols-et-murs/produits-de-pose-finition/deutsch-color-carrojoint-gris-moyen-17-intense-%C3%A9tanche-5kg-00224086",
        "destination": "/produits/revetements-de-sols-et-murs/produits-de-pose-finition/deutsch-color-carrojoint-gris-moyen-17-intense-etanche-5kg-00224086",
        "permanent": true
      },
      {
        "source": "/produits/revetements-de-sols-et-murs/produits-de-pose-finition/deutsch-color-carrojoint-beige-18-intense-%C3%A9tanche-5kg-00224796",
        "destination": "/produits/revetements-de-sols-et-murs/produits-de-pose-finition/deutsch-color-carrojoint-beige-18-intense-etanche-5kg-00224796",
        "permanent": true
      },
      {
        "source": "/produits/revetements-de-sols-et-murs/produits-de-pose-finition/deutsch-color-carrojoint-black-02-intense-%C3%A9tanche-5kg-00246699",
        "destination": "/produits/revetements-de-sols-et-murs/produits-de-pose-finition/deutsch-color-carrojoint-black-02-intense-etanche-5kg-00246699",
        "permanent": true
      },
      {
        "source": "/produits/revetements-de-sols-et-murs/produits-de-pose-finition/deutsch-color-carrojoint-umber-50-intense-%C3%A9tanche-5kg-00248587",
        "destination": "/produits/revetements-de-sols-et-murs/produits-de-pose-finition/deutsch-color-carrojoint-umber-50-intense-etanche-5kg-00248587",
        "permanent": true
      },
      {
        "source": "/produits/revetements-de-sols-et-murs/produits-de-pose-finition/deutsch-color-carrojoint-light-grey-05-intense-%C3%A9tanche-5kg-00237581",
        "destination": "/produits/revetements-de-sols-et-murs/produits-de-pose-finition/deutsch-color-carrojoint-light-grey-05-intense-etanche-5kg-00237581",
        "permanent": true
      },
      {
        "source": "/produits/revetements-de-sols-et-murs/produits-de-pose-finition/deutsch-color-carrojoint-manhattan-15-intense-%C3%A9tanche-5kg-00225557",
        "destination": "/produits/revetements-de-sols-et-murs/produits-de-pose-finition/deutsch-color-carrojoint-manhattan-15-intense-etanche-5kg-00225557",
        "permanent": true
      },
      {
        "source": "/produits/revetements-de-sols-et-murs/produits-de-pose-finition/deutsch-color-carrojoint-silver-grey-16-intense-%C3%A9tanche-5kg-00249065",
        "destination": "/produits/revetements-de-sols-et-murs/produits-de-pose-finition/deutsch-color-carrojoint-silver-grey-16-intense-etanche-5kg-00249065",
        "permanent": true
      }
    ];
  },
};

export default nextConfig;
