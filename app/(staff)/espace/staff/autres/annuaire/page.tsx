"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import PanelTable from "@/components/staff/ui/PanelTable";
import { EditableCell, EditingState } from "@/components/staff/ui/Cells";
import { StaffFilterBar, StaffPageHeader } from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/AnimatedUIButton";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";
import {
  canAccessAnnuaire,
  canManageAnnuaire,
} from "@/features/annuaire/access";
import {
  AnnuaireClientError,
  createAnnuaireClient,
  deleteAnnuaireClient,
  listAnnuaireClient,
  updateAnnuaireClient,
} from "@/features/annuaire/client";
import type {
  AnnuairePersonDto,
  AnnuairePersonInput,
} from "@/features/annuaire/types";

const PAGE_SIZE_OPTIONS = [50, 100, 200] as const;
const COLUMNS = [
  "Nom",
  "Prenom",
  "Poste",
  "Adresse Email",
  "Site",
  "Extension",
  "WhatsApp",
  "",
];
const COLUMN_WIDTHS = [
  "140px",
  "140px",
  "220px",
  "240px",
  "180px",
  "110px",
  "160px",
  "90px",
];

type AnnuaireField = keyof Pick<
  AnnuairePersonDto,
  | "lastName"
  | "firstName"
  | "jobTitle"
  | "email"
  | "site"
  | "extension"
  | "whatsapp"
>;

const EDITABLE_FIELDS: {
  field: AnnuaireField;
  placeholder: string;
}[] = [
  { field: "lastName", placeholder: "Nom" },
  { field: "firstName", placeholder: "Prenom" },
  { field: "jobTitle", placeholder: "Poste" },
  { field: "email", placeholder: "email@cobamgroup.com" },
  { field: "site", placeholder: "Site" },
  { field: "extension", placeholder: "Ext." },
  { field: "whatsapp", placeholder: "+216 ..." },
];

function getErrorMessage(error: unknown) {
  if (error instanceof AnnuaireClientError || error instanceof Error) {
    return error.message;
  }

  return "Erreur inattendue.";
}

export default function StaffAnnuairePage() {
  const { user: authUser } = useStaffSessionContext();
  const canAccess = authUser ? canAccessAnnuaire(authUser) : false;
  const canManage = authUser ? canManageAnnuaire(authUser) : false;

  const [rows, setRows] = useState<AnnuairePersonDto[]>([]);
  const [editing, setEditing] = useState<EditingState>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(100);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [savingRowIds, setSavingRowIds] = useState<Set<number>>(() => new Set());
  const [deletingRowId, setDeletingRowId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const load = useCallback(async () => {
    if (!canAccess) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await listAnnuaireClient({
        page,
        pageSize,
        q: submittedSearch,
      });
      setRows(result.items);
      setTotal(result.total);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [canAccess, page, pageSize, submittedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  const setRowSaving = useCallback((rowId: number, saving: boolean) => {
    setSavingRowIds((current) => {
      const next = new Set(current);
      if (saving) {
        next.add(rowId);
      } else {
        next.delete(rowId);
      }
      return next;
    });
  }, []);

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    setSubmittedSearch(search);
  };

  const handleStartEdit = useCallback(
    (rowId: number, field: string, value: string) => {
      setEditing({ rowId, field, value });
    },
    [],
  );

  const handleChangeEdit = useCallback((value: string) => {
    setEditing((current) => (current ? { ...current, value } : current));
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditing(null);
  }, []);

  const handleCommitEdit = useCallback(async () => {
    if (!editing) return;
    const { rowId, field, value } = editing;
    const fieldKey = field as AnnuaireField;

    const original = rows.find((row) => row.id === rowId);
    setEditing(null);

    if (!canManage || !original || original[fieldKey] === value) {
      return;
    }

    setRowSaving(rowId, true);
    setError(null);
    try {
      const input: AnnuairePersonInput = { [fieldKey]: value };
      const updated = await updateAnnuaireClient(rowId, input);
      setRows((current) =>
        current.map((row) => (row.id === rowId ? updated : row)),
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRowSaving(rowId, false);
    }
  }, [canManage, editing, rows, setRowSaving]);

  const handleCreate = async () => {
    if (!canManage || isCreating) return;

    setIsCreating(true);
    setError(null);
    try {
      await createAnnuaireClient({});
      setPage(1);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (rowId: number) => {
    if (!canManage || deletingRowId != null) return;

    setDeletingRowId(rowId);
    setError(null);
    try {
      await deleteAnnuaireClient(rowId);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingRowId(null);
    }
  };

  if (!canAccess) {
    return (
      <div className="space-y-6">
        <StaffPageHeader eyebrow="Autres" title="Annuaire" />
        <div className="rounded-lg border border-slate-300 bg-white p-8 text-sm text-slate-500">
          Vous n'avez pas la permission de consulter l'annuaire.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StaffPageHeader eyebrow="Autres" title="Annuaire Cobam">
        {canManage ? (
          <AnimatedUIButton
            type="button"
            variant="secondary"
            icon="plus"
            iconPosition="left"
            loading={isCreating}
            loadingText="Ajout..."
            onClick={() => void handleCreate()}
          >
            Ajouter une ligne
          </AnimatedUIButton>
        ) : null}
      </StaffPageHeader>

      <form onSubmit={handleSearchSubmit}>
        <StaffFilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Rechercher par nom, poste, site, email..."
          summary={`${total} contact${total > 1 ? "s" : ""}`}
        />
      </form>

      <PanelTable
        columns={COLUMNS}
        columnWidths={COLUMN_WIDTHS}
        isLoading={isLoading}
        error={error}
        isEmpty={rows.length === 0}
        emptyMessage="Aucun contact dans l'annuaire."
        pagination={{
          goPrev: () => setPage((current) => Math.max(1, current - 1)),
          goNext: () => setPage((current) => Math.min(totalPages, current + 1)),
          updatePageSize: (value) => {
            setPage(1);
            setPageSize(value as (typeof PAGE_SIZE_OPTIONS)[number]);
          },
          canPrev,
          canNext,
          pageSize,
          total,
          totalPages,
          page,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          itemLabel: "contact",
        }}
      >
        {rows.map((person) => {
          const isRowSaving = savingRowIds.has(person.id);
          const readOnly = !canManage;

          return (
            <tr key={person.id} className="hover:bg-slate-50/60">
              {EDITABLE_FIELDS.map(({ field, placeholder }) => (
                <td key={field} className="align-top">
                  <EditableCell
                    rowId={person.id}
                    field={field}
                    value={person[field]}
                    editing={editing}
                    saving={isRowSaving}
                    readOnly={readOnly}
                    onStartEdit={handleStartEdit}
                    onChangeEdit={handleChangeEdit}
                    onCommitEdit={handleCommitEdit}
                    onCancelEdit={handleCancelEdit}
                  />
                </td>
              ))}
              <td className="align-top text-center">
                {canManage ? (
                  <AnimatedUIButton
                    type="button"
                    variant="ghost"
                    color="red"
                    icon="close"
                    disabled={isRowSaving || deletingRowId === person.id}
                    loading={deletingRowId === person.id}
                    onClick={() => void handleDelete(person.id)}
                    size="sm"
                    loadingText=""
                  />
                ) : null}
              </td>
            </tr>
          );
        })}
      </PanelTable>
    </div>
  );
}