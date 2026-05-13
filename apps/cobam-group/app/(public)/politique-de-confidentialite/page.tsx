import CobamSignature from "@/components/ui/custom/CobamSignature";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Consultez la politique de confidentialité de Cobam Group et découvrez comment vos données personnelles sont collectées, utilisées et protégées.",
  alternates: {
    canonical: "/politique-de-confidentialite",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-cobam-light-bg px-6 py-24 text-cobam-dark-blue">
      <section className="mx-auto max-w-3xl space-y-10">
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cobam-water-blue">
            Legal
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight">
            Politique de confidentialité
          </h1>
          <p className="mt-6 leading-7 text-cobam-carbon-grey">
            Dernière mise à jour : {new Date().getFullYear()}
          </p>
        </header>

        {/* INTRO */}
        <section className="space-y-4">
          <p className="leading-7 text-cobam-carbon-grey">
            Chez Cobam Group, la protection de vos données personnelles est une
            priorité. Cette politique explique quelles informations nous
            collectons, comment nous les utilisons et quels sont vos droits.
          </p>
        </section>

        {/* DONNEES COLLECTEES */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            1. Données collectées
          </h2>
          <p className="leading-7 text-cobam-carbon-grey">
            Nous pouvons collecter les informations suivantes lorsque vous
            utilisez notre site :
          </p>
          <ul className="list-disc space-y-2 pl-6 text-cobam-carbon-grey">
            <li>Nom et prénom</li>
            <li>Adresse email</li>
            <li>Numéro de téléphone</li>
            <li>Informations relatives à votre demande</li>
            <li>Données de navigation (cookies, adresse IP, etc.)</li>
          </ul>
        </section>

        {/* UTILISATION */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            2. Utilisation des données
          </h2>
          <p className="leading-7 text-cobam-carbon-grey">
            Les données collectées sont utilisées pour :
          </p>
          <ul className="list-disc space-y-2 pl-6 text-cobam-carbon-grey">
            <li>Répondre à vos demandes</li>
            <li>Améliorer nos services et notre site</li>
            <li>Assurer la sécurité de la plateforme</li>
            <li>Respecter nos obligations légales</li>
          </ul>
        </section>

        {/* PARTAGE */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            3. Partage des données
          </h2>
          <p className="leading-7 text-cobam-carbon-grey">
            Vos données ne sont jamais vendues. Elles peuvent être partagées avec
            des prestataires techniques (hébergement, email, analytics)
            uniquement dans le cadre du fonctionnement du site.
          </p>
        </section>

        {/* COOKIES */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            4. Cookies
          </h2>
          <p className="leading-7 text-cobam-carbon-grey">
            Le site peut utiliser des cookies afin d'améliorer votre expérience,
            analyser le trafic et proposer des contenus adaptés. Vous pouvez
            configurer votre navigateur pour refuser les cookies.
          </p>
        </section>

        {/* SECURITE */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            5. Sécurité
          </h2>
          <p className="leading-7 text-cobam-carbon-grey">
            Nous mettons en œuvre des mesures techniques et organisationnelles
            afin de protéger vos données contre tout accès non autorisé,
            altération ou divulgation.
          </p>
        </section>

        {/* DROITS */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            6. Vos droits
          </h2>
          <p className="leading-7 text-cobam-carbon-grey">
            Conformément à la réglementation, vous disposez des droits suivants :
          </p>
          <ul className="list-disc space-y-2 pl-6 text-cobam-carbon-grey">
            <li>Accéder à vos données</li>
            <li>Demander leur modification ou suppression</li>
            <li>Vous opposer à leur traitement</li>
            <li>Demander la portabilité de vos données</li>
          </ul>
        </section>

        {/* CONTACT */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            7. Contact
          </h2>
          <p className="leading-7 text-cobam-carbon-grey">
            Pour toute question relative à cette politique ou à vos données,
            vous pouvez nous contacter via notre formulaire ou par email.
          </p>
        </section>
        <CobamSignature />
      </section>


    </main>
  );
}