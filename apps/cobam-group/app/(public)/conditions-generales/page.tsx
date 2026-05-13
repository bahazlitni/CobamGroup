import type { Metadata } from "next";
import CobamSignature from "@/components/ui/custom/CobamSignature";

export const metadata: Metadata = {
  title: "Conditions générales",
  description:
    "Consultez les conditions générales de Cobam Group relatives aux demandes, devis, commandes et services.",
  alternates: {
    canonical: "/conditions-generales",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
  return (
    <main className="bg-cobam-light-bg px-6 py-24 text-cobam-dark-blue">
      <section className="mx-auto max-w-3xl space-y-10">
        {/* HEADER */}
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cobam-water-blue">
            Legal
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight">
            Conditions générales
          </h1>
          <p className="mt-6 text-cobam-carbon-grey">
            Dernière mise à jour : {new Date().getFullYear()}
          </p>
        </header>

        {/* INTRO */}
        <section className="space-y-4">
          <p className="leading-7 text-cobam-carbon-grey">
            Les présentes conditions générales définissent les modalités
            applicables aux relations entre Cobam Group et toute personne
            effectuant une demande, sollicitant un devis ou passant commande via
            le site ou tout autre canal de communication.
          </p>
        </section>

        {/* OBJET */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">1. Objet</h2>
          <p className="leading-7 text-cobam-carbon-grey">
            Les présentes conditions ont pour objet de définir les droits et
            obligations des parties dans le cadre des services proposés par
            Cobam Group, notamment la vente de matériaux de construction et de
            produits associés.
          </p>
        </section>

        {/* PRODUITS */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">2. Produits</h2>
          <p className="leading-7 text-cobam-carbon-grey">
            Les produits présentés sur le site sont fournis à titre indicatif.
            Cobam Group s’efforce de garantir l’exactitude des informations,
            toutefois des variations peuvent exister selon les disponibilités,
            les fournisseurs ou les évolutions techniques.
          </p>
        </section>

        {/* DEVIS */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">3. Devis</h2>
          <p className="leading-7 text-cobam-carbon-grey">
            Toute demande de devis est sans engagement. Les devis établis sont
            valables pour une durée limitée et peuvent être modifiés en fonction
            des conditions du marché ou des spécificités du projet.
          </p>
        </section>

        {/* COMMANDES */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">4. Commandes</h2>
          <p className="leading-7 text-cobam-carbon-grey">
            Toute commande devient ferme après validation par Cobam Group. La
            disponibilité des produits et les délais peuvent varier selon les
            stocks et les conditions d’approvisionnement.
          </p>
        </section>

        {/* PRIX */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">5. Prix</h2>
          <p className="leading-7 text-cobam-carbon-grey">
            Les prix sont indiqués à titre informatif et peuvent être modifiés
            sans préavis. Les conditions tarifaires définitives sont précisées
            lors de l’établissement du devis ou de la commande.
          </p>
        </section>

        {/* RESPONSABILITE */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">6. Responsabilité</h2>
          <p className="leading-7 text-cobam-carbon-grey">
            Cobam Group ne saurait être tenu responsable des dommages indirects
            liés à l’utilisation des produits ou services. L’utilisateur est
            responsable de la bonne utilisation des matériaux conformément aux
            recommandations techniques.
          </p>
        </section>

        {/* MODIFICATION */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            7. Modification des conditions
          </h2>
          <p className="leading-7 text-cobam-carbon-grey">
            Cobam Group se réserve le droit de modifier les présentes conditions
            à tout moment. Les conditions applicables sont celles en vigueur au
            moment de la demande ou de la commande.
          </p>
        </section>

        {/* DROIT APPLICABLE */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">8. Droit applicable</h2>
          <p className="leading-7 text-cobam-carbon-grey">
            Les présentes conditions sont soumises au droit applicable en
            Tunisie. En cas de litige, une solution amiable sera privilégiée
            avant toute action judiciaire.
          </p>
        </section>

        {/* CONTACT */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">9. Contact</h2>
          <p className="leading-7 text-cobam-carbon-grey">
            Pour toute demande, vous pouvez nous contacter via notre page
            contact.
          </p>
        </section>

        {/* SIGNATURE */}
        <CobamSignature />
      </section>
    </main>
  );
}