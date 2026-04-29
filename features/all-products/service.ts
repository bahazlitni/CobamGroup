import {
  Prisma,
  ProductCommercialMode,
  ProductLifecycle,
  ProductStockUnit,
} from "@prisma/client";
import type { StaffSession } from "@/features/auth/types";
import { canAccessProducts, canToggleProductLifecycle } from "@/features/products/access";
import formatEnumLabel from "@/lib/formatEnumLabel";
import { prisma } from "@/lib/server/db/prisma";
import { formatProductBrandValue } from "@/lib/static_tables/brands";
import type {
  AllProductsExportFormat,
  AllProductsExportMode,
  AllProductsListItemDto,
  AllProductsListResult,
} from "./types";

export class AllProductsServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const ALL_PRODUCTS_LIST_SELECT = {
  id: true,
  kind: true,
  sku: true,
  slug: true,
  name: true,
  description: true,
  brand: true,
  basePriceAmount: true,
  vatRate: true,
  stock: true,
  stockUnit: true,
  datasheetMediaId: true,
  visibility: true,
  priceVisibility: true,
  stockVisibility: true,
  lifecycle: true,
  commercialMode: true,
  updatedAt: true,
  mediaLinks: {
    select: {
      media: {
        select: {
          kind: true,
        },
      },
    },
  },
  subcategoryLinks: {
    select: {
      subcategory: {
        select: {
          id: true,
          name: true,
          slug: true,
          category: {
            select: {
              slug: true,
            },
          },
        },
      },
    },
  },
  familyMembership: {
    select: {
      family: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  },
  packLinesAsPack: {
    select: {
      quantity: true,
      product: {
        select: {
          brand: true,
          basePriceAmount: true,
          stock: true,
          priceVisibility: true,
          stockVisibility: true,
          lifecycle: true,
          visibility: true,
        },
      },
    },
  },
} satisfies Prisma.ProductSelect;

type AllProductsListRecord = Prisma.ProductGetPayload<{
  select: typeof ALL_PRODUCTS_LIST_SELECT;
}>;

const ALL_PRODUCTS_EXPORT_SELECT = {
  ...ALL_PRODUCTS_LIST_SELECT,
  attributes: {
    select: {
      kind: true,
      value: true,
      sortOrder: true,
    },
    orderBy: [{ sortOrder: "asc" }, { kind: "asc" }],
  },
} satisfies Prisma.ProductSelect;

type AllProductsExportRecord = Prisma.ProductGetPayload<{
  select: typeof ALL_PRODUCTS_EXPORT_SELECT;
}>;

function formatAllProductBrand(record: AllProductsListRecord) {
  if (record.kind !== "PACK") {
    return formatProductBrandValue(record.brand);
  }

  const brandLabels = [
    ...new Set(
      record.packLinesAsPack.flatMap((line) => {
        const label = formatProductBrandValue(line.product.brand);
        return label ? [label] : [];
      }),
    ),
  ];

  return brandLabels.length > 0 ? brandLabels.join(", ") : null;
}

function mapAllProductsListItem(record: AllProductsListRecord): AllProductsListItemDto {
  const derivedLifecycle = record.lifecycle ?? "DRAFT";
  const derivedVisibility =
    record.kind === "PACK"
      ? record.packLinesAsPack.length > 0 &&
        record.packLinesAsPack.every((line) => line.product.visibility === true)
      : record.visibility;
  const derivedPriceVisibility =
    record.kind === "PACK"
      ? record.packLinesAsPack.length > 0 &&
        record.packLinesAsPack.every((line) => line.product.priceVisibility === true)
      : record.priceVisibility;
  const derivedStockVisibility =
    record.kind === "PACK"
      ? record.packLinesAsPack.length > 0 &&
        record.packLinesAsPack.every((line) => line.product.stockVisibility === true)
      : record.stockVisibility;
  const derivedPrice =
    record.kind === "PACK"
      ? (() => {
          if (record.packLinesAsPack.some((line) => line.product.basePriceAmount == null)) {
            return null;
          }

          return record.packLinesAsPack
            .reduce(
              (total, line) =>
                total.add((line.product.basePriceAmount ?? new Prisma.Decimal(0)).mul(line.quantity)),
              new Prisma.Decimal(0),
            )
            .toString();
        })()
      : record.basePriceAmount?.toString() ?? null;
  const derivedStock =
    record.kind === "PACK"
      ? (() => {
          let stockValue: Prisma.Decimal | null = null;

          for (const line of record.packLinesAsPack) {
            if (line.product.stock == null) {
              return null;
            }

            const availableBundles = line.product.stock.div(line.quantity);
            stockValue =
              stockValue == null
                ? availableBundles
                : Prisma.Decimal.min(stockValue, availableBundles);
          }

          return stockValue?.toString() ?? null;
        })()
      : record.stock?.toString() ?? null;

  return {
    id: Number(record.id),
    kind: record.kind,
    sku: record.sku,
    slug: record.slug,
    name: record.name,
    description: record.description,
    brand: formatAllProductBrand(record),
    basePriceAmount: derivedPrice,
    vatRate: record.vatRate ?? null,
    stock: derivedStock,
    stockUnit: record.kind === "PACK" ? "ITEM" : record.stockUnit,
    hasImage: record.mediaLinks.some((link) => link.media.kind === "IMAGE"),
    hasDatasheet: record.kind === "PACK" ? false : record.datasheetMediaId != null,
    subcategories: record.subcategoryLinks.map(({ subcategory }) => ({
      id: Number(subcategory.id),
      name: subcategory.name,
      slug: subcategory.slug,
      categorySlug: subcategory.category.slug,
    })),
    visibility: derivedVisibility ?? null,
    priceVisibility: derivedPriceVisibility ?? null,
    stockVisibility: derivedStockVisibility ?? null,
    lifecycle: derivedLifecycle,
    commercialMode: record.commercialMode ?? null,
    updatedAt: record.updatedAt.toISOString(),
    family: record.familyMembership?.family
      ? {
          id: Number(record.familyMembership.family.id),
          name: record.familyMembership.family.name,
          slug: record.familyMembership.family.slug,
        }
      : null,
  };
}

type AllProductsExportRow = {
  product: AllProductsListItemDto;
  attributes: Map<string, string>;
};

type AllProductsExportColumn = {
  header: string;
  value: (row: AllProductsExportRow) => string | number | null | undefined;
};

export type AllProductsExportResult = {
  content: string | Uint8Array;
  contentType: string;
  filename: string;
};

const CSV_DELIMITER = ";";

const BASIC_EXPORT_COLUMNS: AllProductsExportColumn[] = [
  { header: "SKU", value: (row) => row.product.sku },
  { header: "Nom", value: (row) => row.product.name },
  { header: "Marque", value: (row) => row.product.brand },
  { header: "Prix de base", value: (row) => row.product.basePriceAmount },
  { header: "TVA", value: (row) => row.product.vatRate },
  { header: "Stock", value: (row) => row.product.stock },
  {
    header: "Unité de stock",
    value: (row) => formatEnumLabel(row.product.stockUnit),
  },
];

const EXTENDED_EXPORT_COLUMNS: AllProductsExportColumn[] = [
  ...BASIC_EXPORT_COLUMNS,
  {
    header: "Cycle de vie",
    value: (row) => formatEnumLabel(row.product.lifecycle),
  },
  {
    header: "Mode commercial",
    value: (row) => formatEnumLabel(row.product.commercialMode),
  },
  { header: "Visible", value: (row) => formatBooleanCell(row.product.visibility) },
  {
    header: "Prix visible",
    value: (row) => formatBooleanCell(row.product.priceVisibility),
  },
  {
    header: "Stock visible",
    value: (row) => formatBooleanCell(row.product.stockVisibility),
  },
  {
    header: "Sous-catégories",
    value: (row) =>
      Array.from(new Set(row.product.subcategories.map((subcategory) => subcategory.name)))
        .sort((left, right) => left.localeCompare(right, "fr", { sensitivity: "base" }))
        .join(" | "),
  },
];

function formatBooleanCell(value: boolean | null | undefined) {
  if (value == null) {
    return "";
  }

  return value ? "Oui" : "Non";
}

function normalizeCsvCellValue(value: string | number | null | undefined) {
  return value == null ? "" : String(value);
}

function escapeCsvCell(value: string | number | null | undefined) {
  const normalized = normalizeCsvCellValue(value);
  const mustQuote =
    normalized.includes(CSV_DELIMITER) ||
    normalized.includes("\"") ||
    normalized.includes("\n") ||
    normalized.includes("\r");

  if (!mustQuote) {
    return normalized;
  }

  return `"${normalized.replace(/"/g, "\"\"")}"`;
}

function buildCsv(columns: AllProductsExportColumn[], rows: AllProductsExportRow[]) {
  const csvRows = [
    columns.map((column) => escapeCsvCell(column.header)).join(CSV_DELIMITER),
    ...rows.map((row) =>
      columns
        .map((column) => escapeCsvCell(column.value(row)))
        .join(CSV_DELIMITER),
    ),
  ];

  return `\uFEFF${csvRows.join("\r\n")}`;
}

function mapAllProductsExportRow(record: AllProductsExportRecord): AllProductsExportRow {
  return {
    product: mapAllProductsListItem(record),
    attributes: new Map(
      record.attributes.map((attribute) => [attribute.kind, attribute.value]),
    ),
  };
}

function buildExportColumns(mode: AllProductsExportMode, rows: AllProductsExportRow[]) {
  if (mode === "basic") {
    return BASIC_EXPORT_COLUMNS;
  }

  if (mode === "extended") {
    return EXTENDED_EXPORT_COLUMNS;
  }

  const attributeColumns = Array.from(
    new Set(rows.flatMap((row) => Array.from(row.attributes.keys()))),
  ).sort((left, right) => left.localeCompare(right, "fr", { sensitivity: "base" }));

  return [
    ...EXTENDED_EXPORT_COLUMNS,
    ...attributeColumns.map<AllProductsExportColumn>((attributeName) => ({
      header: attributeName,
      value: (row) => row.attributes.get(attributeName) ?? "N/A",
    })),
  ];
}

const PDF_PAGE_WIDTH = 842;
const PDF_PAGE_HEIGHT = 595;
const PDF_MARGIN = 32;
const PDF_TABLE_WIDTH = PDF_PAGE_WIDTH - PDF_MARGIN * 2;
const PDF_FOOTER_Y = PDF_PAGE_HEIGHT - 24;
const PDF_TABLE_FONT_SIZE = 6;
const PDF_TABLE_LINE_HEIGHT = 7.2;

type PdfTableColumn = AllProductsExportColumn & {
  width: number;
};

function formatPdfDate(value: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function pdfNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function escapePdfText(value: string) {
  return value
    .replace(/\s+/g, " ")
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0);

      if (char === "(" || char === ")" || char === "\\") {
        return `\\${char}`;
      }

      if (code < 32 || code > 126) {
        return code <= 255 ? `\\${code.toString(8).padStart(3, "0")}` : "?";
      }

      return char;
    })
    .join("");
}

function normalizePdfCellValue(value: string | number | null | undefined) {
  const normalized = normalizeCsvCellValue(value).trim();
  return normalized || "-";
}

function wrapPdfText(
  value: string | number | null | undefined,
  width: number,
  fontSize: number,
  maxLines: number,
) {
  const normalized = normalizePdfCellValue(value);
  const maxChars = Math.max(4, Math.floor(width / (fontSize * 0.5)));
  const words = normalized.split(/\s+/);
  const lines: string[] = [];

  for (const word of words) {
    const currentLine = lines[lines.length - 1];

    if (!currentLine) {
      lines.push(word);
      continue;
    }

    if (`${currentLine} ${word}`.length <= maxChars) {
      lines[lines.length - 1] = `${currentLine} ${word}`;
      continue;
    }

    lines.push(word);
  }

  const normalizedLines = lines.flatMap((line) => {
    if (line.length <= maxChars) {
      return [line];
    }

    const chunks: string[] = [];
    for (let index = 0; index < line.length; index += maxChars) {
      chunks.push(line.slice(index, index + maxChars));
    }
    return chunks;
  });

  if (normalizedLines.length <= maxLines) {
    return normalizedLines;
  }

  const visibleLines = normalizedLines.slice(0, maxLines);
  const lastLine = visibleLines[visibleLines.length - 1] ?? "";
  visibleLines[visibleLines.length - 1] =
    lastLine.length > 3 ? `${lastLine.slice(0, -3)}...` : "...";

  return visibleLines;
}

function addPdfText(
  commands: string[],
  value: string,
  x: number,
  yTop: number,
  options: {
    font?: "F1" | "F2";
    fontSize: number;
    rgb?: [number, number, number];
  },
) {
  const [red, green, blue] = options.rgb ?? [0.1, 0.16, 0.25];
  const baseline = PDF_PAGE_HEIGHT - yTop - options.fontSize;
  commands.push(
    [
      "BT",
      `/${options.font ?? "F1"} ${pdfNumber(options.fontSize)} Tf`,
      `${pdfNumber(red)} ${pdfNumber(green)} ${pdfNumber(blue)} rg`,
      `${pdfNumber(x)} ${pdfNumber(baseline)} Td`,
      `(${escapePdfText(value)}) Tj`,
      "ET",
    ].join(" "),
  );
}

function addPdfRect(
  commands: string[],
  x: number,
  yTop: number,
  width: number,
  height: number,
  options: {
    fillRgb?: [number, number, number];
    strokeRgb?: [number, number, number];
  },
) {
  const y = PDF_PAGE_HEIGHT - yTop - height;

  if (options.fillRgb) {
    const [red, green, blue] = options.fillRgb;
    commands.push(
      `q ${pdfNumber(red)} ${pdfNumber(green)} ${pdfNumber(blue)} rg ${pdfNumber(x)} ${pdfNumber(y)} ${pdfNumber(width)} ${pdfNumber(height)} re f Q`,
    );
  }

  if (options.strokeRgb) {
    const [red, green, blue] = options.strokeRgb;
    commands.push(
      `q ${pdfNumber(red)} ${pdfNumber(green)} ${pdfNumber(blue)} RG ${pdfNumber(x)} ${pdfNumber(y)} ${pdfNumber(width)} ${pdfNumber(height)} re S Q`,
    );
  }
}

function getPdfColumnWidths(mode: AllProductsExportMode) {
  if (mode === "basic") {
    return [90, 180, 110, 85, 55, 75, 95];
  }

  return [55, 90, 65, 55, 35, 45, 55, 55, 75, 35, 45, 45, 115];
}

function buildPdfColumns(
  mode: AllProductsExportMode,
  columns: AllProductsExportColumn[],
): PdfTableColumn[] {
  const widths = getPdfColumnWidths(mode);
  const totalWidth = widths.reduce((total, width) => total + width, 0);
  const scale = totalWidth > 0 ? PDF_TABLE_WIDTH / totalWidth : 1;

  return columns.map((column, index) => ({
    ...column,
    width: (widths[index] ?? 60) * scale,
  }));
}

function addPdfReportHeader(
  commands: string[],
  mode: AllProductsExportMode,
  generatedAt: Date,
) {
  const modeLabel = mode === "basic" ? "Basic Datasheet" : "Extended Datasheet";

  addPdfText(commands, "COBAM GROUP", PDF_MARGIN, 30, {
    font: "F2",
    fontSize: 17,
    rgb: [0.04, 0.18, 0.31],
  });
  addPdfText(commands, `Export des produits - ${modeLabel}`, PDF_MARGIN, 54, {
    font: "F2",
    fontSize: 11,
    rgb: [0.08, 0.31, 0.47],
  });
  addPdfText(
    commands,
    "Page exportée depuis l'espace staff. Ce document appartient à COBAM GROUP.",
    PDF_MARGIN,
    73,
    { fontSize: 8, rgb: [0.29, 0.35, 0.44] },
  );
  addPdfText(commands, `Date d'export : ${formatPdfDate(generatedAt)}`, PDF_MARGIN, 88, {
    fontSize: 7,
    rgb: [0.39, 0.45, 0.55],
  });
}

function addPdfTableHeader(commands: string[], columns: PdfTableColumn[], yTop: number) {
  let x = PDF_MARGIN;
  const headerHeight = 24;

  for (const column of columns) {
    addPdfRect(commands, x, yTop, column.width, headerHeight, {
      fillRgb: [0.04, 0.52, 0.72],
      strokeRgb: [0.84, 0.88, 0.93],
    });

    const lines = wrapPdfText(column.header, column.width - 6, 5.8, 2);
    lines.forEach((line, lineIndex) => {
      addPdfText(commands, line, x + 3, yTop + 5 + lineIndex * 7, {
        font: "F2",
        fontSize: 5.8,
        rgb: [1, 1, 1],
      });
    });

    x += column.width;
  }

  return yTop + headerHeight;
}

function addPdfTableRow(
  commands: string[],
  columns: PdfTableColumn[],
  row: AllProductsExportRow,
  yTop: number,
  rowIndex: number,
) {
  const cells = columns.map((column) =>
    wrapPdfText(column.value(row), column.width - 6, PDF_TABLE_FONT_SIZE, 3),
  );
  const rowHeight = Math.max(
    18,
    Math.max(...cells.map((lines) => lines.length)) * PDF_TABLE_LINE_HEIGHT + 8,
  );
  const fillRgb: [number, number, number] =
    rowIndex % 2 === 0 ? [1, 1, 1] : [0.97, 0.98, 0.99];
  let x = PDF_MARGIN;

  columns.forEach((column, columnIndex) => {
    addPdfRect(commands, x, yTop, column.width, rowHeight, {
      fillRgb,
      strokeRgb: [0.84, 0.88, 0.93],
    });

    cells[columnIndex].forEach((line, lineIndex) => {
      addPdfText(commands, line, x + 3, yTop + 5 + lineIndex * PDF_TABLE_LINE_HEIGHT, {
        fontSize: PDF_TABLE_FONT_SIZE,
        rgb: [0.1, 0.16, 0.25],
      });
    });

    x += column.width;
  });

  return yTop + rowHeight;
}

function addPdfFooter(commands: string[], pageNumber: number) {
  addPdfText(
    commands,
    `Document exporté - COBAM GROUP - Page ${pageNumber}`,
    PDF_MARGIN,
    PDF_FOOTER_Y,
    { fontSize: 7, rgb: [0.39, 0.45, 0.55] },
  );
}

function createPdfDocument(pageContents: string[]) {
  const objects: string[] = [];
  const addObject = (content: string) => {
    objects.push(content);
    return objects.length;
  };

  const catalogId = addObject("");
  const pagesId = addObject("");
  const fontRegularId = addObject(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
  );
  const fontBoldId = addObject(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
  );
  const pageIds: number[] = [];

  for (const content of pageContents) {
    const contentLength = Buffer.byteLength(content, "latin1");
    const contentId = addObject(
      `<< /Length ${contentLength} >>\nstream\n${content}\nendstream`,
    );
    const pageId = addObject(
      [
        "<< /Type /Page",
        `/Parent ${pagesId} 0 R`,
        `/MediaBox [0 0 ${PDF_PAGE_WIDTH} ${PDF_PAGE_HEIGHT}]`,
        `/Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >>`,
        `/Contents ${contentId} 0 R >>`,
      ].join(" "),
    );
    pageIds.push(pageId);
  }

  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId - 1] =
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

  const buffers: Buffer[] = [];
  const offsets: number[] = [0];
  let offset = 0;
  const push = (content: string) => {
    const buffer = Buffer.from(content, "latin1");
    buffers.push(buffer);
    offset += buffer.length;
  };

  push("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");

  objects.forEach((object, index) => {
    offsets[index + 1] = offset;
    push(`${index + 1} 0 obj\n${object}\nendobj\n`);
  });

  const xrefOffset = offset;
  push(`xref\n0 ${objects.length + 1}\n`);
  push("0000000000 65535 f \n");

  for (let index = 1; index <= objects.length; index += 1) {
    push(`${String(offsets[index]).padStart(10, "0")} 00000 n \n`);
  }

  push(
    `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`,
  );

  return Buffer.concat(buffers);
}

function buildProductsPdf(
  mode: AllProductsExportMode,
  columns: AllProductsExportColumn[],
  rows: AllProductsExportRow[],
) {
  const pdfColumns = buildPdfColumns(mode, columns);
  const pageContents: string[] = [];
  const generatedAt = new Date();
  let pageNumber = 0;
  let commands: string[] = [];
  let yTop = 0;

  const startPage = () => {
    pageNumber += 1;
    commands = [];
    addPdfReportHeader(commands, mode, generatedAt);
    yTop = addPdfTableHeader(commands, pdfColumns, 112);
  };

  const finishPage = () => {
    addPdfFooter(commands, pageNumber);
    pageContents.push(commands.join("\n"));
  };

  startPage();

  if (rows.length === 0) {
    addPdfText(commands, "Aucun produit à exporter.", PDF_MARGIN, yTop + 16, {
      fontSize: 9,
      rgb: [0.39, 0.45, 0.55],
    });
  }

  rows.forEach((row, rowIndex) => {
    const rowCells = pdfColumns.map((column) =>
      wrapPdfText(column.value(row), column.width - 6, PDF_TABLE_FONT_SIZE, 3),
    );
    const nextRowHeight = Math.max(
      18,
      Math.max(...rowCells.map((lines) => lines.length)) * PDF_TABLE_LINE_HEIGHT + 8,
    );

    if (yTop + nextRowHeight > PDF_PAGE_HEIGHT - PDF_MARGIN - 24) {
      finishPage();
      startPage();
    }

    yTop = addPdfTableRow(commands, pdfColumns, row, yTop, rowIndex);
  });

  finishPage();

  return createPdfDocument(pageContents);
}

function buildExportFilename(
  mode: AllProductsExportMode,
  format: AllProductsExportFormat,
) {
  const dateStamp = new Date().toISOString().slice(0, 10);
  return `all-products-${mode}-datasheet-${dateStamp}.${format}`;
}

export async function exportAllProductsService(
  session: StaffSession,
  mode: AllProductsExportMode,
  format: AllProductsExportFormat,
): Promise<AllProductsExportResult> {
  if (!canAccessProducts(session)) {
    throw new AllProductsServiceError("Accès refusé.", 403);
  }

  if (mode === "super" && format === "pdf") {
    throw new AllProductsServiceError(
      "L'export Super est disponible uniquement en CSV.",
      400,
    );
  }

  const products = await prisma.product.findMany({
    orderBy: [{ sku: "asc" }, { name: "asc" }],
    select: ALL_PRODUCTS_EXPORT_SELECT,
  });

  const rows = products.map(mapAllProductsExportRow);
  const columns = buildExportColumns(mode, rows);

  if (format === "pdf") {
    return {
      content: buildProductsPdf(mode, columns, rows),
      contentType: "application/pdf",
      filename: buildExportFilename(mode, format),
    };
  }

  return {
    content: buildCsv(columns, rows),
    contentType: "text/csv; charset=utf-8",
    filename: buildExportFilename(mode, format),
  };
}

export async function listAllProductsService(
  session: StaffSession,
  query: { page: number; pageSize: number; q: string | null; kind?: string | null },
): Promise<AllProductsListResult> {
  if (!canAccessProducts(session)) {
    throw new AllProductsServiceError("Accès refusé.", 403);
  }

  const where: Prisma.ProductWhereInput = query.q
    ? {
        OR: [
          { sku: { contains: query.q, mode: "insensitive" } },
          { slug: { contains: query.q, mode: "insensitive" } },
          { name: { contains: query.q, mode: "insensitive" } },
          { description: { contains: query.q, mode: "insensitive" } },
          {
            familyMembership: {
              is: {
                family: {
                  is: {
                    OR: [
                      { name: { contains: query.q, mode: "insensitive" } },
                      { slug: { contains: query.q, mode: "insensitive" } },
                    ],
                  },
                },
              },
            },
          },
        ],
      }
    : {};

  if (query.kind) {
    where.kind = query.kind as Prisma.ProductWhereInput["kind"];
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      select: ALL_PRODUCTS_LIST_SELECT,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items: items.map(mapAllProductsListItem),
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
}

export async function updateAllProductLifecycleService(
  session: StaffSession,
  productId: number,
  lifecycle: ProductLifecycle,
) {
  if (!canToggleProductLifecycle(session, lifecycle)) {
    throw new AllProductsServiceError("Accès refusé.", 403);
  }

  const existing = await prisma.product.findUnique({
    where: { id: BigInt(productId) },
    select: { id: true },
  });

  if (!existing) {
    throw new AllProductsServiceError("Produit introuvable.", 404);
  }

  const updated = await prisma.product.update({
    where: { id: BigInt(productId) },
    data: { lifecycle },
    select: ALL_PRODUCTS_LIST_SELECT,
  });

  return mapAllProductsListItem(updated);
}

export type BulkProductUpdateInput = {
  sku?: string | null;
  name?: string | null;
  brand?: string | null;
  basePriceAmount?: string | null;
  vatRate?: number | null;
  stock?: string | null;
  stockUnit?: string | null;
  lifecycle?: ProductLifecycle | null;
  commercialMode?: ProductCommercialMode | null;
  visibility?: boolean | null;
  priceVisibility?: boolean | null;
  stockVisibility?: boolean | null;
};

export async function updateAllProductsBulkService(
  session: StaffSession,
  productIds: number[],
  input: BulkProductUpdateInput,
) {
  if (!canAccessProducts(session)) {
    throw new AllProductsServiceError("Acces refuse.", 403);
  }

  if (productIds.length === 0) {
    throw new AllProductsServiceError("Aucun produit selectionne.", 400);
  }

  if ((input.sku || input.name) && productIds.length > 1) {
    throw new AllProductsServiceError(
      "SKU et nom ne peuvent etre modifies que pour un seul produit.",
      400,
    );
  }

  const data: Prisma.ProductUpdateManyMutationInput = {};

  if (input.sku != null) {
    data.sku = input.sku;
  }
  if (input.name != null) {
    data.name = input.name;
  }
  if (input.brand !== undefined) {
    data.brand = input.brand;
  }
  if (input.basePriceAmount !== undefined) {
    data.basePriceAmount =
      input.basePriceAmount == null ? null : new Prisma.Decimal(input.basePriceAmount);
  }
  if (input.vatRate !== undefined) {
    data.vatRate = input.vatRate;
  }
  if (input.stock !== undefined) {
    data.stock = input.stock == null ? null : new Prisma.Decimal(input.stock);
  }
  if (input.stockUnit !== undefined) {
    data.stockUnit = input.stockUnit as ProductStockUnit | null;
  }
  if (input.lifecycle !== undefined) {
    data.lifecycle = input.lifecycle;
  }
  if (input.commercialMode !== undefined) {
    data.commercialMode = input.commercialMode;
  }
  if (input.visibility !== undefined) {
    data.visibility = input.visibility;
  }
  if (input.priceVisibility !== undefined) {
    data.priceVisibility = input.priceVisibility;
  }
  if (input.stockVisibility !== undefined) {
    data.stockVisibility = input.stockVisibility;
  }

  if (Object.keys(data).length === 0) {
    throw new AllProductsServiceError("Aucune modification fournie.", 400);
  }

  await prisma.product.updateMany({
    where: {
      id: { in: productIds.map((id) => BigInt(id)) },
    },
    data,
  });
}

export async function deleteAllProductsBulkService(
  session: StaffSession,
  productIds: number[],
) {
  if (!canAccessProducts(session)) {
    throw new AllProductsServiceError("Acces refuse.", 403);
  }

  if (productIds.length === 0) {
    throw new AllProductsServiceError("Aucun produit selectionne.", 400);
  }

  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds.map((id) => BigInt(id)) },
    },
    select: {
      id: true,
      packLinesAsComponent: {
        select: { packProductId: true },
        take: 1,
      },
    },
  });

  if (products.some((product) => product.packLinesAsComponent.length > 0)) {
    throw new AllProductsServiceError(
      "Certains produits sont utilises dans des packs.",
      400,
    );
  }

  await prisma.product.deleteMany({
    where: {
      id: { in: productIds.map((id) => BigInt(id)) },
    },
  });
}
