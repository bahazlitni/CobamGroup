"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Tags } from "lucide-react";
import { toast } from "sonner";
import Loading from "@/components/staff/Loading";
import Panel from "@/components/staff/ui/Panel";
import PanelTable from "@/components/staff/ui/PanelTable";
import {
  StaffBadge,
  StaffInput,
  StaffNotice,
  StaffPageHeader,
  StaffSelect,
  StaffStateCard,
} from "@/components/staff/ui";
import { AnimatedUIButton } from "@/components/ui/custom/Buttons";
import { useStaffSessionContext } from "@/features/auth/client/staff-session-provider";
import {
  createProductAttributeMetadataClient,
  deleteProductAttributeMetadataClient,
  listProductAttributeMetadataClient,
  ProductAttributeMetadataClientError,
  updateProductAttributeMetadataClient,
} from "@/features/product-attribute-metadata/client";
import type { ProductAttributeMetadataDto } from "@/features/product-attribute-metadata/types";
import { getProductAttributeDataTypeLabel } from "@/features/products/attribute-values";
import {
  canAccessProducts,
  canManageProducts,
} from "@/features/products/access";
import {
  PRODUCT_ATTRIBUTE_DATA_TYPE_OPTIONS,
  type ProductAttributeDataType,
} from "@/features/products/types";
import { csvRowsToObjects, parseCsvText } from "@/lib/csv/parse";

type MetadataRow = {
  formKey: string;
  id: number | null;
  name: string;
  dataType: ProductAttributeDataType;
  unit: string;
  createdAt: string | null;
  updatedAt: string | null;
  original: {
    name: string;
    dataType: ProductAttributeDataType;
    unit: string;
  };
};

function createFormKey() {
  return `metadata-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeMetadataName(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeMetadataUnit(
  value: string,
  dataType: ProductAttributeDataType,
) {
  return dataType === "NUMBER" ? value.replace(/\s+/g, " ").trim() : "";
}

function buildMetadataKey(input: {
  name: string;
  dataType: ProductAttributeDataType;
  unit: string;
}) {
  return [
    normalizeMetadataName(input.name)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("fr-FR"),
    input.dataType,
    normalizeMetadataUnit(input.unit, input.dataType)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("fr-FR"),
  ].join("::");
}

function mapDtoToRow(item: ProductAttributeMetadataDto): MetadataRow {
  return {
    formKey: createFormKey(),
    id: item.id,
    name: item.name,
    dataType: item.dataType,
    unit: item.unit ?? "",
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    original: {
      name: item.name,
      dataType: item.dataType,
      unit: item.unit ?? "",
    },
  };
}

function createEmptyRow(): MetadataRow {
  return {
    formKey: createFormKey(),
    id: null,
    name: "",
    dataType: "TEXT",
    unit: "",
    createdAt: null,
    updatedAt: null,
    original: {
      name: "",
      dataType: "TEXT",
      unit: "",
    },
  };
}

function isRowDirty(row: MetadataRow) {
  return (
    row.name !== row.original.name ||
    row.dataType !== row.original.dataType ||
    row.unit !== row.original.unit
  );
}

function buildRowSnapshot(row: MetadataRow) {
  return JSON.stringify({
    name: normalizeMetadataName(row.name),
    dataType: row.dataType,
    unit: normalizeMetadataUnit(row.unit, row.dataType),
  });
}

function mergeSavedRow(
  currentRow: MetadataRow,
  saved: ProductAttributeMetadataDto,
  submittedSnapshot: string,
) {
  const savedOriginal = {
    name: saved.name,
    dataType: saved.dataType,
    unit: saved.unit ?? "",
  };

  if (buildRowSnapshot(currentRow) === submittedSnapshot) {
    return {
      ...currentRow,
      id: saved.id,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
      original: savedOriginal,
      name: saved.name,
      dataType: saved.dataType,
      unit: saved.unit ?? "",
    };
  }

  return {
    ...currentRow,
    id: saved.id,
    createdAt: saved.createdAt,
    updatedAt: saved.updatedAt,
    original: savedOriginal,
  };
}

function getClientErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ProductAttributeMetadataClientError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function parseImportedDataType(value: string | null | undefined) {
  const normalized = (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("fr-FR");

  switch (normalized) {
    case "text":
    case "texte":
      return "TEXT" as const;
    case "number":
    case "nombre":
    case "numerique":
    case "numerique entier":
      return "NUMBER" as const;
    case "boolean":
    case "booleen":
    case "bool":
      return "BOOLEAN" as const;
    default:
      return null;
  }
}

function getCsvValue(
  row: Record<string, string>,
  headers: string[],
) {
  for (const header of headers) {
    if (row[header] != null) {
      return row[header];
    }
  }

  return "";
}

export default function ProductAttributesPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user, isLoading: isAuthLoading } = useStaffSessionContext();
  const canAccess = user ? canAccessProducts(user) : false;
  const canManage = user ? canManageProducts(user) : false;

  const [rows, setRows] = useState<MetadataRow[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingKeys, setSavingKeys] = useState<string[]>([]);
  const [deletingKeys, setDeletingKeys] = useState<string[]>([]);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [blockedSnapshots, setBlockedSnapshots] = useState<
    Record<string, string>
  >({});

  const loadRows = useCallback(async () => {
    const items = await listProductAttributeMetadataClient();
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

    void listProductAttributeMetadataClient()
      .then((items) => {
        if (!cancelled) {
          setRows(items.map(mapDtoToRow));
        }
      })
      .catch((err: unknown) => {
        if (cancelled) {
          return;
        }

        setError(
          getClientErrorMessage(
            err,
            "Erreur lors du chargement des attributs produit.",
          ),
        );
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

    return rows.filter((row) => {
      const haystacks = [
        row.name,
        getProductAttributeDataTypeLabel(row.dataType),
        row.unit,
      ];

      return haystacks.some((value) =>
        value.toLocaleLowerCase("fr-FR").includes(normalizedSearch),
      );
    });
  }, [rows, search]);

  const updateRow = useCallback(
    <Field extends keyof MetadataRow>(
      formKey: string,
      field: Field,
      value: MetadataRow[Field],
    ) => {
      setRows((currentRows) =>
        currentRows.map((row) => {
          if (row.formKey !== formKey) {
            return row;
          }

          if (field === "dataType") {
            return {
              ...row,
              dataType: value as ProductAttributeDataType,
              unit:
                (value as ProductAttributeDataType) === "NUMBER" ? row.unit : "",
            };
          }

          return { ...row, [field]: value };
        }),
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

  const handleAddRow = useCallback(() => {
    setRows((currentRows) => [createEmptyRow(), ...currentRows]);
  }, []);

  const handleSaveRow = useCallback(
    async (row: MetadataRow) => {
      if (!canManage) {
        return;
      }

      const submittedSnapshot = buildRowSnapshot(row);
      const parsedSnapshot = JSON.parse(submittedSnapshot) as {
        name: string;
        dataType: ProductAttributeDataType;
        unit: string;
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
          dataType: row.dataType,
          unit: row.dataType === "NUMBER" ? row.unit.trim() || null : null,
        };

        const saved =
          row.id == null
            ? await createProductAttributeMetadataClient(payload)
            : await updateProductAttributeMetadataClient(row.id, payload);

        setRows((currentRows) =>
          currentRows.map((currentRow) =>
            currentRow.formKey === row.formKey
              ? mergeSavedRow(currentRow, saved, submittedSnapshot)
              : currentRow,
          ),
        );
        setRowErrors((current) => {
          if (!(row.formKey in current)) {
            return current;
          }

          const next = { ...current };
          delete next[row.formKey];
          return next;
        });
        setBlockedSnapshots((current) => {
          if (!(row.formKey in current)) {
            return current;
          }

          const next = { ...current };
          delete next[row.formKey];
          return next;
        });
      } catch (err: unknown) {
        const message = getClientErrorMessage(
          err,
          "Erreur lors de l’enregistrement de l’attribut.",
        );

        setRowErrors((current) => ({
          ...current,
          [row.formKey]: message,
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
    async (row: MetadataRow) => {
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
        await deleteProductAttributeMetadataClient(row.id);
        setRows((currentRows) =>
          currentRows.filter((currentRow) => currentRow.formKey !== row.formKey),
        );
      } catch (err: unknown) {
        setRowErrors((current) => ({
          ...current,
          [row.formKey]: getClientErrorMessage(
            err,
            "Erreur lors de la suppression de l’attribut.",
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
        const parsedRows = parseCsvText(text);
        const objects = csvRowsToObjects(parsedRows);

        if (objects.length === 0) {
          toast.error("Le fichier CSV est vide.");
          return;
        }

        const existingKeys = new Set(
          rows.map((row) =>
            buildMetadataKey({
              name: row.name,
              dataType: row.dataType,
              unit: row.unit,
            }),
          ),
        );

        let importedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const object of objects) {
          const name = normalizeMetadataName(
            getCsvValue(object, ["nom", "name", "attribut", "attribute"]),
          );
          const dataType = parseImportedDataType(
            getCsvValue(object, ["type", "datatype", "data_type"]),
          );
          const unit = normalizeMetadataUnit(
            getCsvValue(object, ["unité", "unite", "unit"]),
            dataType ?? "TEXT",
          );

          if (!name || !dataType) {
            errorCount += 1;
            continue;
          }

          const dedupeKey = buildMetadataKey({ name, dataType, unit });

          if (existingKeys.has(dedupeKey)) {
            skippedCount += 1;
            continue;
          }

          try {
            await createProductAttributeMetadataClient({
              name,
              dataType,
              unit: dataType === "NUMBER" ? unit || null : null,
            });
            existingKeys.add(dedupeKey);
            importedCount += 1;
          } catch {
            errorCount += 1;
          }
        }

        await loadRows();

        if (importedCount > 0) {
          toast.success(
            `${importedCount} attribut${importedCount > 1 ? "s" : ""} importé${importedCount > 1 ? "s" : ""}.`,
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
          dataType: ProductAttributeDataType;
          unit: string;
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
        description="Vous n’avez pas l’autorisation d’accéder aux attributs produit."
        actionHref="/espace/staff/gestion-des-produits/produits"
        actionLabel="Retour aux produits"
      />
    );
  }

  return (
    <div className="space-y-6">
      <StaffPageHeader eyebrow="Produits" title="Attributs produit" icon={Tags} />

      {!canManage ? (
        <StaffNotice variant="info" title="Lecture seule">
          Vous pouvez consulter la bibliothèque des attributs, mais pas la modifier.
        </StaffNotice>
      ) : null}

      <Panel
        pretitle="Bibliothèque"
        title="Attributs communs"
        description="Chaque ligne s’enregistre automatiquement après 400 ms d’inactivité. L’unité n’est disponible que pour les attributs numériques."
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <div className="min-w-[18rem] flex-1">
              <StaffInput
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher un attribut, un type ou une unité…"
                fullWidth
              />
            </div>
            <StaffBadge size="sm" color="default" icon="tags">
              {rows.length} attribut{rows.length > 1 ? "s" : ""}
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
                onClick={handleAddRow}
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
          columns={["Nom", "Type", "Unité", "Actions"]}
          isLoading={false}
          isEmpty={visibleRows.length === 0}
          error={null}
          emptyMessage="Aucun attribut ne correspond à cette recherche."
        >
          {visibleRows.map((row) => {
            const isSavingRow = savingKeys.includes(row.formKey);
            const isDeletingRow = deletingKeys.includes(row.formKey);

            return (
              <tr key={row.formKey}>
                <td className="px-4 py-3 align-top">
                  <div className="min-w-[18rem]">
                    <StaffInput
                      value={row.name}
                      onChange={(event) =>
                        updateRow(row.formKey, "name", event.target.value)
                      }
                      placeholder="......"
                      fullWidth
                      disabled={!canManage || isDeletingRow}
                    />
                    {rowErrors[row.formKey] ? (
                      <p className="mt-1 text-xs text-red-600">
                        {rowErrors[row.formKey]}
                      </p>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="min-w-[11rem]">
                    <StaffSelect
                      value={row.dataType}
                      onValueChange={(value) =>
                        updateRow(
                          row.formKey,
                          "dataType",
                          value as ProductAttributeDataType,
                        )
                      }
                      options={PRODUCT_ATTRIBUTE_DATA_TYPE_OPTIONS.map((option) => ({
                        value: option,
                        label: getProductAttributeDataTypeLabel(option),
                      }))}
                      fullWidth
                      disabled={!canManage || isDeletingRow}
                      triggerClassName="!h-10 px-3 text-sm"
                    />
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="min-w-[12rem]">
                    {row.dataType === "NUMBER" ? (
                      <StaffInput
                        value={row.unit}
                        onChange={(event) =>
                          updateRow(row.formKey, "unit", event.target.value)
                        }
                        placeholder="Ex. L/min"
                        fullWidth
                        disabled={!canManage || isDeletingRow}
                        className="h-10 text-sm"
                      />
                    ) : (
                      <div className="flex h-10 items-center rounded-md border border-dashed border-slate-300 px-3 text-sm text-slate-400">
                        Aucune unité
                      </div>
                    )}
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
