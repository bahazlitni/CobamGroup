"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createRoleClient,
  deleteRoleClient,
  getRoleByIdClient,
  updateRoleClient,
} from "../client";
import type { RoleDetailDto, RoleMutationInput } from "../types";

export function useRoleDetail(roleId: string | null) {
  const [role, setRole] = useState<RoleDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(!!roleId);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!roleId) return;

    setIsLoading(true);
    setError(null);

    try {
      const nextRole = await getRoleByIdClient(roleId);
      setRole(nextRole);
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : "Erreur lors du chargement du rôle",
      );
    } finally {
      setIsLoading(false);
    }
  }, [roleId]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(
    async (input: RoleMutationInput) => {
      setIsSaving(true);
      setError(null);

      try {
        const nextRole = roleId
          ? await updateRoleClient(roleId, input)
          : await createRoleClient(input);
        setRole(nextRole);
        return nextRole;
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Erreur lors de l'enregistrement du rôle";
        setError(message);
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [roleId],
  );

  const remove = useCallback(async () => {
    if (!roleId) return false;

    setIsDeleting(true);
    setError(null);

    try {
      await deleteRoleClient(roleId);
      return true;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression du rôle";
      setError(message);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [roleId]);

  return {
    role,
    isLoading,
    isSaving,
    isDeleting,
    error,
    reload: load,
    save,
    remove,
  };
}
