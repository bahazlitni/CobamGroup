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

const DEFAULT_SCORE_THRESHOLD = 95;
const LOW_SIGNAL_PRUNE_THRESHOLD = 35;
const QUERY_PLAN_CACHE_LIMIT = 160;
const NORMALIZED_TEXT_CACHE_LIMIT = 6000;
const TOKEN_CACHE_LIMIT = 6000;
const TRIGRAM_CACHE_LIMIT = 6000;

export type ProductSearchCandidate = {
  entity_type: string;
  product_slug: string;
  product_sku: string | null;
  product_name: string | null;
  product_brand: string | null;
  product_tags: string | null;
  product_description: string | null;
  product_description_seo: string | null;
  attributes_text: string | null;
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

export type PublicSearchCandidate = ProductSearchCandidate;

export type ProductSearchRankOptions = {
  limit?: number | null;
  scoreThreshold?: number;
};

type SearchField = {
  value: string;
  exact: number;
  prefix: number;
  includes: number;
  fuzzy: number;
};

type QueryPlan = {
  rawQuery: string;
  normalizedQuery: string;
  tokens: string[];
};

type RecognizedKeyword = {
  key: string;
  aliases: string[];
  type: "brand" | "term" | "attribute";
};

type CandidateSearchIndex = {
  importantFields: SearchField[];
  secondaryFields: SearchField[];
  strictFields: SearchField[];
  broadFields: SearchField[];
};

const queryPlanCache = new Map<string, QueryPlan>();
const normalizedTextCache = new Map<string, string>();
const tokenCache = new Map<string, string[]>();
const trigramCache = new Map<string, Set<string>>();
const candidateIndexCache = new WeakMap<ProductSearchCandidate, CandidateSearchIndex>();

function rememberCacheValue<K, V>(cache: Map<K, V>, key: K, value: V, limit: number) {
  if (cache.size >= limit) {
    const oldestKey = cache.keys().next().value as K | undefined;
    if (oldestKey !== undefined) {
      cache.delete(oldestKey);
    }
  }

  cache.set(key, value);
  return value;
}

function normalizeProductSearchTextUncached(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['\u2019`]/g, " ")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function normalizeProductSearchText(value: string | null | undefined) {
  const raw = value ?? "";
  const cached = normalizedTextCache.get(raw);

  if (cached != null) {
    return cached;
  }

  return rememberCacheValue(
    normalizedTextCache,
    raw,
    normalizeProductSearchTextUncached(raw),
    NORMALIZED_TEXT_CACHE_LIMIT,
  );
}

export const normalizePublicSearchText = normalizeProductSearchText;

export function getProductSearchPlainText(value: unknown): string {
  if (value == null) {
    return "";
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return "";
    }

    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return getProductSearchPlainText(JSON.parse(trimmed));
      } catch {
        // Plain text can legitimately start with a brace.
      }
    }

    return trimmed.replace(/\s+/g, " ");
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => getProductSearchPlainText(item))
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  }

  if (typeof value !== "object") {
    return "";
  }

  const node = value as { text?: unknown; content?: unknown };
  return [typeof node.text === "string" ? node.text : "", getProductSearchPlainText(node.content)]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripRichText(value: string | null | undefined) {
  return getProductSearchPlainText(value);
}

function tokenize(value: string) {
  const normalized = normalizeProductSearchText(value);
  const cached = tokenCache.get(normalized);

  if (cached) {
    return cached;
  }

  return rememberCacheValue(
    tokenCache,
    normalized,
    normalized.split(" ").filter((token) => token.length > 1 && !STOP_WORDS.has(token)),
    TOKEN_CACHE_LIMIT,
  );
}

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

function buildKnownKeywords(rows: readonly ProductSearchCandidate[]): RecognizedKeyword[] {
  const brandKeywords: RecognizedKeyword[] = unique(
    rows.map((row) => row.product_brand).filter((brand): brand is string => Boolean(brand?.trim())),
  ).map((brand) => ({
    key: brand,
    type: "brand",
    aliases: unique([brand].map(normalizeProductSearchText)),
  }));

  const productKeywords: RecognizedKeyword[] = PRODUCT_KEYWORD_ALIASES.map((aliases) => ({
    key: aliases[0],
    type: "term",
    aliases: unique(aliases.map(normalizeProductSearchText)),
  }));

  return [...brandKeywords, ...productKeywords];
}

function trigrams(value: string) {
  const cached = trigramCache.get(value);

  if (cached) {
    return cached;
  }

  const padded = `  ${value} `;
  const grams = new Set<string>();

  if (value.length === 0) {
    return rememberCacheValue(trigramCache, value, grams, TRIGRAM_CACHE_LIMIT);
  }

  for (let index = 0; index < padded.length - 2; index += 1) {
    grams.add(padded.slice(index, index + 3));
  }

  return rememberCacheValue(trigramCache, value, grams, TRIGRAM_CACHE_LIMIT);
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

function scoreField(field: SearchField, term: string, options?: { allowFuzzy?: boolean }) {
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

  if (options?.allowFuzzy === false) {
    return 0;
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

function bestFieldScore(fields: SearchField[], term: string, options?: { allowFuzzy?: boolean }) {
  return fields.reduce((best, field) => Math.max(best, scoreField(field, term, options)), 0);
}

function detectKeywords(
  normalizedQuery: string,
  tokens: string[],
  knownKeywords: readonly RecognizedKeyword[],
) {
  const detected: RecognizedKeyword[] = [];

  for (const keyword of knownKeywords) {
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

function createFields(row: ProductSearchCandidate): CandidateSearchIndex {
  const cached = candidateIndexCache.get(row);

  if (cached) {
    return cached;
  }

  const primaryName = row.entity_type === "FAMILY" ? row.family_name : row.product_name;
  const primarySlug = row.product_slug;
  const primaryDescription =
    row.entity_type === "FAMILY"
      ? `${stripRichText(row.family_description)} ${row.family_description_seo ?? ""}`
      : `${stripRichText(row.product_description)} ${row.product_description_seo ?? ""}`;

  const brandText = normalizeProductSearchText(row.product_brand);
  const tagsText = normalizeProductSearchText(row.product_tags);
  const categoryText = normalizeProductSearchText(
    `${row.category_name} ${row.category_slug} ${row.category_subtitle ?? ""} ${row.category_description ?? ""} ${row.category_description_seo ?? ""}`,
  );
  const subcategoryText = normalizeProductSearchText(
    `${row.subcategory_name} ${row.subcategory_slug} ${row.subcategory_subtitle ?? ""} ${row.subcategory_description ?? ""} ${row.subcategory_description_seo ?? ""}`,
  );
  const attributeText = normalizeProductSearchText(row.attributes_text);
  const familyText = normalizeProductSearchText(
    `${row.family_name ?? ""} ${row.family_slug ?? ""} ${row.family_subtitle ?? ""} ${stripRichText(row.family_description)} ${row.family_description_seo ?? ""} ${row.family_members_text ?? ""}`,
  );

  const importantFields: SearchField[] = [
    {
      value: normalizeProductSearchText(row.product_sku),
      exact: 1000,
      prefix: 760,
      includes: 420,
      fuzzy: 360,
    },
    {
      value: normalizeProductSearchText(primaryName),
      exact: 760,
      prefix: 560,
      includes: 360,
      fuzzy: 260,
    },
    {
      value: normalizeProductSearchText(primarySlug),
      exact: 650,
      prefix: 460,
      includes: 300,
      fuzzy: 220,
    },
    { value: brandText, exact: 620, prefix: 500, includes: 340, fuzzy: 260 },
    { value: tagsText, exact: 420, prefix: 320, includes: 260, fuzzy: 180 },
  ];

  const secondaryFields: SearchField[] = [
    { value: subcategoryText, exact: 300, prefix: 240, includes: 180, fuzzy: 130 },
    { value: categoryText, exact: 260, prefix: 210, includes: 160, fuzzy: 110 },
    { value: attributeText, exact: 220, prefix: 180, includes: 140, fuzzy: 100 },
    { value: familyText, exact: 220, prefix: 180, includes: 140, fuzzy: 100 },
  ];

  const strictFields: SearchField[] = [...importantFields, ...secondaryFields];
  const broadFields: SearchField[] = [
    ...strictFields,
    {
      value: normalizeProductSearchText(primaryDescription),
      exact: 100,
      prefix: 85,
      includes: 70,
      fuzzy: 42,
    },
  ];

  const index = {
    importantFields,
    secondaryFields,
    strictFields,
    broadFields,
  };

  candidateIndexCache.set(row, index);

  return index;
}

function hasUsefulEarlySignal(fields: CandidateSearchIndex, plan: QueryPlan) {
  const importantQueryScore = bestFieldScore(fields.importantFields, plan.normalizedQuery);
  const secondaryCheapScore = bestFieldScore(fields.secondaryFields, plan.normalizedQuery, {
    allowFuzzy: false,
  });

  if (Math.max(importantQueryScore, secondaryCheapScore) >= LOW_SIGNAL_PRUNE_THRESHOLD) {
    return true;
  }

  for (const token of plan.tokens) {
    const tokenScore = Math.max(
      bestFieldScore(fields.importantFields, token),
      bestFieldScore(fields.secondaryFields, token, { allowFuzzy: false }),
    );

    if (tokenScore >= LOW_SIGNAL_PRUNE_THRESHOLD) {
      return true;
    }
  }

  return false;
}

function scoreCandidate(
  row: ProductSearchCandidate,
  plan: QueryPlan,
  detectedKeywords: readonly RecognizedKeyword[],
  options: Required<Pick<ProductSearchRankOptions, "scoreThreshold">>,
) {
  const { normalizedQuery, tokens } = plan;

  if (!normalizedQuery || tokens.length === 0) {
    return 0;
  }

  const detectedBrands = detectedKeywords.filter((keyword) => keyword.type === "brand");
  const detectedTerms = detectedKeywords.filter((keyword) => keyword.type !== "brand");
  const fields = createFields(row);
  const { strictFields, broadFields } = fields;

  if (detectedKeywords.length === 0 && !hasUsefulEarlySignal(fields, plan)) {
    return null;
  }

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

  if (score < options.scoreThreshold) {
    return null;
  }

  return score;
}

function getQueryPlan(query: string): QueryPlan {
  const normalizedQuery = normalizeProductSearchText(query);
  const cached = queryPlanCache.get(normalizedQuery);

  if (cached) {
    return cached;
  }

  return rememberCacheValue(
    queryPlanCache,
    normalizedQuery,
    {
      rawQuery: query,
      normalizedQuery,
      tokens: tokenize(normalizedQuery),
    },
    QUERY_PLAN_CACHE_LIMIT,
  );
}

function normalizeRankOptions(options?: ProductSearchRankOptions) {
  const limit =
    options?.limit != null && Number.isInteger(options.limit) && options.limit > 0
      ? options.limit
      : null;

  return {
    limit,
    scoreThreshold: Math.max(0, options?.scoreThreshold ?? DEFAULT_SCORE_THRESHOLD),
  };
}

function compareRankedEntries<T extends ProductSearchCandidate>(
  left: { row: T; score: number; index: number },
  right: { row: T; score: number; index: number },
) {
  if (right.score !== left.score) {
    return right.score - left.score;
  }

  return left.row.product_slug.localeCompare(right.row.product_slug, "fr-FR");
}

function collectRankedEntry<T extends ProductSearchCandidate>(
  entries: Array<{ row: T; score: number; index: number }>,
  entry: { row: T; score: number; index: number },
  limit: number | null,
) {
  if (limit == null) {
    entries.push(entry);
    return;
  }

  if (entries.length < limit) {
    entries.push(entry);
    return;
  }

  let worstIndex = 0;
  for (let index = 1; index < entries.length; index += 1) {
    if (compareRankedEntries(entries[worstIndex], entries[index]) < 0) {
      worstIndex = index;
    }
  }

  if (compareRankedEntries(entry, entries[worstIndex]) < 0) {
    entries[worstIndex] = entry;
  }
}

export function rankProductSearchRows<T extends ProductSearchCandidate>(
  rows: T[],
  query: string,
  options?: ProductSearchRankOptions,
) {
  return rankProductSearchRowsWithScores(rows, query, options).map((entry) => entry.row);
}

export function rankProductSearchRowsWithScores<T extends ProductSearchCandidate>(
  rows: T[],
  query: string,
  options?: ProductSearchRankOptions,
) {
  const plan = getQueryPlan(query);
  const rankOptions = normalizeRankOptions(options);

  if (!plan.normalizedQuery || plan.tokens.length === 0) {
    return [];
  }

  const knownKeywords = buildKnownKeywords(rows);
  const detectedKeywords = detectKeywords(plan.normalizedQuery, plan.tokens, knownKeywords);
  const entries: Array<{ row: T; score: number; index: number }> = [];

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    if (!row) {
      continue;
    }

    const score = scoreCandidate(row, plan, detectedKeywords, rankOptions);
    if (score == null) {
      continue;
    }

    collectRankedEntry(entries, { row, score, index }, rankOptions.limit);
  }

  return entries
    .sort(compareRankedEntries)
    .map((entry) => ({ row: entry.row, score: Math.round(entry.score) }));
}

export const rankPublicProductSearchRows = rankProductSearchRows;
export const rankPublicProductSearchRowsWithScores = rankProductSearchRowsWithScores;
