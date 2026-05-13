"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
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
import {
  mergeUniqueById,
  readStaffInfiniteListCache,
  useStaffInfiniteScroll,
  useStaffScrollRestoration,
  writeStaffInfiniteListCache,
} from "@/lib/client/use-staff-infinite-scroll";

const PAGE_SIZE = 100;
const LIST_CACHE_KEY = "annuaire";
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

type AnnuaireListCacheExtra = {
  search: string;
  submittedSearch: string;
};

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

  const [listCache] = useState(() =>
    readStaffInfiniteListCache<AnnuairePersonDto, AnnuaireListCacheExtra>(
      LIST_CACHE_KEY,
    ),
  );
  const [rows, setRows] = useState<AnnuairePersonDto[]>(
    () => listCache?.items ?? [],
  );
  const [editing, setEditing] = useState<EditingState>(null);
  const [total, setTotal] = useState(() => listCache?.total ?? 0);
  const [page, setPage] = useState(() => listCache?.page ?? 1);
  const [pageSize] = useState(() => listCache?.pageSize ?? PAGE_SIZE);
  const [search, setSearch] = useState(() => listCache?.extra?.search ?? "");
  const [submittedSearch, setSubmittedSearch] = useState(
    () => listCache?.extra?.submittedSearch ?? "",
  );
  const [isLoading, setIsLoading] = useState(listCache == null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(() =>
    listCache ? listCache.items.length < listCache.total : true,
  );
  const [isCreating, setIsCreating] = useState(false);
  const [savingRowIds, setSavingRowIds] = useState<Set<number>>(() => new Set());
  const [deletingRowId, setDeletingRowId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const listRequestIdRef = useRef(0);
  const didLoadInitialRef = useRef(listCache != null);
  const pageRef = useRef(page);
  const submittedSearchRef = useRef(submittedSearch);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    submittedSearchRef.current = submittedSearch;
  }, [submittedSearch]);

  const fetchPage = useCallback(
    async (options?: {
      page?: number;
      search?: string;
      reset?: boolean;
    }) => {
      if (!canAccess) {
        setIsLoading(false);
        setIsLoadingMore(false);
        return;
      }

      const nextPage = options?.page ?? pageRef.current;
      const reset = options?.reset ?? nextPage === 1;
      const nextSearch = options?.search ?? submittedSearchRef.current;
      const requestId = ++listRequestIdRef.current;

      if (reset) {
        setIsLoading(true);
        setRows([]);
        setPage(1);
        setHasMore(true);
        setSubmittedSearch(nextSearch);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      try {
        const result = await listAnnuaireClient({
          page: nextPage,
          pageSize,
          q: nextSearch,
        });

        if (requestId !== listRequestIdRef.current) {
          return;
        }

        setRows((current) =>
          reset ? result.items : mergeUniqueById(current, result.items),
        );
        setTotal(result.total);
        setPage(result.page);
        setHasMore(result.page * result.pageSize < result.total);
      } catch (err) {
        if (requestId !== listRequestIdRef.current) {
          return;
        }

        setError(getErrorMessage(err));
        if (reset) {
          setTotal(0);
          setHasMore(false);
        }
      } finally {
        if (requestId === listRequestIdRef.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [canAccess, pageSize],
  );

  useEffect(() => {
    if (didLoadInitialRef.current) {
      return;
    }

    didLoadInitialRef.current = true;
    void fetchPage({ page: 1, reset: true });
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore) {
      return;
    }

    await fetchPage({ page: page + 1, reset: false });
  }, [fetchPage, hasMore, isLoading, isLoadingMore, page]);

  const sentinelRef = useStaffInfiniteScroll({
    hasMore,
    isLoading: isLoading || isLoadingMore,
    onLoadMore: loadMore,
    enabled: canAccess && !error,
  });

  useStaffScrollRestoration(LIST_CACHE_KEY, !isLoading);

  useEffect(() => {
    if (isLoading && rows.length === 0 && total === 0) {
      return;
    }

    writeStaffInfiniteListCache<AnnuairePersonDto, AnnuaireListCacheExtra>(
      LIST_CACHE_KEY,
      {
        items: rows,
        total,
        page,
        pageSize,
        extra: {
          search,
          submittedSearch,
        },
      },
    );
  }, [isLoading, page, pageSize, rows, search, submittedSearch, total]);

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
    void fetchPage({ page: 1, search, reset: true });
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
      await fetchPage({ page: 1, search: submittedSearch, reset: true });
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
      await fetchPage({ page: 1, search: submittedSearch, reset: true });
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
          Vous n&apos;avez pas la permission de consulter l&apos;annuaire.
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
        infiniteScroll={{
          hasMore,
          isLoadingMore,
          onLoadMore: loadMore,
          loaded: rows.length,
          total,
          itemLabel: "contact",
          sentinelRef,
        }}
      >
        {rows.map((person) => {
          const isRowSaving = savingRowIds.has(person.id);
          const readOnly = !canManage;

          return (
            <tr key={person.id} className="hover:bg-slate-50/60">
              {EDITABLE_FIELDS.map(({ field }) => (
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
