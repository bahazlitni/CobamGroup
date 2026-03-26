import type { StaffSelectGroupedOption, StaffSelectOption } from "@/components/staff/ui/PanelSelect";

export const OTHER_JOB_TITLE_VALUE = "__other__";
export const JOB_TITLE_OPTIONS: StaffSelectGroupedOption[] = [
  {
    label: "Direction",
    items: [
      {
        label: "Directeur général",
        value: "Directeur général",
      } satisfies StaffSelectOption,
      {
        label: "Directeur général adjoint",
        value: "Directeur général adjoint",
      } satisfies StaffSelectOption,
      {
        label: "Directeur commercial",
        value: "Directeur commercial",
      } satisfies StaffSelectOption,
      {
        label: "Directeur administratif et financier",
        value: "Directeur administratif et financier",
      } satisfies StaffSelectOption,
      {
        label: "Directeur marketing",
        value: "Directeur marketing",
      } satisfies StaffSelectOption,
      {
        label: "Directeur technique",
        value: "Directeur technique",
      } satisfies StaffSelectOption,
    ],
  },
  {
    label: "Administration & support",
    items: [
      {
        label: "Assistant(e) de direction",
        value: "Assistant(e) de direction",
      } satisfies StaffSelectOption,
      {
        label: "Assistant(e) administratif(ve)",
        value: "Assistant(e) administratif(ve)",
      } satisfies StaffSelectOption,
      {
        label: "Responsable ressources humaines",
        value: "Responsable ressources humaines",
      } satisfies StaffSelectOption,
      {
        label: "Comptable",
        value: "Comptable",
      } satisfies StaffSelectOption,
      {
        label: "Responsable informatique",
        value: "Responsable informatique",
      } satisfies StaffSelectOption,
    ],
  },
  {
    label: "Commercial & relation client",
    items: [
      {
        label: "Responsable commercial",
        value: "Responsable commercial",
      } satisfies StaffSelectOption,
      {
        label: "Commercial(e)",
        value: "Commercial(e)",
      } satisfies StaffSelectOption,
      {
        label: "Technico-commercial(e)",
        value: "Technico-commercial(e)",
      } satisfies StaffSelectOption,
      {
        label: "Chargé(e) de clientèle",
        value: "Chargé(e) de clientèle",
      } satisfies StaffSelectOption,
      {
        label: "Responsable service client",
        value: "Responsable service client",
      } satisfies StaffSelectOption,
    ],
  },
  {
    label: "Marketing & digital",
    items: [
      {
        label: "Responsable marketing",
        value: "Responsable marketing",
      } satisfies StaffSelectOption,
      {
        label: "Chargé(e) de communication",
        value: "Chargé(e) de communication",
      } satisfies StaffSelectOption,
      {
        label: "Community manager",
        value: "Community manager",
      } satisfies StaffSelectOption,
      {
        label: "Graphiste",
        value: "Graphiste",
      } satisfies StaffSelectOption,
      {
        label: "Webmaster",
        value: "Webmaster",
      } satisfies StaffSelectOption,
    ],
  },
  {
    label: "Produit, technique & opérations",
    items: [
      {
        label: "Responsable showroom",
        value: "Responsable showroom",
      } satisfies StaffSelectOption,
      {
        label: "Responsable magasin",
        value: "Responsable magasin",
      } satisfies StaffSelectOption,
      {
        label: "Responsable logistique",
        value: "Responsable logistique",
      } satisfies StaffSelectOption,
      {
        label: "Responsable achats",
        value: "Responsable achats",
      } satisfies StaffSelectOption,
      {
        label: "Technicien(ne) SAV",
        value: "Technicien(ne) SAV",
      } satisfies StaffSelectOption,
      {
        label: "Conseiller(ère) technique",
        value: "Conseiller(ère) technique",
      } satisfies StaffSelectOption,
    ],
  },
  {
    label: "Étudiant",
    items: [
      {
        label: "Stagiaire en alternance",
        value: "Stagiaire en alternance",
      } satisfies StaffSelectOption,
      {
        label: "Stagiaire ouvrier",
        value: "Stagiaire ouvrier",
      } satisfies StaffSelectOption,
      {
        label: "Stagiaire PFE",
        value: "Stagiaire PFE",
      } satisfies StaffSelectOption,
      {
        label: "Stagiaire",
        value: "Stagiaire",
      } satisfies StaffSelectOption,
    ],
  },
    {
    label: "Personnalisé",
    items: [
      {
        label: "Autre",
        value: OTHER_JOB_TITLE_VALUE,
      } satisfies StaffSelectOption,
    ],
  },
] satisfies StaffSelectGroupedOption[];



export const ALL_JOB_TITLES: string[] = JOB_TITLE_OPTIONS.flatMap(
  (group: StaffSelectGroupedOption) => group.items.map((groupItem) => groupItem.value)
)

export function normalizeJobTitle(value: string) {
  return value.trim().toLocaleLowerCase();
}

export function findKnownJobTitle(value: string | null | undefined) {
  if (!value) return null;
  const normalized = normalizeJobTitle(value);
  return (
    ALL_JOB_TITLES.find((title) => normalizeJobTitle(title) === normalized) ??
    null
  );
}
