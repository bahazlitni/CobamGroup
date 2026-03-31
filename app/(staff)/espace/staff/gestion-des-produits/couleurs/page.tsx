"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Palette } from "lucide-react";
import { toast } from "sonner";
import Loading from "@/components/staff/Loading";
import Panel from "@/components/staff/ui/Panel";
import PanelTable from "@/components/staff/ui/PanelTable";
import {
  StaffBadge,
  StaffInput,
  StaffNotice,
  StaffPageHeader,
  StaffStateCard,
} from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";
import {
  createProductColorClient,
  deleteProductColorClient,
  listProductColorsClient,
  ProductColorClientError,
  updateProductColorClient,
} from "@/features/product-colors/client";
import type { ProductColorDto } from "@/features/product-colors/types";
import {
  canAccessProducts,
  canManageProducts,
} from "@/features/products/access";
import { csvRowsToObjects, parseCsvText } from "@/lib/csv/parse";

type ColorRow = {
  formKey: string;
  id: number | null;
  name: string;
  hexValue: string;
  original: {
    name: string;
    hexValue: string;
  };
};

function createFormKey() {
  return `color-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeColorName(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeHex(value: string) {
  const trimmed = value.trim().toUpperCase();
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return withHash;
}

function buildColorKey(input: { name: string; hexValue: string }) {
  return [
    normalizeColorName(input.name)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("fr-FR"),
    normalizeHex(input.hexValue).toLocaleLowerCase("fr-FR"),
  ].join("::");
}

function mapDtoToRow(item: ProductColorDto): ColorRow {
  return {
    formKey: createFormKey(),
    id: item.id,
    name: item.name,
    hexValue: item.hexValue,
    original: {
      name: item.name,
      hexValue: item.hexValue,
    },
  };
}

function createEmptyRow(): ColorRow {
  return {
    formKey: createFormKey(),
    id: null,
    name: "",
    hexValue: "#000000",
    original: {
      name: "",
      hexValue: "#000000",
    },
  };
}

function isRowDirty(row: ColorRow) {
  return row.name !== row.original.name || row.hexValue !== row.original.hexValue;
}

function buildRowSnapshot(row: ColorRow) {
  return JSON.stringify({
    name: normalizeColorName(row.name),
    hexValue: normalizeHex(row.hexValue),
  });
}

function mergeSavedRow(
  currentRow: ColorRow,
  saved: ProductColorDto,
  submittedSnapshot: string,
) {
  const savedOriginal = {
    name: saved.name,
    hexValue: saved.hexValue,
  };

  if (buildRowSnapshot(currentRow) === submittedSnapshot) {
    return {
      ...currentRow,
      id: saved.id,
      name: saved.name,
      hexValue: saved.hexValue,
      original: savedOriginal,
    };
  }

  return {
    ...currentRow,
    id: saved.id,
    original: savedOriginal,
  };
}

function getClientErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ProductColorClientError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function getCsvValue(row: Record<string, string>, headers: string[]) {
  for (const header of headers) {
    if (row[header] != null) {
      return row[header];
    }
  }

  return "";
}

export default function ProductColorsPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user, isLoading: isAuthLoading } = useStaffSessionContext();
  const canAccess = user ? canAccessProducts(user) : false;
  const canManage = user ? canManageProducts(user) : false;

  const [rows, setRows] = useState<ColorRow[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingKeys, setSavingKeys] = useState<string[]>([]);
  const [deletingKeys, setDeletingKeys] = useState<string[]>([]);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [blockedSnapshots, setBlockedSnapshots] = useState<Record<string, string>>(
    {},
  );

  const loadRows = useCallback(async () => {
    const items = await listProductColorsClient();
    setRows(items.map(mapDtoToRow));
  }, []);

  useEffect(() => {
    if (isAuthLoading || !canAccess) {
      if (!isAuthLoading) {
        setIsLoading(false);
      }
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    void listProductColorsClient()
      .then((items) => {
        if (!cancelled) {
          setRows(items.map(mapDtoToRow));
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            getClientErrorMessage(err, "Erreur lors du chargement des couleurs."),
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [canAccess, isAuthLoading]);

  const visibleRows = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("fr-FR");

    if (!normalizedSearch) {
      return rows;
    }

    return rows.filter((row) =>
      [row.name, row.hexValue].some((value) =>
        value.toLocaleLowerCase("fr-FR").includes(normalizedSearch),
      ),
    );
  }, [rows, search]);

  const updateRow = useCallback(
    <Field extends keyof ColorRow>(
      formKey: string,
      field: Field,
      value: ColorRow[Field],
    ) => {
      setRows((currentRows) =>
        currentRows.map((row) =>
          row.formKey === formKey ? { ...row, [field]: value } : row,
        ),
      );
      setRowErrors((current) => {
        if (!(formKey in current)) {
          return current;
        }

        const next = { ...current };
        delete next[formKey];
        return next;
      });
      setBlockedSnapshots((current) => {
        if (!(formKey in current)) {
          return current;
        }

        const next = { ...current };
        delete next[formKey];
        return next;
      });
    },
    [],
  );

  const handleSaveRow = useCallback(
    async (row: ColorRow) => {
      if (!canManage) {
        return;
      }

      const submittedSnapshot = buildRowSnapshot(row);
      const parsedSnapshot = JSON.parse(submittedSnapshot) as {
        name: string;
        hexValue: string;
      };

      if (!parsedSnapshot.name) {
        return;
      }

      setSavingKeys((current) =>
        current.includes(row.formKey) ? current : [...current, row.formKey],
      );

      try {
        const payload = {
          name: row.name,
          hexValue: row.hexValue,
        };

        const saved =
          row.id == null
            ? await createProductColorClient(payload)
            : await updateProductColorClient(row.id, payload);

        setRows((currentRows) =>
          currentRows.map((currentRow) =>
            currentRow.formKey === row.formKey
              ? mergeSavedRow(currentRow, saved, submittedSnapshot)
              : currentRow,
          ),
        );
      } catch (err: unknown) {
        setRowErrors((current) => ({
          ...current,
          [row.formKey]: getClientErrorMessage(
            err,
            "Erreur lors de l’enregistrement de la couleur.",
          ),
        }));
        setBlockedSnapshots((current) => ({
          ...current,
          [row.formKey]: submittedSnapshot,
        }));
      } finally {
        setSavingKeys((current) =>
          current.filter((currentKey) => currentKey !== row.formKey),
        );
      }
    },
    [canManage],
  );

  const handleDeleteRow = useCallback(
    async (row: ColorRow) => {
      if (!canManage) {
        return;
      }

      if (row.id == null) {
        setRows((currentRows) =>
          currentRows.filter((currentRow) => currentRow.formKey !== row.formKey),
        );
        return;
      }

      setDeletingKeys((current) =>
        current.includes(row.formKey) ? current : [...current, row.formKey],
      );

      try {
        await deleteProductColorClient(row.id);
        setRows((currentRows) =>
          currentRows.filter((currentRow) => currentRow.formKey !== row.formKey),
        );
      } catch (err: unknown) {
        setRowErrors((current) => ({
          ...current,
          [row.formKey]: getClientErrorMessage(
            err,
            "Erreur lors de la suppression de la couleur.",
          ),
        }));
      } finally {
        setDeletingKeys((current) =>
          current.filter((currentKey) => currentKey !== row.formKey),
        );
      }
    },
    [canManage],
  );

  const handleImportFile = useCallback(
    async (file: File) => {
      if (!canManage) {
        return;
      }

      setIsImporting(true);

      try {
        const text = await file.text();
        const objects = csvRowsToObjects(parseCsvText(text));

        if (objects.length === 0) {
          toast.error("Le fichier CSV est vide.");
          return;
        }

        const existingKeys = new Set(
          rows.map((row) =>
            buildColorKey({ name: row.name, hexValue: row.hexValue }),
          ),
        );

        let importedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const object of objects) {
          const name = normalizeColorName(
            getCsvValue(object, ["nom", "name", "couleur", "color"]),
          );
          const hexValue = getCsvValue(object, ["hex", "hexvalue", "hex_value"]);

          if (!name || !hexValue) {
            errorCount += 1;
            continue;
          }

          const dedupeKey = buildColorKey({ name, hexValue });

          if (existingKeys.has(dedupeKey)) {
            skippedCount += 1;
            continue;
          }

          try {
            await createProductColorClient({ name, hexValue });
            existingKeys.add(dedupeKey);
            importedCount += 1;
          } catch {
            errorCount += 1;
          }
        }

        await loadRows();

        if (importedCount > 0) {
          toast.success(
            `${importedCount} couleur${importedCount > 1 ? "s" : ""} importée${importedCount > 1 ? "s" : ""}.`,
          );
        }

        if (skippedCount > 0) {
          toast.message(
            `${skippedCount} ligne${skippedCount > 1 ? "s" : ""} déjà présente${skippedCount > 1 ? "s ont" : " a"} été ignorée${skippedCount > 1 ? "s" : ""}.`,
          );
        }

        if (errorCount > 0) {
          toast.error(
            `${errorCount} ligne${errorCount > 1 ? "s" : ""} n’a pas pu être importée${errorCount > 1 ? "s" : ""}.`,
          );
        }
      } catch (error: unknown) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Impossible de lire ce fichier CSV.",
        );
      } finally {
        setIsImporting(false);
      }
    },
    [canManage, loadRows, rows],
  );

  useEffect(() => {
    if (!canManage) {
      return;
    }

    const timeoutIds = rows
      .map((row) => {
        const snapshot = buildRowSnapshot(row);
        const parsedSnapshot = JSON.parse(snapshot) as {
          name: string;
          hexValue: string;
        };

        if (
          savingKeys.includes(row.formKey) ||
          deletingKeys.includes(row.formKey) ||
          !isRowDirty(row) ||
          !parsedSnapshot.name ||
          blockedSnapshots[row.formKey] === snapshot
        ) {
          return null;
        }

        return window.setTimeout(() => {
          void handleSaveRow(row);
        }, 400);
      })
      .filter((timeoutId): timeoutId is number => timeoutId != null);

    return () => {
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [
    blockedSnapshots,
    canManage,
    deletingKeys,
    handleSaveRow,
    rows,
    savingKeys,
  ]);

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!canAccess) {
    return (
      <StaffStateCard
        title="Accès refusé"
        description="Vous n’avez pas l’autorisation d’accéder aux couleurs produit."
        actionHref="/espace/staff/gestion-des-produits/produits"
        actionLabel="Retour aux produits"
      />
    );
  }

  return (
    <div className="space-y-6">
      <StaffPageHeader eyebrow="Produits" title="Couleurs" icon={Palette} />

      {!canManage ? (
        <StaffNotice variant="info" title="Lecture seule">
          Vous pouvez consulter la bibliothèque des couleurs, mais pas la modifier.
        </StaffNotice>
      ) : null}

      <Panel
        pretitle="Bibliothèque"
        title="Couleurs communes"
        description="Cette table alimente l’autocomplete de l’attribut « Couleur »."
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <div className="min-w-[18rem] flex-1">
              <StaffInput
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher une couleur ou un code hexadécimal…"
                fullWidth
              />
            </div>
            <StaffBadge size="sm" color="default" icon="tag">
              {rows.length} couleur{rows.length > 1 ? "s" : ""}
            </StaffBadge>
          </div>

          {canManage ? (
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    void handleImportFile(file);
                  }

                  event.currentTarget.value = "";
                }}
              />
              <AnimatedUIButton
                type="button"
                variant="outline"
                icon="upload"
                iconPosition="left"
                onClick={() => fileInputRef.current?.click()}
                loading={isImporting}
                loadingText="Import…"
              >
                Importer un CSV
              </AnimatedUIButton>
              <AnimatedUIButton
                type="button"
                variant="primary"
                icon="plus"
                iconPosition="left"
                onClick={() => setRows((currentRows) => [createEmptyRow(), ...currentRows])}
              >
                Ajouter
              </AnimatedUIButton>
            </div>
          ) : null}
        </div>

        {error ? (
          <StaffNotice variant="error" title="Chargement impossible">
            {error}
          </StaffNotice>
        ) : null}

        <PanelTable
          columns={["Couleur", "Hex", "Actions"]}
          isLoading={false}
          isEmpty={visibleRows.length === 0}
          error={null}
          emptyMessage="Aucune couleur ne correspond à cette recherche."
        >
          {visibleRows.map((row) => {
            const isSavingRow = savingKeys.includes(row.formKey);
            const isDeletingRow = deletingKeys.includes(row.formKey);

            return (
              <tr key={row.formKey}>
                <td className="px-4 py-3 align-top">
                  <div className="flex min-w-[18rem] items-center gap-3">
                    <span
                      className="h-6 w-6 shrink-0 rounded-full border border-slate-300"
                      style={{ backgroundColor: row.hexValue || "#000000" }}
                    />
                    <div className="min-w-0 flex-1">
                      <StaffInput
                        value={row.name}
                        onChange={(event) =>
                          updateRow(row.formKey, "name", event.target.value)
                        }
                        placeholder="Ex. Bleu pétrole"
                        fullWidth
                        disabled={!canManage || isDeletingRow}
                        className="h-10 text-sm"
                      />
                      {rowErrors[row.formKey] ? (
                        <p className="mt-1 text-xs text-red-600">
                          {rowErrors[row.formKey]}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="min-w-[12rem]">
                    <StaffInput
                      value={row.hexValue}
                      onChange={(event) =>
                        updateRow(row.formKey, "hexValue", event.target.value)
                      }
                      placeholder="#0A8DC1"
                      fullWidth
                      disabled={!canManage || isDeletingRow}
                      className="h-10 text-sm uppercase"
                    />
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="flex items-center justify-end gap-2">
                    {isSavingRow ? (
                      <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                    ) : null}
                    {canManage ? (
                      <AnimatedUIButton
                        type="button"
                        variant="outline"
                        size="sm"
                        icon="close"
                        aria-label="Supprimer"
                        onClick={() => void handleDeleteRow(row)}
                        disabled={isDeletingRow}
                      />
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </PanelTable>
      </Panel>
    </div>
  );
}
