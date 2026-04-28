"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import PanelTable from "@/components/staff/ui/PanelTable";
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

const PAGE_SIZE_OPTIONS = [20, 50, 100] as const;
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

type DraftRows = Record<number, AnnuairePersonDto>;

function getErrorMessage(error: unknown) {
  if (error instanceof AnnuaireClientError || error instanceof Error) {
    return error.message;
  }

  return "Erreur inattendue.";
}

function EditableAnnuaireCell({
  value,
  placeholder,
  disabled,
  onChange,
  onCommit,
  type = "text",
}: {
  value: string;
  placeholder: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onCommit: () => void;
  type?: "text" | "email" | "tel";
}) {
  return (
    <input
      type={type}
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onCommit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        }
      }}
      className="h-9 w-full min-w-0 rounded-lg border border-transparent bg-transparent px-2 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-300 hover:border-cobam-dark-blue/10 hover:bg-cobam-dark-blue/5 focus:border-cobam-water-blue/50 focus:bg-white disabled:cursor-default disabled:text-slate-500 disabled:hover:border-transparent disabled:hover:bg-transparent"
    />
  );
}

export default function StaffAnnuairePage() {
  const { user: authUser } = useStaffSessionContext();
  const canAccess = authUser ? canAccessAnnuaire(authUser) : false;
  const canManage = authUser ? canManageAnnuaire(authUser) : false;

  const [rows, setRows] = useState<AnnuairePersonDto[]>([]);
  const [draftRows, setDraftRows] = useState<DraftRows>({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(50);
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

  const draftList = useMemo(
    () => rows.map((row) => draftRows[row.id] ?? row),
    [draftRows, rows],
  );

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
      setDraftRows(
        Object.fromEntries(result.items.map((item) => [item.id, item])),
      );
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

  const updateDraftValue = (
    rowId: number,
    field: AnnuaireField,
    value: string,
  ) => {
    setDraftRows((current) => {
      const base = current[rowId] ?? rows.find((row) => row.id === rowId);
      if (!base) return current;

      return {
        ...current,
        [rowId]: {
          ...base,
          [field]: value,
        },
      };
    });
  };

  const commitField = async (rowId: number, field: AnnuaireField) => {
    if (!canManage || savingRowIds.has(rowId)) return;

    const original = rows.find((row) => row.id === rowId);
    const draft = draftRows[rowId];
    if (!original || !draft || original[field] === draft[field]) return;

    setRowSaving(rowId, true);
    setError(null);
    try {
      const input: AnnuairePersonInput = { [field]: draft[field] };
      const updated = await updateAnnuaireClient(rowId, input);
      setRows((current) =>
        current.map((row) => (row.id === rowId ? updated : row)),
      );
      setDraftRows((current) => ({ ...current, [rowId]: updated }));
    } catch (err) {
      setError(getErrorMessage(err));
      setDraftRows((current) => ({ ...current, [rowId]: original }));
    } finally {
      setRowSaving(rowId, false);
    }
  };

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
        <div className="rounded-2xl border border-slate-300 bg-white p-8 text-sm text-slate-500">
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
        isEmpty={draftList.length === 0}
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
        {draftList.map((person) => {
          const isRowSaving = savingRowIds.has(person.id);
          const disabled = !canManage || isRowSaving || deletingRowId === person.id;

          return (
            <tr key={person.id} className="hover:bg-slate-50/60">
              <td className="px-2 py-2 align-top">
                <EditableAnnuaireCell
                  value={person.lastName}
                  placeholder="Nom"
                  disabled={disabled}
                  onChange={(value) =>
                    updateDraftValue(person.id, "lastName", value)
                  }
                  onCommit={() => void commitField(person.id, "lastName")}
                />
              </td>
              <td className="px-2 py-2 align-top">
                <EditableAnnuaireCell
                  value={person.firstName}
                  placeholder="Prenom"
                  disabled={disabled}
                  onChange={(value) =>
                    updateDraftValue(person.id, "firstName", value)
                  }
                  onCommit={() => void commitField(person.id, "firstName")}
                />
              </td>
              <td className="px-2 py-2 align-top">
                <EditableAnnuaireCell
                  value={person.jobTitle}
                  placeholder="Poste"
                  disabled={disabled}
                  onChange={(value) =>
                    updateDraftValue(person.id, "jobTitle", value)
                  }
                  onCommit={() => void commitField(person.id, "jobTitle")}
                />
              </td>
              <td className="px-2 py-2 align-top">
                <EditableAnnuaireCell
                  type="email"
                  value={person.email}
                  placeholder="email@cobamgroup.com"
                  disabled={disabled}
                  onChange={(value) => updateDraftValue(person.id, "email", value)}
                  onCommit={() => void commitField(person.id, "email")}
                />
              </td>
              <td className="px-2 py-2 align-top">
                <EditableAnnuaireCell
                  value={person.site}
                  placeholder="Site"
                  disabled={disabled}
                  onChange={(value) => updateDraftValue(person.id, "site", value)}
                  onCommit={() => void commitField(person.id, "site")}
                />
              </td>
              <td className="px-2 py-2 align-top">
                <EditableAnnuaireCell
                  value={person.extension}
                  placeholder="Ext."
                  disabled={disabled}
                  onChange={(value) =>
                    updateDraftValue(person.id, "extension", value)
                  }
                  onCommit={() => void commitField(person.id, "extension")}
                />
              </td>
              <td className="px-2 py-2 align-top">
                <EditableAnnuaireCell
                  type="tel"
                  value={person.whatsapp}
                  placeholder="+216 ..."
                  disabled={disabled}
                  onChange={(value) =>
                    updateDraftValue(person.id, "whatsapp", value)
                  }
                  onCommit={() => void commitField(person.id, "whatsapp")}
                />
              </td>
              <td className="px-2 py-2 align-top text-right">
                {canManage ? (
                  <AnimatedUIButton
                    type="button"
                    variant="ghost"
                    color="red"
                    icon="close"
                    disabled={disabled}
                    loading={deletingRowId === person.id}
                    onClick={() => void handleDelete(person.id)}
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
