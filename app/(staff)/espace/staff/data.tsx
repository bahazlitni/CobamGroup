import { BadgeCheck, FileText, ImageIcon, Package } from "lucide-react";
import { ReactElement } from "react";
import { PERMISSIONS, type PermissionKey } from "@/features/rbac/permissions";

export type StaffActionData = {
  label: string;
  description: string;
  icon: ReactElement;
  href: string;
  permission: PermissionKey;
};

export const actions: StaffActionData[] = [
  {
    label: "Nouvel article",
    description: "Publier une actualite ou une mise a jour.",
    icon: <FileText className="h-5 w-5" />,
    href: "/espace/staff/gestion/articles/edit",
    permission: PERMISSIONS.ARTICLES_CREATE,
  },
  {
    label: "Nouveau produit",
    description: "Ajouter une reference au catalogue.",
    icon: <Package className="h-5 w-5" />,
    href: "/espace/staff/gestion-des-produits/produits/new",
    permission: PERMISSIONS.PRODUCTS_CREATE,
  },
  {
    label: "Importer un media",
    description: "Telecharger une image ou un document.",
    icon: <ImageIcon className="h-5 w-5" />,
    href: "/espace/staff/gestion/medias",
    permission: PERMISSIONS.MEDIA_CREATE,
  },
  {
    label: "Nouvelle marque",
    description: "Enregistrer une marque partenaire.",
    icon: <BadgeCheck className="h-5 w-5" />,
    href: "/espace/staff/gestion/marques/edit",
    permission: PERMISSIONS.BRANDS_CREATE,
  },
];
