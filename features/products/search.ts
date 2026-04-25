import { getArticlePlainText } from "@/features/articles/document";
import { PRODUCT_ATTRIBUTES } from "@/lib/static_tables/attributes";
import { PRODUCT_BRANDS } from "@/lib/static_tables/brands";

const STOP_WORDS = new Set([
  "a",
  "au",
  "aux",
  "avec",
  "de",
  "des",
  "du",
  "en",
  "et",
  "la",
  "le",
  "les",
  "l",
  "un",
  "une",
  "pour",
  "par",
  "sur",
  "sans",
]);

const PRODUCT_KEYWORD_ALIASES = [
  ["melangeur", "mitigeur", "robinet", "robinetterie"],
  ["ciment", "ciment colle", "colle ciment"],
  ["carrelage", "carreau", "gres", "faience", "mosaique"],
  ["joint", "jointoiement", "mortier joint"],
  ["douche", "colonne douche", "barre douche", "bras douche"],
  ["baignoire", "jacuzzi", "lavabo", "vasque", "evier"],
  ["peinture", "enduit", "beton cire"],
  ["etancheite", "isolation", "isolant"],
  ["brique", "sable", "gravier", "treillis", "fer beton"],
  ["piscine", "margelle", "pierre bali"],
  ["porte", "menuiserie", "bois"],
];

export type PublicSearchCandidate = {
  entity_type: string;
  product_slug: string;
  product_sku: string | null;
  product_name: string | null;
  product_brand: string | null;
  product_tags: string | null;
  product_description: string | null;
  product_description_seo: string | null;
  attributes_text: string | null;
  pack_components_text: string | null;
  family_name: string | null;
  family_slug: string | null;
  family_subtitle: string | null;
  family_description: string | null;
  family_description_seo: string | null;
  family_members_text: string | null;
  category_name: string;
  category_slug: string;
  category_subtitle: string | null;
  category_description: string | null;
  category_description_seo: string | null;
  subcategory_name: string;
  subcategory_slug: string;
  subcategory_subtitle: string | null;
  subcategory_description: string | null;
  subcategory_description_seo: string | null;
};

type SearchField = {
  value: string;
  exact: number;
  prefix: number;
  includes: number;
  fuzzy: number;
};

type RecognizedKeyword = {
  key: string;
  aliases: string[];
  type: "brand" | "term" | "attribute";
};

export function normalizePublicSearchText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’`]/g, " ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function stripRichText(value: string | null | undefined) {
  const text = value ?? "";

  if (!text.trim()) {
    return "";
  }

  return getArticlePlainText(text) || text;
}

function tokenize(value: string) {
  return normalizePublicSearchText(value)
    .split(" ")
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

function buildKnownKeywords(): RecognizedKeyword[] {
  const brandKeywords: RecognizedKeyword[] = PRODUCT_BRANDS.map((brand) => ({
    key: brand.value,
    type: "brand",
    aliases: unique([brand.value, brand.label, brand.slug, brand.name].map(normalizePublicSearchText)),
  }));

  const productKeywords: RecognizedKeyword[] = PRODUCT_KEYWORD_ALIASES.map((aliases) => ({
    key: aliases[0],
    type: "term",
    aliases: unique(aliases.map(normalizePublicSearchText)),
  }));

  const attributeKeywords: RecognizedKeyword[] = PRODUCT_ATTRIBUTES.map((attribute) => ({
    key: attribute.key,
    type: "attribute",
    aliases: unique(
      [attribute.key, attribute.label, attribute.unit]
        .filter((value): value is string => Boolean(value))
        .map(normalizePublicSearchText),
    ),
  }));

  return [...brandKeywords, ...productKeywords, ...attributeKeywords];
}

const KNOWN_KEYWORDS = buildKnownKeywords();

function trigrams(value: string) {
  const padded = `  ${value} `;
  const grams = new Set<string>();

  if (value.length === 0) {
    return grams;
  }

  for (let index = 0; index < padded.length - 2; index += 1) {
    grams.add(padded.slice(index, index + 3));
  }

  return grams;
}

function trigramSimilarity(left: string, right: string) {
  const leftGrams = trigrams(left);
  const rightGrams = trigrams(right);

  if (leftGrams.size === 0 || rightGrams.size === 0) {
    return 0;
  }

  let shared = 0;
  for (const gram of leftGrams) {
    if (rightGrams.has(gram)) {
      shared += 1;
    }
  }

  return (2 * shared) / (leftGrams.size + rightGrams.size);
}

function editSimilarity(left: string, right: string) {
  if (left === right) {
    return 1;
  }

  if (left.length === 0 || right.length === 0) {
    return 0;
  }

  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  const current = Array.from({ length: right.length + 1 }, () => 0);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    current[0] = leftIndex;

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitutionCost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      current[rightIndex] = Math.min(
        previous[rightIndex] + 1,
        current[rightIndex - 1] + 1,
        previous[rightIndex - 1] + substitutionCost,
      );
    }

    for (let index = 0; index <= right.length; index += 1) {
      previous[index] = current[index];
    }
  }

  const distance = previous[right.length] ?? Math.max(left.length, right.length);
  return 1 - distance / Math.max(left.length, right.length);
}

function fuzzySimilarity(left: string, right: string) {
  return Math.max(trigramSimilarity(left, right), editSimilarity(left, right));
}

function bestTokenSimilarity(fieldValue: string, term: string) {
  const fieldTokens = tokenize(fieldValue);
  let best = fuzzySimilarity(fieldValue, term);

  for (const token of fieldTokens) {
    best = Math.max(best, fuzzySimilarity(token, term));
  }

  return best;
}

function fieldContainsWordPrefix(fieldValue: string, term: string) {
  return tokenize(fieldValue).some((token) => token.startsWith(term));
}

function scoreField(field: SearchField, term: string) {
  const value = field.value;

  if (!value || !term) {
    return 0;
  }

  if (value === term) {
    return field.exact;
  }

  if (value.startsWith(term) || fieldContainsWordPrefix(value, term)) {
    return field.prefix;
  }

  if (value.includes(term)) {
    return field.includes;
  }

  const similarity = bestTokenSimilarity(value, term);
  if (similarity >= 0.82) {
    return field.fuzzy * similarity;
  }

  if (term.length >= 5 && similarity >= 0.72) {
    return field.fuzzy * similarity * 0.72;
  }

  return 0;
}

function bestFieldScore(fields: SearchField[], term: string) {
  return fields.reduce((best, field) => Math.max(best, scoreField(field, term)), 0);
}

function detectKeywords(normalizedQuery: string, tokens: string[]) {
  const detected: RecognizedKeyword[] = [];

  for (const keyword of KNOWN_KEYWORDS) {
    const matched = keyword.aliases.some((alias) => {
      if (!alias) {
        return false;
      }

      if (normalizedQuery.includes(alias)) {
        return true;
      }

      if (alias.includes(" ")) {
        return fuzzySimilarity(normalizedQuery, alias) >= 0.78;
      }

      const threshold = keyword.type === "brand" ? 0.78 : 0.82;
      return tokens.some((token) => fuzzySimilarity(token, alias) >= threshold);
    });

    if (matched) {
      detected.push(keyword);
    }
  }

  return detected;
}

function createFields(row: PublicSearchCandidate) {
  const primaryName = row.entity_type === "FAMILY" ? row.family_name : row.product_name;
  const primarySlug = row.product_slug;
  const primaryDescription =
    row.entity_type === "FAMILY"
      ? `${stripRichText(row.family_description)} ${row.family_description_seo ?? ""}`
      : `${stripRichText(row.product_description)} ${row.product_description_seo ?? ""}`;

  const brandText = normalizePublicSearchText(row.product_brand);
  const tagsText = normalizePublicSearchText(row.product_tags);
  const categoryText = normalizePublicSearchText(
    `${row.category_name} ${row.category_slug} ${row.category_subtitle ?? ""} ${row.category_description ?? ""} ${row.category_description_seo ?? ""}`,
  );
  const subcategoryText = normalizePublicSearchText(
    `${row.subcategory_name} ${row.subcategory_slug} ${row.subcategory_subtitle ?? ""} ${row.subcategory_description ?? ""} ${row.subcategory_description_seo ?? ""}`,
  );
  const attributeText = normalizePublicSearchText(row.attributes_text);
  const packComponentsText = normalizePublicSearchText(row.pack_components_text);
  const familyText = normalizePublicSearchText(
    `${row.family_name ?? ""} ${row.family_slug ?? ""} ${row.family_subtitle ?? ""} ${stripRichText(row.family_description)} ${row.family_description_seo ?? ""} ${row.family_members_text ?? ""}`,
  );

  const strictFields: SearchField[] = [
    { value: normalizePublicSearchText(row.product_sku), exact: 1000, prefix: 760, includes: 420, fuzzy: 360 },
    { value: normalizePublicSearchText(primaryName), exact: 760, prefix: 560, includes: 360, fuzzy: 260 },
    { value: normalizePublicSearchText(primarySlug), exact: 650, prefix: 460, includes: 300, fuzzy: 220 },
    { value: brandText, exact: 620, prefix: 500, includes: 340, fuzzy: 260 },
    { value: tagsText, exact: 420, prefix: 320, includes: 260, fuzzy: 180 },
    { value: subcategoryText, exact: 300, prefix: 240, includes: 180, fuzzy: 130 },
    { value: categoryText, exact: 260, prefix: 210, includes: 160, fuzzy: 110 },
    { value: attributeText, exact: 220, prefix: 180, includes: 140, fuzzy: 100 },
    { value: familyText, exact: 220, prefix: 180, includes: 140, fuzzy: 100 },
    { value: packComponentsText, exact: 180, prefix: 150, includes: 120, fuzzy: 80 },
  ];

  const broadFields: SearchField[] = [
    ...strictFields,
    { value: normalizePublicSearchText(primaryDescription), exact: 100, prefix: 85, includes: 70, fuzzy: 42 },
  ];

  return {
    strictFields,
    broadFields,
    brandText,
  };
}

function scoreCandidate(row: PublicSearchCandidate, query: string) {
  const normalizedQuery = normalizePublicSearchText(query);
  const tokens = tokenize(normalizedQuery);

  if (!normalizedQuery || tokens.length === 0) {
    return 0;
  }

  const detectedKeywords = detectKeywords(normalizedQuery, tokens);
  const detectedBrands = detectedKeywords.filter((keyword) => keyword.type === "brand");
  const detectedTerms = detectedKeywords.filter((keyword) => keyword.type !== "brand");
  const { strictFields, broadFields } = createFields(row);

  let score = bestFieldScore(broadFields, normalizedQuery) * 1.15;

  for (const brand of detectedBrands) {
    const bestBrandScore = Math.max(
      ...brand.aliases.map((alias) => bestFieldScore(strictFields.slice(0, 5), alias)),
    );

    if (bestBrandScore < 180) {
      return null;
    }

    score += bestBrandScore + 180;
  }

  for (const term of detectedTerms) {
    const bestTermScore = Math.max(
      ...term.aliases.map((alias) => bestFieldScore(strictFields, alias)),
    );

    if (bestTermScore < 95) {
      return null;
    }

    score += bestTermScore + 80;
  }

  let matchedTokens = 0;
  for (const token of tokens) {
    const tokenScore = bestFieldScore(broadFields, token);
    if (tokenScore > 0) {
      matchedTokens += 1;
      score += tokenScore;
    }
  }

  if (detectedKeywords.length === 0 && matchedTokens === 0) {
    return null;
  }

  if (detectedKeywords.length === 0 && score < 95) {
    return null;
  }

  return score;
}

export function rankPublicProductSearchRows<T extends PublicSearchCandidate>(
  rows: T[],
  query: string,
) {
  return rows
    .map((row, index) => {
      const score = scoreCandidate(row, query);
      return score == null ? null : { row, score, index };
    })
    .filter((entry): entry is { row: T; score: number; index: number } => entry != null)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      const leftCategory = left.row.category_slug.localeCompare(right.row.category_slug, "fr-FR");
      if (leftCategory !== 0) {
        return leftCategory;
      }

      return left.row.product_slug.localeCompare(right.row.product_slug, "fr-FR");
    })
    .map((entry) => entry.row);
}
