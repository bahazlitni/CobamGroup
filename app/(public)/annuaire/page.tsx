import type { Metadata } from "next";
import PageHeader from "@/components/ui/custom/PageHeader";
import AnnuaireDirectory from "@/components/public/annuaire/annuaire-directory";
import { listPublicAnnuairePeople } from "@/features/annuaire/public";
import type { AnnuairePersonDto } from "@/features/annuaire/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Annuaire Cobam",
  description:
    "Annuaire Cobam Group : contacts, postes, sites, extensions et WhatsApp.",
  alternates: {
    canonical: "/annuaire",
  },
};

export default async function AnnuairePage() {
  let people: AnnuairePersonDto[] = [];

  try {
    people = await listPublicAnnuairePeople();
  } catch (error) {
    console.error("PUBLIC_ANNUAIRE_LIST_ERROR:", error);
  }

  return (
    <main className="min-h-screen bg-cobam-light-bg text-cobam-dark-blue">
      <PageHeader
        subtitle="Annuaire Cobam"
        title="Répertoire du personnel"
        description="Retrouvez les contacts, postes, sites, extensions et numeros WhatsApp de l'equipe Cobam Group."
      />

      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnnuaireDirectory people={people} />
        </div>
      </section>
    </main>
  );
}
