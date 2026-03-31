export function parseCsvText(text: string) {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentValue = "";
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentValue += '"';
        index += 1;
        continue;
      }

      insideQuotes = !insideQuotes;
      continue;
    }

    if (!insideQuotes && (char === "," || char === ";" || char === "\t")) {
      currentRow.push(currentValue.trim());
      currentValue = "";
      continue;
    }

    if (!insideQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }

      currentRow.push(currentValue.trim());
      if (currentRow.some((value) => value !== "")) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentValue = "";
      continue;
    }

    currentValue += char;
  }

  currentRow.push(currentValue.trim());
  if (currentRow.some((value) => value !== "")) {
    rows.push(currentRow);
  }

  return rows;
}

export function csvRowsToObjects(rows: string[][]) {
  if (rows.length === 0) {
    return [];
  }

  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.map((header) => header.trim());
  const normalizedHeaders = headers.map((header) =>
    header
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("fr-FR")
      .replace(/[^a-z0-9]+/g, ""),
  );

  return dataRows.map((row) => {
    const result: Record<string, string> = {};

    headers.forEach((header, index) => {
      const value = row[index]?.trim() ?? "";
      result[header] = value;
      const normalizedHeader = normalizedHeaders[index];

      if (normalizedHeader && normalizedHeader !== header) {
        result[normalizedHeader] = value;
      }
    });

    return result;
  });
}
