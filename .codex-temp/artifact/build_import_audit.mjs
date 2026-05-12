import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const root = "C:/dev/CobamGroup";
const inputPath = path.join(root, ".codex-temp/product-import-audit.json");
const outputDir = path.join(root, "outputs");
const outputPath = path.join(outputDir, "product-import-cleanup-audit.xlsx");
const data = JSON.parse(await fs.readFile(inputPath, "utf8"));

function rowsFromObjects(rows) {
  if (!rows.length) return [["Aucune ligne"]];
  const headers = Object.keys(rows[0]);
  return [headers, ...rows.map((row) => headers.map((header) => row[header] ?? ""))];
}

function addSheet(workbook, name, values) {
  const sheet = workbook.worksheets.add(name);
  const range = sheet.getRange("A1").write(values);
  range.format.autofitColumns();
  if (values.length > 1 && values[0].length > 1) {
    const lastCol = String.fromCharCode("A".charCodeAt(0) + Math.min(values[0].length - 1, 25));
    sheet.tables.add(`A1:${lastCol}${values.length}`, true);
  }
  return sheet;
}

const workbook = Workbook.create();
const summary = data.summary;
addSheet(workbook, "Résumé", [
  ["Métrique", "Valeur"],
  ["Seuil stock", summary.stock_threshold],
  ["Seuil confiance template", summary.template_confidence_threshold],
  ["Seuil confiance sous-catégorie", summary.subcategory_confidence_threshold],
  ["Produits source", summary.source_products],
  ["Produits importés", summary.imported_products],
  ["Lignes à revoir", summary.review_rows],
  ["Familles créées", summary.families],
  ["Variantes", summary.variants],
  ["Produits simples", summary.single_products],
  ["Marques importées", summary.brands],
  ["Liens médias", summary.media_links],
]);

addSheet(
  workbook,
  "Templates Importés",
  [["Template", "Nombre"], ...summary.template_counts.map(([label, count]) => [label, count])],
);

addSheet(
  workbook,
  "Sous-catégories",
  [["Sous-catégorie ID", "Nombre"], ...summary.subcategory_counts.map(([label, count]) => [label, count])],
);

addSheet(
  workbook,
  "Raisons Review",
  [["Raison", "Nombre"], ...summary.review_reason_counts.map(([label, count]) => [label, count])],
);

addSheet(workbook, "Importés", rowsFromObjects(data.imported));
addSheet(workbook, "À Revoir", rowsFromObjects(data.review));

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "formula error scan",
});
console.log(errors.ndjson);

await fs.mkdir(outputDir, { recursive: true });
const blob = await SpreadsheetFile.exportXlsx(workbook);
await blob.save(outputPath);
console.log(outputPath);
