import type { Metadata } from "next";
import CobamSignature from "@/components/ui/custom/CobamSignature";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Consultez les mentions légales de Cobam Group : informations sur l’éditeur du site, l’hébergement et les responsabilités.",
  alternates: {
    canonical: "/mentions-legales",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LegalNoticePage() {
  return (
    <main className="bg-cobam-light-bg px-6 py-24 text-cobam-dark-blue">
      <section className="mx-auto max-w-3xl space-y-10">
        {/* HEADER */}
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cobam-water-blue">
            Legal
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight">
            Mentions légales
          </h1>
          <p className="mt-6 text-cobam-carbon-grey">
            Dernière mise à jour : {new Date().getFullYear()}
          </p>
        </header>

        {/* EDITEUR */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">1. Éditeur du site</h2>
          <p className="leading-7 text-cobam-carbon-grey">
            Le présent site est édité par <strong>Cobam Group</strong>,
            spécialiste en matériaux de construction, carrelage, revêtements,
            sanitaires et solutions pour le bâtiment en Tunisie.
          </p>
          <p className="leading-7 text-cobam-carbon-grey">
            Pour toute demande, vous pouvez nous contacter via le formulaire de <Link className="text-cobam-water-blue underline" href="/contact">contact</Link> disponible sur le site.
          </p>
        </section>

        {/* HEBERGEMENT */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">2. Hébergement</h2>
          <p className="leading-7 text-cobam-carbon-grey">
            Le site est hébergé par un prestataire technique assurant la
            disponibilité, la sécurité et la sauvegarde des données.
          </p>
        </section>

        {/* PROPRIETE INTELLECTUELLE */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            3. Propriété intellectuelle
          </h2>
          <p className="leading-7 text-cobam-carbon-grey">
            L’ensemble du contenu présent sur ce site (textes, images,
            graphismes, logo, icônes, etc.) est la propriété exclusive de Cobam
            Group, sauf mention contraire.
          </p>
          <p className="leading-7 text-cobam-carbon-grey">
            Toute reproduction, distribution, modification ou utilisation sans
            autorisation préalable est strictement interdite.
          </p>
        </section>

        {/* RESPONSABILITE */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">4. Responsabilité</h2>
          <p className="leading-7 text-cobam-carbon-grey">
            Cobam Group s’efforce de fournir des informations aussi précises que
            possible. Toutefois, des erreurs ou omissions peuvent survenir.
          </p>
          <p className="leading-7 text-cobam-carbon-grey">
            L’utilisateur du site reconnaît utiliser ces informations sous sa
            responsabilité exclusive.
          </p>
        </section>

        {/* LIENS EXTERNES */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">5. Liens externes</h2>
          <p className="leading-7 text-cobam-carbon-grey">
            Le site peut contenir des liens vers d’autres sites. Cobam Group ne
            peut être tenu responsable du contenu ou des pratiques de ces sites
            tiers.
          </p>
        </section>

        {/* DONNEES */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            6. Données personnelles
          </h2>
          <p className="leading-7 text-cobam-carbon-grey">
            Les informations relatives à la collecte et au traitement des
            données personnelles sont détaillées dans notre politique de
            confidentialité.
          </p>
        </section>

        {/* SIGNATURE */}
        <CobamSignature />
      </section>
    </main>
  );
}