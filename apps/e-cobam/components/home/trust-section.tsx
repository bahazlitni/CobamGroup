import { BadgeCheck, FileText, Headphones, PackageCheck } from "lucide-react";

const trustItems = [
  {
    icon: BadgeCheck,
    title: "Produits sélectionnés",
    text: "Les références visibles en ligne viennent du catalogue COBAM GROUP et restent pilotées depuis l'espace staff.",
  },
  {
    icon: PackageCheck,
    title: "Stock lisible",
    text: "La disponibilité est présentée sans masquer les cas qui nécessitent une confirmation commerciale.",
  },
  {
    icon: FileText,
    title: "Fiches et certificats",
    text: "La structure produit est prête pour les fiches techniques, certificats, images, couleurs et finitions.",
  },
  {
    icon: Headphones,
    title: "Accompagnement projet",
    text: "Pour les paniers techniques, le devis reste le meilleur point d'entrée avant validation finale.",
  },
];

export function TrustSection() {
  return (
    <section className="bg-white py-14 sm:py-18 lg:py-24">
      <div className="commerce-container">
        <div className="rounded-[2rem] border border-ec-line bg-ec-ink p-6 text-white shadow-[0_22px_70px_rgba(16,32,47,0.16)] sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.4fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ec-blue">
                Pourquoi e-cobam
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">
                Un site de vente pensé pour les achats techniques.
              </h2>
              <p className="mt-5 text-sm leading-7 text-white/65">
                Le but va au-delà de la simple vitrine produit. La navigation doit aider à
                choisir, vérifier et demander conseil quand la décision dépend du chantier.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {trustItems.map((item) => (
                <div key={item.title} className="rounded-[1.25rem] border border-white/10 bg-white/[0.06] p-5">
                  <span className="grid size-11 place-items-center rounded-full bg-ec-blue/15 text-ec-blue">
                    <item.icon className="size-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/58">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
