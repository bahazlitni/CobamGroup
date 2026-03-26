"use client";

import Panel from "@/components/staff/ui/Panel";
import StaffSelect from "@/components/staff/ui/PanelSelect";
import StaffBadge from "@/components/staff/ui/StaffBadge";
import {
  hasArticleCategoryForceRemovePrerequisites,
  hasMediaForceRemovePrerequisites,
  normalizeArticleCategoryForceRemovePermissionDependencies,
  MEDIA_ACCESS_PERMISSION_KEYS,
  MEDIA_MANAGE_PERMISSION_KEYS,
  PERMISSION_DEFINITIONS,
  PERMISSIONS,
  STAFF_BASE_PERMISSION_KEYS,
  normalizeMediaForceRemovePermissionDependencies,
  type PermissionDefinition,
  type PermissionKey,
} from "@/features/rbac/permissions";
import type { RoleMutationInput } from "@/features/roles/types";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";

export type RoleFormState = {
  key: string;
  name: string;
  color: string;
  priorityIndex: number;
  description: string;
  permissions: PermissionKey[];
  isActive: boolean;
};

type PermissionFamily = {
  key: string;
  resource: string;
  action: string;
  group: string;
  label: string;
  description: string | null;
  permissions: PermissionDefinition[];
  supportsScopeSelection: boolean;
};

const scopeLabels: Record<string, string> = {
  all: "Tout",
  below_role: "Sous mon role",
  own: "Mes elements",
  self: "Moi-meme",
};

const scopeSelectionOrder = ["self", "own", "below_role", "all"] as const;
const scopeNormalizationOrder = ["all", "below_role", "own", "self"] as const;
const staffBasePermissionKeySet = new Set<PermissionKey>(
  STAFF_BASE_PERMISSION_KEYS,
);
const mediaAccessPermissionKeySet = new Set<PermissionKey>(
  MEDIA_ACCESS_PERMISSION_KEYS,
);
const mediaManagePermissionKeySet = new Set<PermissionKey>(
  MEDIA_MANAGE_PERMISSION_KEYS,
);

function getScopeOrderIndex(
  scope: string | null | undefined,
  order: readonly string[],
) {
  if (!scope) return order.length;

  const index = order.indexOf(scope);
  return index === -1 ? order.length : index;
}

function buildPermissionFamilyLabel(permissions: PermissionDefinition[]) {
  const source =
    permissions.find((permission) => permission.scope === "all") ??
    permissions.find((permission) => permission.scope === "below_role") ??
    permissions.find((permission) => permission.scope === "own") ??
    permissions[0];

  if (!source) {
    return "";
  }

  if (!source.scope || permissions.length === 1) {
    return source.label;
  }

  return source.label
    .replace(/\s+sous mon rôle$/i, "")
    .replace(/\s+sous mon rÃ´le$/i, "")
    .replace(/\btous les\b/gi, "les")
    .replace(/\btoutes les\b/gi, "les")
    .replace(/\bmes\b/gi, "les")
    .replace(/\bmon\b/gi, "le")
    .replace(/\bma\b/gi, "la")
    .replace(/\bde les\b/gi, "des")
    .replace(/\bde le\b/gi, "du")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizePermissionGroup(definition: PermissionDefinition) {
  return definition.resource === "media" ? "Medias" : definition.group;
}

const permissionFamiliesByGroup = Array.from(
  PERMISSION_DEFINITIONS.reduce((groups, definition) => {
    const normalizedGroup = normalizePermissionGroup(definition);
    const groupFamilies =
      groups.get(normalizedGroup) ?? new Map<string, PermissionDefinition[]>();
    const familyKey = `${definition.resource}:${definition.action}`;
    const familyPermissions = groupFamilies.get(familyKey) ?? [];
    familyPermissions.push(definition);
    groupFamilies.set(familyKey, familyPermissions);
    groups.set(normalizedGroup, groupFamilies);
    return groups;
  }, new Map<string, Map<string, PermissionDefinition[]>>()),
).reduce(
  (accumulator, [group, families]) => {
    accumulator[group] = Array.from(families.entries())
      .map(([familyKey, permissions]) => {
        const orderedPermissions = [...permissions].sort(
          (left, right) =>
            getScopeOrderIndex(left.scope, scopeSelectionOrder) -
              getScopeOrderIndex(right.scope, scopeSelectionOrder) ||
            left.label.localeCompare(right.label, "fr-FR") ||
            left.key.localeCompare(right.key, "fr-FR"),
        );

        return {
          key: familyKey,
          resource: orderedPermissions[0]?.resource ?? "",
          action: orderedPermissions[0]?.action ?? "",
          group,
          label: buildPermissionFamilyLabel(orderedPermissions),
          description:
            orderedPermissions.find((permission) => permission.description)
              ?.description ?? null,
          permissions: orderedPermissions,
          supportsScopeSelection:
            orderedPermissions.filter((permission) => permission.scope).length >
            1,
        } satisfies PermissionFamily;
      })
      .sort(
        (left, right) =>
          left.label.localeCompare(right.label, "fr-FR") ||
          left.key.localeCompare(right.key, "fr-FR"),
      );

    return accumulator;
  },
  {} as Record<string, PermissionFamily[]>,
);

function selectPermissionForNormalization(
  permissions: PermissionDefinition[],
): PermissionDefinition {
  return [...permissions].sort(
    (left, right) =>
      getScopeOrderIndex(left.scope, scopeNormalizationOrder) -
        getScopeOrderIndex(right.scope, scopeNormalizationOrder) ||
      left.key.localeCompare(right.key, "fr-FR"),
  )[0];
}

function selectDefaultPermissionForFamily(family: PermissionFamily) {
  return [...family.permissions].sort(
    (left, right) =>
      getScopeOrderIndex(left.scope, scopeSelectionOrder) -
        getScopeOrderIndex(right.scope, scopeSelectionOrder) ||
      left.key.localeCompare(right.key, "fr-FR"),
  )[0];
}

function normalizePermissionSelection(permissions: PermissionKey[]) {
  const selectedKeys = new Set<PermissionKey>(permissions);
  const normalized: PermissionKey[] = [];

  for (const families of Object.values(permissionFamiliesByGroup)) {
    for (const family of families) {
      const selectedPermissions = family.permissions.filter((permission) =>
        selectedKeys.has(permission.key),
      );

      if (selectedPermissions.length === 0) {
        continue;
      }

      normalized.push(selectPermissionForNormalization(selectedPermissions).key);
    }
  }

  return normalized;
}

function normalizeRolePermissionSelection(permissions: PermissionKey[]) {
  return normalizeArticleCategoryForceRemovePermissionDependencies(
    normalizeMediaForceRemovePermissionDependencies(
      normalizePermissionSelection(permissions),
    ),
  );
}

function stripStaffBasePermissions(permissions: PermissionKey[]) {
  return permissions.filter(
    (permission) => !staffBasePermissionKeySet.has(permission),
  );
}

function isStaffBasePermissionFamily(family: PermissionFamily) {
  return family.permissions.every((permission) =>
    staffBasePermissionKeySet.has(permission.key),
  );
}

export function toRoleFormState(input?: Partial<RoleMutationInput>): RoleFormState {
  return {
    key: input?.key ?? "",
    name: input?.name ?? "",
    color: input?.color ?? "#2563eb",
    priorityIndex: input?.priorityIndex ?? 50,
    description: input?.description ?? "",
    permissions: normalizeRolePermissionSelection(
      stripStaffBasePermissions(input?.permissions ?? []),
    ),
    isActive: input?.isActive ?? true,
  };
}

export function toRoleMutationInput(state: RoleFormState): RoleMutationInput {
  return {
    key: state.key,
    name: state.name,
    color: state.color,
    priorityIndex: state.priorityIndex,
    description: state.description.trim() || null,
    permissions: normalizeRolePermissionSelection(
      stripStaffBasePermissions(state.permissions),
    ),
    isActive: state.isActive,
  };
}

export default function RoleEditorForm({
  state,
  onChange,
  onSubmit,
  isSubmitting,
  submitLabel,
}: {
  state: RoleFormState;
  onChange: (patch: Partial<RoleFormState>) => void;
  onSubmit: () => void | Promise<void>;
  isSubmitting?: boolean;
  submitLabel: string;
}) {
  const normalizedPermissions = normalizeRolePermissionSelection(state.permissions);
  const displayedPermissions = normalizeRolePermissionSelection([
    ...STAFF_BASE_PERMISSION_KEYS,
    ...normalizedPermissions,
  ]);
  const selectedCount = displayedPermissions.length;
  const selectedCountLabel =
    selectedCount > 1 ? "permissions activees" : "permission activee";

  const setPermissionFamilyEnabled = (
    family: PermissionFamily,
    isEnabled: boolean,
  ) => {
    if (isStaffBasePermissionFamily(family)) {
      return;
    }

    const familyKeys = new Set<PermissionKey>(
      family.permissions.map((permission) => permission.key),
    );
    const nextPermissions = state.permissions.filter(
      (permission) => !familyKeys.has(permission),
    );

    if (isEnabled) {
      nextPermissions.push(selectDefaultPermissionForFamily(family).key);
    }

    onChange({ permissions: normalizeRolePermissionSelection(nextPermissions) });
  };

  const setPermissionFamilyScope = (
    family: PermissionFamily,
    permissionKey: PermissionKey,
  ) => {
    if (isStaffBasePermissionFamily(family)) {
      return;
    }

    const familyKeys = new Set<PermissionKey>(
      family.permissions.map((permission) => permission.key),
    );
    const nextPermissions = state.permissions.filter(
      (permission) => !familyKeys.has(permission),
    );
    nextPermissions.push(permissionKey);
    onChange({ permissions: normalizeRolePermissionSelection(nextPermissions) });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1.6fr]">
      <Panel
        pretitle=""
        title="Informations generales"
        description="Nom, cle, couleur, priorite, description et statut du role."
      >
        <label className="space-y-1 text-sm text-slate-600">
          <span className="font-medium text-slate-700">Nom</span>
          <input
            value={state.name}
            onChange={(event) => onChange({ name: event.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cobam-water-blue/40"
          />
        </label>

        <label className="space-y-1 text-sm text-slate-600">
          <span className="font-medium text-slate-700">Cle</span>
          <input
            value={state.key}
            onChange={(event) => onChange({ key: event.target.value })}
            placeholder="PRODUCT_EDITOR"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 uppercase focus:outline-none focus:ring-2 focus:ring-cobam-water-blue/40"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
          <label className="space-y-1 text-sm text-slate-600">
            <span className="font-medium text-slate-700">Couleur</span>
            <input
              type="color"
              value={state.color}
              onChange={(event) => onChange({ color: event.target.value })}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-1 py-1"
            />
          </label>

          <label className="space-y-1 text-sm text-slate-600">
            <span className="font-medium text-slate-700">Priorite</span>
            <input
              type="number"
              min={0}
              value={state.priorityIndex}
              onChange={(event) =>
                onChange({ priorityIndex: Number(event.target.value) || 0 })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cobam-water-blue/40"
            />
          </label>
        </div>

        <label className="space-y-1 text-sm text-slate-600">
          <span className="font-medium text-slate-700">Description</span>
          <textarea
            value={state.description}
            onChange={(event) => onChange({ description: event.target.value })}
            rows={4}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cobam-water-blue/40"
          />
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={state.isActive}
            onChange={(event) => onChange({ isActive: event.target.checked })}
            className="h-4 w-4 rounded border-slate-300"
          />
          Role actif
        </label>

        <AnimatedUIButton
          type="button"
          onClick={() => void onSubmit()}
          disabled={isSubmitting}
          loading={isSubmitting}
          loadingText="Enregistrement..."
          variant="primary"
          className="w-full"
        >
          {submitLabel}
        </AnimatedUIButton>
      </Panel>

      <Panel
        pretitle=""
        title="Permissions du role"
        description="Activez les permissions a accorder a ce role. Les permissions de base du staff restent toujours actives."
      >
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-600">
          <span className="font-semibold text-slate-800">{selectedCount}</span>{" "}
          {selectedCountLabel}
        </div>

        <div className="space-y-5">
          {Object.entries(permissionFamiliesByGroup).map(([group, families]) => (
            <div key={group} className="space-y-3">
              <p className="text-sm font-semibold text-cobam-dark-blue">{group}</p>

              <div className="space-y-2">
                {families.map((family) => {
                  const isStaffBaseFamily = isStaffBasePermissionFamily(family);
                  const isMediaForceRemoveFamily = family.permissions.some(
                    (permission) => permission.key === PERMISSIONS.MEDIA_FORCE_REMOVE,
                  );
                  const missingMediaForceRemovePrerequisites =
                    isMediaForceRemoveFamily &&
                    !hasMediaForceRemovePrerequisites(normalizedPermissions);
                  const isArticleCategoryForceRemoveFamily = family.permissions.some(
                    (permission) =>
                      permission.key === PERMISSIONS.ARTICLE_CATEGORIES_FORCE_REMOVE_ALL ||
                      permission.key === PERMISSIONS.ARTICLE_CATEGORIES_FORCE_REMOVE_BELOW_ROLE ||
                      permission.key === PERMISSIONS.ARTICLE_CATEGORIES_FORCE_REMOVE_OWN,
                  );
                  const missingArticleCategoryForceRemovePrerequisites =
                    isArticleCategoryForceRemoveFamily &&
                    !hasArticleCategoryForceRemovePrerequisites(
                      normalizedPermissions,
                    );
                  const isInteractionLocked =
                    isStaffBaseFamily ||
                    missingMediaForceRemovePrerequisites ||
                    missingArticleCategoryForceRemovePrerequisites;
                  const selectedPermission =
                    family.permissions.find((permission) =>
                      displayedPermissions.includes(permission.key),
                    ) ?? null;
                  const isEnabled = selectedPermission != null;
                  const isMediaAccessRelatedFamily = family.permissions.some(
                    (permission) => mediaAccessPermissionKeySet.has(permission.key),
                  );
                  const isMediaManageRelatedFamily = family.permissions.some(
                    (permission) => mediaManagePermissionKeySet.has(permission.key),
                  );
                  const helperDescription = missingMediaForceRemovePrerequisites
                    ? "Activez d'abord un acces medias et une permission de suppression de medias."
                    : missingArticleCategoryForceRemovePrerequisites
                      ? "Activez d'abord l'acces aux categories d'articles et une permission de suppression."
                      : selectedPermission?.description ??
                        family.description ??
                        (isStaffBaseFamily
                          ? "Permission de base accordee a tous les comptes Staff."
                          : isMediaForceRemoveFamily
                            ? "Permet de dereferencer un media encore utilise avant suppression definitive."
                            : isArticleCategoryForceRemoveFamily
                              ? "Permet de detacher les articles lies avant suppression definitive."
                              : null);

                  return (
                    <div
                      key={family.key}
                      className={`rounded-xl border px-4 py-4 transition-colors ${
                        isEnabled
                          ? "border-cobam-water-blue bg-cobam-light-bg/60"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex min-w-0 gap-3">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={isEnabled}
                            aria-disabled={isInteractionLocked}
                            disabled={isInteractionLocked}
                            onClick={
                              isInteractionLocked
                                ? undefined
                                : () =>
                                    setPermissionFamilyEnabled(family, !isEnabled)
                            }
                            className={`mt-0.5 inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full border transition-colors ${
                              isEnabled
                                ? "border-cobam-water-blue bg-cobam-water-blue"
                                : "border-slate-300 bg-slate-200"
                            } ${isInteractionLocked ? "cursor-not-allowed opacity-80" : ""}`}
                          >
                            <span
                              className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                                isEnabled ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>

                          <div className="min-w-0">
                            <p className="font-medium text-slate-800">
                              {family.label}
                            </p>

                            {isStaffBaseFamily ? (
                              <div className="mt-1">
                                <StaffBadge
                                  size="sm"
                                  color="primary"
                                  icon="lock"
                                >
                                  Toujours activee pour le staff
                                </StaffBadge>
                              </div>
                            ) : missingMediaForceRemovePrerequisites ||
                              missingArticleCategoryForceRemovePrerequisites ? (
                              <div className="mt-1">
                                <StaffBadge
                                  size="sm"
                                  color="amber"
                                  icon="lock"
                                >
                                  Prerequis manquants
                                </StaffBadge>
                              </div>
                            ) : null}

                            {helperDescription ? (
                              <p className="mt-1 text-sm text-slate-500">
                                {helperDescription}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {family.supportsScopeSelection ? (
                            <div className="min-w-44">
                              <StaffSelect
                                value={selectedPermission?.key ?? ""}
                                onValueChange={(value) =>
                                  setPermissionFamilyScope(
                                    family,
                                    value as PermissionKey,
                                  )
                                }
                                disabled={!isEnabled || isInteractionLocked}
                                options={family.permissions.map((permission) => ({
                                  value: permission.key,
                                  label:
                                    scopeLabels[permission.scope ?? ""] ??
                                    permission.scope ??
                                    permission.label,
                                }))}
                                triggerClassName="h-10 min-w-44 rounded-lg border-slate-200 px-3 text-sm"
                                contentClassName="min-w-44"
                              />
                            </div>
                          ) : selectedPermission?.scope ? (
                            <StaffBadge size="sm" color="default">
                              {scopeLabels[selectedPermission.scope] ??
                                selectedPermission.scope}
                            </StaffBadge>
                          ) : null}

                          <StaffBadge size="sm" color="default">
                            {isStaffBaseFamily
                              ? "Verrouillee"
                              : missingMediaForceRemovePrerequisites ||
                                  missingArticleCategoryForceRemovePrerequisites
                                ? "Dependances"
                                : isEnabled
                                  ? "Activee"
                                : "Desactivee"}
                          </StaffBadge>
                          {isMediaAccessRelatedFamily || isMediaManageRelatedFamily ? (
                            <StaffBadge
                              size="sm"
                              color={
                                isMediaManageRelatedFamily ? "blue" : "cyan"
                              }
                            >
                              {isMediaManageRelatedFamily ? "Gestion medias" : "Acces medias"}
                            </StaffBadge>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
