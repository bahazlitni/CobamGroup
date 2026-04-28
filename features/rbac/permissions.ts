import type { PowerType } from "./roles";

export type PermissionDefinition = {
  key: string;
  label: string;
  resource: string;
  action: string;
  scope?: string | null;
  description?: string | null;
  group: string;
};

function definePermission<TKey extends string>(
  definition: Omit<PermissionDefinition, "key"> & { key: TKey },
) {
  return definition;
}

export const PERMISSION_DEFINITIONS = [
  definePermission({
    key: "account.read.self",
    label: "Voir mon compte",
    resource: "account",
    action: "read",
    scope: "self",
    group: "Compte",
  }),
  definePermission({
    key: "account.update.self",
    label: "Modifier mes informations personnelles",
    resource: "account",
    action: "update",
    scope: "self",
    group: "Compte",
  }),
  definePermission({
    key: "account.credentials.update.self",
    label: "Modifier mes identifiants",
    resource: "account",
    action: "update_credentials",
    scope: "self",
    group: "Compte",
  }),

  definePermission({
    key: "users.view_non_banned.all",
    label: "Voir les utilisateurs non bannis",
    resource: "users",
    action: "view_non_banned",
    scope: "all",
    group: "Utilisateurs",
  }),
  definePermission({
    key: "users.view_non_banned.below_role",
    label: "Voir les utilisateurs non bannis sous mon rôle",
    resource: "users",
    action: "view_non_banned",
    scope: "below_role",
    group: "Utilisateurs",
  }),
  definePermission({
    key: "users.view_banned.all",
    label: "Voir les utilisateurs bannis",
    resource: "users",
    action: "view_banned",
    scope: "all",
    group: "Utilisateurs",
  }),
  definePermission({
    key: "users.view_banned.below_role",
    label: "Voir les utilisateurs bannis sous mon rôle",
    resource: "users",
    action: "view_banned",
    scope: "below_role",
    group: "Utilisateurs",
  }),
  definePermission({
    key: "users.create.below_role",
    label: "Créer des utilisateurs sous mon rôle",
    resource: "users",
    action: "create",
    scope: "below_role",
    group: "Utilisateurs",
  }),
  definePermission({
    key: "users.update_profile.all",
    label: "Modifier les profils utilisateurs",
    resource: "users",
    action: "update_profile",
    scope: "all",
    group: "Utilisateurs",
  }),
  definePermission({
    key: "users.update_profile.below_role",
    label: "Modifier les profils utilisateurs sous mon rôle",
    resource: "users",
    action: "update_profile",
    scope: "below_role",
    group: "Utilisateurs",
  }),
  definePermission({
    key: "users.update_credentials.all",
    label: "Modifier les identifiants utilisateurs",
    resource: "users",
    action: "update_credentials",
    scope: "all",
    group: "Utilisateurs",
  }),
  definePermission({
    key: "users.update_credentials.below_role",
    label: "Modifier les identifiants utilisateurs sous mon rôle",
    resource: "users",
    action: "update_credentials",
    scope: "below_role",
    group: "Utilisateurs",
  }),
  definePermission({
    key: "users.ban.below_role",
    label: "Bannir des utilisateurs sous mon rôle",
    resource: "users",
    action: "ban",
    scope: "below_role",
    group: "Utilisateurs",
  }),
  definePermission({
    key: "users.unban.below_role",
    label: "Réhabiliter des utilisateurs sous mon rôle",
    resource: "users",
    action: "unban",
    scope: "below_role",
    group: "Utilisateurs",
  }),
  definePermission({
    key: "users.delete.below_role",
    label: "Supprimer des utilisateurs sous mon rôle",
    resource: "users",
    action: "delete",
    scope: "below_role",
    group: "Utilisateurs",
    description:
      "La suppression reste bloquée si le compte possède du contenu lié.",
  }),

  definePermission({
    key: "roles.view.all",
    label: "Voir tous les rôles",
    resource: "roles",
    action: "view",
    scope: "all",
    group: "Rôles",
  }),
  definePermission({
    key: "roles.view.below_role",
    label: "Voir les rôles sous mon rôle",
    resource: "roles",
    action: "view",
    scope: "below_role",
    group: "Rôles",
  }),
  definePermission({
    key: "roles.create.all",
    label: "Créer des rôles",
    resource: "roles",
    action: "create",
    scope: "all",
    group: "Rôles",
  }),
  definePermission({
    key: "roles.update.all",
    label: "Modifier des rôles",
    resource: "roles",
    action: "update",
    scope: "all",
    group: "Rôles",
  }),
  definePermission({
    key: "roles.delete.all",
    label: "Supprimer des rôles",
    resource: "roles",
    action: "delete",
    scope: "all",
    group: "Rôles",
  }),
  definePermission({
    key: "roles.assign.below_role",
    label: "Attribuer des rôles sous mon rôle",
    resource: "roles",
    action: "assign",
    scope: "below_role",
    group: "Rôles",
    description:
      "Le rôle attribué et l'utilisateur cible doivent tous deux être sous votre rôle effectif.",
  }),

  definePermission({
    key: "products.create",
    label: "Créer un produit",
    resource: "products",
    action: "create",
    group: "Produits",
  }),
  definePermission({
    key: "products.view.all",
    label: "Voir tous les produits",
    resource: "products",
    action: "view",
    scope: "all",
    group: "Produits",
  }),
  definePermission({
    key: "products.view.own",
    label: "Voir mes produits",
    resource: "products",
    action: "view",
    scope: "own",
    group: "Produits",
  }),
  definePermission({
    key: "products.update.all",
    label: "Modifier tous les produits",
    resource: "products",
    action: "update",
    scope: "all",
    group: "Produits",
    description:
      "Les produits publiés restent protégés par la logique métier.",
  }),
  definePermission({
    key: "products.update.below_role",
    label: "Modifier les produits sous mon rôle",
    resource: "products",
    action: "update",
    scope: "below_role",
    group: "Produits",
    description:
      "Les produits publiés restent protégés par la logique métier.",
  }),
  definePermission({
    key: "products.update.own",
    label: "Modifier mes produits",
    resource: "products",
    action: "update",
    scope: "own",
    group: "Produits",
    description:
      "Les produits publiés restent protégés par la logique métier.",
  }),
  definePermission({
    key: "products.delete.all",
    label: "Supprimer tous les produits",
    resource: "products",
    action: "delete",
    scope: "all",
    group: "Produits",
  }),
  definePermission({
    key: "products.delete.below_role",
    label: "Supprimer les produits sous mon rôle",
    resource: "products",
    action: "delete",
    scope: "below_role",
    group: "Produits",
  }),
  definePermission({
    key: "products.delete.own",
    label: "Supprimer mes produits",
    resource: "products",
    action: "delete",
    scope: "own",
    group: "Produits",
  }),
  definePermission({
    key: "products.feature.all",
    label: "Mettre en avant tous les produits",
    resource: "products",
    action: "feature",
    scope: "all",
    group: "Produits",
  }),
  definePermission({
    key: "products.feature.below_role",
    label: "Mettre en avant les produits sous mon rôle",
    resource: "products",
    action: "feature",
    scope: "below_role",
    group: "Produits",
  }),
  definePermission({
    key: "products.feature.own",
    label: "Mettre en avant mes produits",
    resource: "products",
    action: "feature",
    scope: "own",
    group: "Produits",
  }),
  definePermission({
    key: "products.unfeature.all",
    label: "Retirer la mise en avant de tous les produits",
    resource: "products",
    action: "unfeature",
    scope: "all",
    group: "Produits",
  }),
  definePermission({
    key: "products.unfeature.below_role",
    label: "Retirer la mise en avant des produits sous mon rôle",
    resource: "products",
    action: "unfeature",
    scope: "below_role",
    group: "Produits",
  }),
  definePermission({
    key: "products.unfeature.own",
    label: "Retirer la mise en avant de mes produits",
    resource: "products",
    action: "unfeature",
    scope: "own",
    group: "Produits",
  }),
  definePermission({
    key: "products.publish.all",
    label: "Publier tous les produits",
    resource: "products",
    action: "publish",
    scope: "all",
    group: "Produits",
  }),
  definePermission({
    key: "products.publish.below_role",
    label: "Publier les produits sous mon rôle",
    resource: "products",
    action: "publish",
    scope: "below_role",
    group: "Produits",
  }),
  definePermission({
    key: "products.publish.own",
    label: "Publier mes produits",
    resource: "products",
    action: "publish",
    scope: "own",
    group: "Produits",
  }),
  definePermission({
    key: "products.unpublish.all",
    label: "Dépublier tous les produits",
    resource: "products",
    action: "unpublish",
    scope: "all",
    group: "Produits",
  }),
  definePermission({
    key: "products.unpublish.below_role",
    label: "Dépublier les produits sous mon rôle",
    resource: "products",
    action: "unpublish",
    scope: "below_role",
    group: "Produits",
  }),
  definePermission({
    key: "products.unpublish.own",
    label: "Dépublier mes produits",
    resource: "products",
    action: "unpublish",
    scope: "own",
    group: "Produits",
  }),

  definePermission({
    key: "product_categories.create",
    label: "Créer une catégorie produit",
    resource: "product_categories",
    action: "create",
    group: "Catégories produit",
  }),
  definePermission({
    key: "product_categories.view.all",
    label: "Voir toutes les catégories produit",
    resource: "product_categories",
    action: "view",
    scope: "all",
    group: "Catégories produit",
  }),
  definePermission({
    key: "product_categories.view.own",
    label: "Voir mes catégories produit",
    resource: "product_categories",
    action: "view",
    scope: "own",
    group: "Catégories produit",
  }),
  definePermission({
    key: "product_categories.update.all",
    label: "Modifier toutes les catégories produit",
    resource: "product_categories",
    action: "update",
    scope: "all",
    group: "Catégories produit",
  }),
  definePermission({
    key: "product_categories.update.below_role",
    label: "Modifier les catégories produit sous mon rôle",
    resource: "product_categories",
    action: "update",
    scope: "below_role",
    group: "Catégories produit",
  }),
  definePermission({
    key: "product_categories.update.own",
    label: "Modifier mes catégories produit",
    resource: "product_categories",
    action: "update",
    scope: "own",
    group: "Catégories produit",
  }),
  definePermission({
    key: "product_categories.delete.all",
    label: "Supprimer toutes les catégories produit",
    resource: "product_categories",
    action: "delete",
    scope: "all",
    group: "Catégories produit",
    description:
      "La suppression reste bloquée si la catégorie est encore attachée à un produit.",
  }),
  definePermission({
    key: "product_categories.delete.below_role",
    label: "Supprimer les catégories produit sous mon rôle",
    resource: "product_categories",
    action: "delete",
    scope: "below_role",
    group: "Catégories produit",
    description:
      "La suppression reste bloquée si la catégorie est encore attachée à un produit.",
  }),
  definePermission({
    key: "product_categories.delete.own",
    label: "Supprimer mes catégories produit",
    resource: "product_categories",
    action: "delete",
    scope: "own",
    group: "Catégories produit",
    description:
      "La suppression reste bloquée si la catégorie est encore attachée à un produit.",
  }),

  definePermission({
    key: "articles.create",
    label: "Créer un article",
    resource: "articles",
    action: "create",
    group: "Articles",
  }),
  definePermission({
    key: "articles.view.all",
    label: "Voir tous les articles",
    resource: "articles",
    action: "view",
    scope: "all",
    group: "Articles",
  }),
  definePermission({
    key: "articles.view.own",
    label: "Voir mes articles",
    resource: "articles",
    action: "view",
    scope: "own",
    group: "Articles",
  }),
  definePermission({
    key: "articles.update.all",
    label: "Modifier tous les articles",
    resource: "articles",
    action: "update",
    scope: "all",
    group: "Articles",
  }),
  definePermission({
    key: "articles.update.below_role",
    label: "Modifier les articles sous mon rôle",
    resource: "articles",
    action: "update",
    scope: "below_role",
    group: "Articles",
  }),
  definePermission({
    key: "articles.update.own",
    label: "Modifier mes articles",
    resource: "articles",
    action: "update",
    scope: "own",
    group: "Articles",
  }),
  definePermission({
    key: "articles.delete.all",
    label: "Supprimer tous les articles",
    resource: "articles",
    action: "delete",
    scope: "all",
    group: "Articles",
  }),
  definePermission({
    key: "articles.delete.below_role",
    label: "Supprimer les articles sous mon rôle",
    resource: "articles",
    action: "delete",
    scope: "below_role",
    group: "Articles",
  }),
  definePermission({
    key: "articles.delete.own",
    label: "Supprimer mes articles",
    resource: "articles",
    action: "delete",
    scope: "own",
    group: "Articles",
  }),
  definePermission({
    key: "articles.feature.all",
    label: "Mettre en avant tous les articles",
    resource: "articles",
    action: "feature",
    scope: "all",
    group: "Articles",
  }),
  definePermission({
    key: "articles.feature.below_role",
    label: "Mettre en avant les articles sous mon rôle",
    resource: "articles",
    action: "feature",
    scope: "below_role",
    group: "Articles",
  }),
  definePermission({
    key: "articles.feature.own",
    label: "Mettre en avant mes articles",
    resource: "articles",
    action: "feature",
    scope: "own",
    group: "Articles",
  }),
  definePermission({
    key: "articles.unfeature.all",
    label: "Retirer la mise en avant de tous les articles",
    resource: "articles",
    action: "unfeature",
    scope: "all",
    group: "Articles",
  }),
  definePermission({
    key: "articles.unfeature.below_role",
    label: "Retirer la mise en avant des articles sous mon rôle",
    resource: "articles",
    action: "unfeature",
    scope: "below_role",
    group: "Articles",
  }),
  definePermission({
    key: "articles.unfeature.own",
    label: "Retirer la mise en avant de mes articles",
    resource: "articles",
    action: "unfeature",
    scope: "own",
    group: "Articles",
  }),
  definePermission({
    key: "articles.publish.all",
    label: "Publier tous les articles",
    resource: "articles",
    action: "publish",
    scope: "all",
    group: "Articles",
  }),
  definePermission({
    key: "articles.publish.below_role",
    label: "Publier les articles sous mon rôle",
    resource: "articles",
    action: "publish",
    scope: "below_role",
    group: "Articles",
  }),
  definePermission({
    key: "articles.publish.own",
    label: "Publier mes articles",
    resource: "articles",
    action: "publish",
    scope: "own",
    group: "Articles",
  }),
  definePermission({
    key: "articles.unpublish.all",
    label: "Dépublier tous les articles",
    resource: "articles",
    action: "unpublish",
    scope: "all",
    group: "Articles",
  }),
  definePermission({
    key: "articles.unpublish.below_role",
    label: "Dépublier les articles sous mon rôle",
    resource: "articles",
    action: "unpublish",
    scope: "below_role",
    group: "Articles",
  }),
  definePermission({
    key: "articles.unpublish.own",
    label: "Dépublier mes articles",
    resource: "articles",
    action: "unpublish",
    scope: "own",
    group: "Articles",
  }),
  definePermission({
    key: "articles.authors_update.all",
    label: "Modifier les auteurs de tous les articles",
    resource: "articles",
    action: "authors_update",
    scope: "all",
    group: "Articles",
    description: "Ajout et retrait d'auteurs sur un article.",
  }),
  definePermission({
    key: "articles.authors_update.below_role",
    label: "Modifier les auteurs des articles sous mon rôle",
    resource: "articles",
    action: "authors_update",
    scope: "below_role",
    group: "Articles",
    description: "Ajout et retrait d'auteurs sur un article.",
  }),
  definePermission({
    key: "articles.authors_update.own",
    label: "Modifier les auteurs de mes articles",
    resource: "articles",
    action: "authors_update",
    scope: "own",
    group: "Articles",
    description: "Ajout et retrait d'auteurs sur un article.",
  }),

  definePermission({
    key: "article_categories.view",
    label: "Voir les catégories d'articles",
    resource: "article_categories",
    action: "view",
    group: "Catégories d'articles",
  }),
  definePermission({
    key: "article_categories.create",
    label: "Créer des catégories d'articles",
    resource: "article_categories",
    action: "create",
    group: "Catégories d'articles",
  }),
  definePermission({
    key: "article_categories.delete.all",
    label: "Supprimer toutes les catégories d'articles",
    resource: "article_categories",
    action: "delete",
    scope: "all",
    group: "Catégories d'articles",
  }),
  definePermission({
    key: "article_categories.delete.below_role",
    label: "Supprimer les catégories d'articles sous mon rôle",
    resource: "article_categories",
    action: "delete",
    scope: "below_role",
    group: "Catégories d'articles",
  }),
  definePermission({
    key: "article_categories.delete.own",
    label: "Supprimer mes catégories d'articles",
    resource: "article_categories",
    action: "delete",
    scope: "own",
    group: "Catégories d'articles",
  }),
  definePermission({
    key: "article_categories.force_remove.all",
    label: "Forcer la suppression de toutes les catégories d'articles",
    resource: "article_categories",
    action: "force_remove",
    scope: "all",
    group: "Catégories d'articles",
    description:
      "Détache les articles liés avant de supprimer définitivement la catégorie.",
  }),
  definePermission({
    key: "article_categories.force_remove.below_role",
    label: "Forcer la suppression des catégories d'articles sous mon rôle",
    resource: "article_categories",
    action: "force_remove",
    scope: "below_role",
    group: "Catégories d'articles",
    description:
      "Détache les articles liés avant de supprimer définitivement la catégorie.",
  }),
  definePermission({
    key: "article_categories.force_remove.own",
    label: "Forcer la suppression de mes catégories d'articles",
    resource: "article_categories",
    action: "force_remove",
    scope: "own",
    group: "Catégories d'articles",
    description:
      "Détache les articles liés avant de supprimer définitivement la catégorie.",
  }),

  definePermission({
    key: "media.create",
    label: "Ajouter un média",
    resource: "media",
    action: "create",
    group: "Médias",
  }),
  definePermission({
    key: "media.view.all",
    label: "Voir tous les médias",
    resource: "media",
    action: "view",
    scope: "all",
    group: "Médias",
  }),
  definePermission({
    key: "media.view.own",
    label: "Voir mes médias",
    resource: "media",
    action: "view",
    scope: "own",
    group: "Médias",
  }),
  definePermission({
    key: "media.delete.all",
    label: "Supprimer tous les médias",
    resource: "media",
    action: "delete",
    scope: "all",
    group: "Médias",
  }),
  definePermission({
    key: "media.delete.below_role",
    label: "Supprimer les médias sous mon rôle",
    resource: "media",
    action: "delete",
    scope: "below_role",
    group: "Médias",
  }),
  definePermission({
    key: "media.delete.own",
    label: "Supprimer mes médias",
    resource: "media",
    action: "delete",
    scope: "own",
    group: "Médias",
  }),
  definePermission({
    key: "media.force_remove",
    label: "Forcer la suppression d'un média référencé",
    resource: "media",
    action: "force_remove",
    group: "Médias",
    description:
      "Déréférence un média encore utilisé avant de le supprimer définitivement. Nécessite aussi l'accès et la gestion des médias.",
  }),
  definePermission({
    key: "annuaire.view",
    label: "Voir l'annuaire",
    resource: "annuaire",
    action: "view",
    group: "Annuaire",
  }),
  definePermission({
    key: "annuaire.manage",
    label: "Gerer l'annuaire",
    resource: "annuaire",
    action: "manage",
    group: "Annuaire",
  }),
] as const satisfies readonly PermissionDefinition[];

export type PermissionKey = (typeof PERMISSION_DEFINITIONS)[number]["key"];

export const PERMISSIONS = Object.freeze(
  PERMISSION_DEFINITIONS.reduce(
    (accumulator, definition) => {
      accumulator[definition.key.replace(/\./g, "_").toUpperCase()] =
        definition.key;
      return accumulator;
    },
    {} as Record<string, PermissionKey>,
  ),
) as Record<string, PermissionKey>;

export const ALL_PERMISSION_KEYS = PERMISSION_DEFINITIONS.map(
  (definition) => definition.key,
) as PermissionKey[];

export const MEDIA_ACCESS_PERMISSION_KEYS = [
  PERMISSIONS.MEDIA_VIEW_ALL,
  PERMISSIONS.MEDIA_VIEW_OWN,
  PERMISSIONS.MEDIA_CREATE,
  PERMISSIONS.MEDIA_DELETE_ALL,
  PERMISSIONS.MEDIA_DELETE_BELOW_ROLE,
  PERMISSIONS.MEDIA_DELETE_OWN,
] as const satisfies readonly PermissionKey[];

export const MEDIA_MANAGE_PERMISSION_KEYS = [
  PERMISSIONS.MEDIA_DELETE_ALL,
  PERMISSIONS.MEDIA_DELETE_BELOW_ROLE,
  PERMISSIONS.MEDIA_DELETE_OWN,
] as const satisfies readonly PermissionKey[];

export const ANNUAIRE_ACCESS_PERMISSION_KEYS = [
  PERMISSIONS.ANNUAIRE_VIEW,
  PERMISSIONS.ANNUAIRE_MANAGE,
] as const satisfies readonly PermissionKey[];

export const ARTICLE_CATEGORY_ACCESS_PERMISSION_KEYS = [
  PERMISSIONS.ARTICLE_CATEGORIES_VIEW,
  PERMISSIONS.ARTICLE_CATEGORIES_CREATE,
  PERMISSIONS.ARTICLE_CATEGORIES_DELETE_ALL,
  PERMISSIONS.ARTICLE_CATEGORIES_DELETE_BELOW_ROLE,
  PERMISSIONS.ARTICLE_CATEGORIES_DELETE_OWN,
] as const satisfies readonly PermissionKey[];

export const ARTICLE_CATEGORY_MANAGE_PERMISSION_KEYS = [
  PERMISSIONS.ARTICLE_CATEGORIES_DELETE_ALL,
  PERMISSIONS.ARTICLE_CATEGORIES_DELETE_BELOW_ROLE,
  PERMISSIONS.ARTICLE_CATEGORIES_DELETE_OWN,
] as const satisfies readonly PermissionKey[];

export function hasMediaForceRemovePrerequisites(
  permissions: readonly PermissionKey[],
) {
  const permissionSet = new Set(permissions);

  const hasMediaAccess = MEDIA_ACCESS_PERMISSION_KEYS.some((permission) =>
    permissionSet.has(permission),
  );
  const hasMediaManagement = MEDIA_MANAGE_PERMISSION_KEYS.some((permission) =>
    permissionSet.has(permission),
  );

  return hasMediaAccess && hasMediaManagement;
}

export function normalizeMediaForceRemovePermissionDependencies(
  permissions: readonly PermissionKey[],
): PermissionKey[] {
  const dedupedPermissions = [...new Set(permissions)] as PermissionKey[];

  if (
    dedupedPermissions.includes(PERMISSIONS.MEDIA_FORCE_REMOVE) &&
    !hasMediaForceRemovePrerequisites(dedupedPermissions)
  ) {
    return dedupedPermissions.filter(
      (permission) => permission !== PERMISSIONS.MEDIA_FORCE_REMOVE,
    );
  }

  return dedupedPermissions;
}

export function hasArticleCategoryForceRemovePrerequisites(
  permissions: readonly PermissionKey[],
) {
  const permissionSet = new Set(permissions);

  const hasArticleCategoryAccess = ARTICLE_CATEGORY_ACCESS_PERMISSION_KEYS.some(
    (permission) => permissionSet.has(permission),
  );
  const hasArticleCategoryManagement =
    ARTICLE_CATEGORY_MANAGE_PERMISSION_KEYS.some((permission) =>
      permissionSet.has(permission),
    );

  return hasArticleCategoryAccess && hasArticleCategoryManagement;
}

export function normalizeArticleCategoryForceRemovePermissionDependencies(
  permissions: readonly PermissionKey[],
): PermissionKey[] {
  const dedupedPermissions = [...new Set(permissions)] as PermissionKey[];
  const forceRemovePermissions = new Set<PermissionKey>([
    PERMISSIONS.ARTICLE_CATEGORIES_FORCE_REMOVE_ALL,
    PERMISSIONS.ARTICLE_CATEGORIES_FORCE_REMOVE_BELOW_ROLE,
    PERMISSIONS.ARTICLE_CATEGORIES_FORCE_REMOVE_OWN,
  ]);

  if (
    dedupedPermissions.some((permission) => forceRemovePermissions.has(permission)) &&
    !hasArticleCategoryForceRemovePrerequisites(dedupedPermissions)
  ) {
    return dedupedPermissions.filter(
      (permission) => !forceRemovePermissions.has(permission),
    );
  }

  return dedupedPermissions;
}

export const STAFF_BASE_PERMISSION_KEYS = [
  "account.read.self",
  "account.update.self",
  "account.credentials.update.self",
] as const satisfies readonly PermissionKey[];

export function getProtectedPowerTypePermissions(input: {
  powerType: PowerType;
  status?: string;
}): PermissionKey[] {
  if (input.status === "BANNED") {
    return [...STAFF_BASE_PERMISSION_KEYS];
  }

  if (input.powerType === "ROOT" || input.powerType === "ADMIN") {
    return [...ALL_PERMISSION_KEYS];
  }

  return [...STAFF_BASE_PERMISSION_KEYS];
}
