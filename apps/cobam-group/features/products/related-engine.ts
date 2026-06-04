export const RELATED_PRODUCTS_DEFAULT_THRESHOLD = 42;
export const RELATED_PRODUCTS_DEFAULT_LIMIT = 32;

export type RelatedProductEntityType = "FAMILY" | "SINGLE" | "VARIANT";

export type RelatedProductAttributeProfile = {
  key: string;
  name: string;
  value: string;
  unit?: string | null;
  groupName?: string | null;
};

export type RelatedProductProfile = {
  key: string;
  entityType: RelatedProductEntityType;
  id: number;
  slug: string;
  productIds: number[];
  familyIds: number[];
  names: string[];
  skus: string[];
  brandNames: string[];
  productTypeSlugs: string[];
  productTypeNames: string[];
  categorySlugs: string[];
  categoryNames: string[];
  subcategorySlugs: string[];
  subcategoryNames: string[];
  tags: string[];
  descriptions: string[];
  attributes: RelatedProductAttributeProfile[];
};

export type RelatedProductMatch<T> = {
  item: T;
  score: number;
  reasons: string[];
};

export type RelatedProductScoringOptions = {
  threshold?: number;
  limit?: number;
};

const STOP_WORDS = new Set([
  "a",
  "au",
  "aux",
  "avec",
  "chez",
  "cobam",
  "de",
  "des",
  "du",
  "en",
  "et",
  "group",
  "la",
  "le",
  "les",
  "par",
  "pour",
  "produit",
  "produits",
  "ref",
  "reference",
  "sans",
  "sur",
]);

const ATTRIBUTE_WEIGHTS: Record<string, number> = {
  application_area: 12,
  brick_type: 16,
  color: 9,
  connection_size: 8,
  dimensions_text: 10,
  finish: 11,
  format_text: 12,
  joint_width_mm: 12,
  material: 9,
  packaging_volume_l: 8,
  packaging_weight_kg: 8,
  product_line: 16,
  product_range: 16,
  product_use: 15,
  seat_type: 12,
};

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/['’]/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ");
}

function normalizeKey(value: string | null | undefined) {
  return normalizeText(value).replace(/\s+/g, "_");
}

function compact(values: Array<string | null | undefined>) {
  return values.map((value) => value?.trim()).filter((value): value is string => Boolean(value));
}

function unique(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const normalized = normalizeText(value);
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    result.push(value);
  }

  return result;
}

function tokenize(value: string) {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length >= 2 && !STOP_WORDS.has(token));
}

function addTokens(
  bag: Map<string, number>,
  values: string[],
  weight: number,
) {
  for (const value of values) {
    for (const token of tokenize(value)) {
      bag.set(token, (bag.get(token) ?? 0) + weight);
    }
  }
}

function buildWeightedTokenBag(profile: RelatedProductProfile) {
  const bag = new Map<string, number>();

  addTokens(bag, profile.names, 4);
  addTokens(bag, profile.brandNames, 3);
  addTokens(bag, profile.productTypeNames, 3);
  addTokens(bag, profile.categoryNames, 2);
  addTokens(bag, profile.subcategoryNames, 3);
  addTokens(bag, profile.tags, 2);
  addTokens(
    bag,
    profile.attributes.flatMap((attribute) => [attribute.name, attribute.value]),
    3,
  );
  addTokens(bag, profile.descriptions, 1);
  addTokens(bag, profile.skus, 1);

  return bag;
}

function weightedDice(left: Map<string, number>, right: Map<string, number>) {
  let leftTotal = 0;
  let rightTotal = 0;
  let shared = 0;

  for (const value of left.values()) {
    leftTotal += value;
  }

  for (const value of right.values()) {
    rightTotal += value;
  }

  for (const [token, leftWeight] of left) {
    const rightWeight = right.get(token);
    if (rightWeight) {
      shared += Math.min(leftWeight, rightWeight);
    }
  }

  return leftTotal + rightTotal > 0 ? (2 * shared) / (leftTotal + rightTotal) : 0;
}

function normalizedSet(values: string[]) {
  return new Set(values.map(normalizeText).filter(Boolean));
}

function intersectionCount(left: Set<string>, right: Set<string>) {
  let count = 0;

  for (const value of left) {
    if (right.has(value)) {
      count += 1;
    }
  }

  return count;
}

function buildAttributeMap(profile: RelatedProductProfile) {
  const map = new Map<string, Set<string>>();

  for (const attribute of profile.attributes) {
    const key = normalizeKey(attribute.key || attribute.name);
    const value = normalizeText(attribute.value);
    if (!key || !value) {
      continue;
    }

    if (!map.has(key)) {
      map.set(key, new Set());
    }

    map.get(key)!.add(value);
  }

  return map;
}

function scoreAttributeOverlap(
  target: RelatedProductProfile,
  candidate: RelatedProductProfile,
) {
  const targetAttributes = buildAttributeMap(target);
  const candidateAttributes = buildAttributeMap(candidate);
  let score = 0;
  let keyOnlyMatches = 0;
  const reasons: string[] = [];

  for (const [key, targetValues] of targetAttributes) {
    const candidateValues = candidateAttributes.get(key);
    if (!candidateValues) {
      continue;
    }

    const sharedValueCount = intersectionCount(targetValues, candidateValues);
    if (sharedValueCount > 0) {
      const weight = ATTRIBUTE_WEIGHTS[key] ?? 6;
      score += Math.min(weight * sharedValueCount, weight + 4);
      reasons.push(`attribute:${key}`);
      continue;
    }

    keyOnlyMatches += 1;
  }

  score += Math.min(6, keyOnlyMatches);

  return {
    score: Math.min(38, score),
    reasons,
  };
}

function longestCommonPrefixLength(left: string, right: string) {
  const max = Math.min(left.length, right.length);
  let index = 0;

  while (index < max && left[index] === right[index]) {
    index += 1;
  }

  return index;
}

function scoreSkuShape(target: RelatedProductProfile, candidate: RelatedProductProfile) {
  let score = 0;

  for (const targetSku of target.skus.map(normalizeText)) {
    for (const candidateSku of candidate.skus.map(normalizeText)) {
      if (!targetSku || !candidateSku || targetSku === candidateSku) {
        continue;
      }

      const prefixLength = longestCommonPrefixLength(targetSku, candidateSku);
      if (prefixLength >= 6) {
        score = Math.max(score, 5);
      } else if (prefixLength >= 4) {
        score = Math.max(score, 3);
      }
    }
  }

  return score;
}

function scoreCandidate(
  target: RelatedProductProfile,
  candidate: RelatedProductProfile,
) {
  const reasons: string[] = [];
  let score = 0;

  const targetBrands = normalizedSet(target.brandNames);
  const candidateBrands = normalizedSet(candidate.brandNames);
  if (intersectionCount(targetBrands, candidateBrands) > 0) {
    score += 18;
    reasons.push("brand");
  }

  const sharedSubcategories = intersectionCount(
    normalizedSet(target.subcategorySlugs),
    normalizedSet(candidate.subcategorySlugs),
  );
  if (sharedSubcategories > 0) {
    score += Math.min(32, 24 + (sharedSubcategories - 1) * 4);
    reasons.push("subcategory");
  }

  const sharedCategories = intersectionCount(
    normalizedSet(target.categorySlugs),
    normalizedSet(candidate.categorySlugs),
  );
  if (sharedCategories > 0) {
    score += 8;
    reasons.push("category");
  }

  const sharedProductTypes = intersectionCount(
    normalizedSet(target.productTypeSlugs),
    normalizedSet(candidate.productTypeSlugs),
  );
  if (sharedProductTypes > 0) {
    score += 14;
    reasons.push("product-type");
  }

  const attributeScore = scoreAttributeOverlap(target, candidate);
  score += attributeScore.score;
  reasons.push(...attributeScore.reasons);

  const nameScore = weightedDice(
    buildWeightedTokenBag({
      ...target,
      tags: [],
      descriptions: [],
      attributes: [],
    }),
    buildWeightedTokenBag({
      ...candidate,
      tags: [],
      descriptions: [],
      attributes: [],
    }),
  );
  if (nameScore > 0) {
    score += nameScore * 24;
    reasons.push("name");
  }

  const tagScore = weightedDice(
    buildWeightedTokenBag({
      ...target,
      names: [],
      descriptions: [],
      attributes: [],
    }),
    buildWeightedTokenBag({
      ...candidate,
      names: [],
      descriptions: [],
      attributes: [],
    }),
  );
  if (tagScore > 0) {
    score += tagScore * 10;
    reasons.push("tags");
  }

  const descriptionScore = weightedDice(
    buildWeightedTokenBag({
      ...target,
      names: [],
      tags: [],
      attributes: [],
    }),
    buildWeightedTokenBag({
      ...candidate,
      names: [],
      tags: [],
      attributes: [],
    }),
  );
  if (descriptionScore > 0) {
    score += descriptionScore * 6;
    reasons.push("description");
  }

  const skuScore = scoreSkuShape(target, candidate);
  if (skuScore > 0) {
    score += skuScore;
    reasons.push("sku");
  }

  return {
    score: Math.min(100, Math.round(score)),
    reasons: unique(reasons),
  };
}

function hasSameEntity(target: RelatedProductProfile, candidate: RelatedProductProfile) {
  if (target.key === candidate.key) {
    return true;
  }

  const targetProductIds = new Set(target.productIds);
  if (candidate.productIds.some((productId) => targetProductIds.has(productId))) {
    return true;
  }

  const targetFamilyIds = new Set(target.familyIds);
  return candidate.familyIds.some((familyId) => targetFamilyIds.has(familyId));
}

export function sanitizeRelatedProfile(profile: RelatedProductProfile): RelatedProductProfile {
  return {
    ...profile,
    names: unique(compact(profile.names)),
    skus: unique(compact(profile.skus)),
    brandNames: unique(compact(profile.brandNames)),
    productTypeSlugs: unique(compact(profile.productTypeSlugs)),
    productTypeNames: unique(compact(profile.productTypeNames)),
    categorySlugs: unique(compact(profile.categorySlugs)),
    categoryNames: unique(compact(profile.categoryNames)),
    subcategorySlugs: unique(compact(profile.subcategorySlugs)),
    subcategoryNames: unique(compact(profile.subcategoryNames)),
    tags: unique(compact(profile.tags.flatMap((value) => value.split(/\s+/)))),
    descriptions: unique(compact(profile.descriptions)),
    attributes: profile.attributes
      .map((attribute) => ({
        ...attribute,
        key: normalizeKey(attribute.key || attribute.name),
        name: attribute.name.trim(),
        value: attribute.value.trim(),
      }))
      .filter((attribute) => attribute.key && attribute.name && attribute.value),
  };
}

export function rankRelatedProductProfiles<T extends { profile: RelatedProductProfile }>(
  targetProfile: RelatedProductProfile,
  candidates: T[],
  options: RelatedProductScoringOptions = {},
): Array<RelatedProductMatch<T>> {
  const threshold = options.threshold ?? RELATED_PRODUCTS_DEFAULT_THRESHOLD;
  const limit = options.limit ?? RELATED_PRODUCTS_DEFAULT_LIMIT;
  const target = sanitizeRelatedProfile(targetProfile);
  const bestByKey = new Map<string, RelatedProductMatch<T>>();

  for (const candidateItem of candidates) {
    const candidate = sanitizeRelatedProfile(candidateItem.profile);

    if (hasSameEntity(target, candidate)) {
      continue;
    }

    const scored = scoreCandidate(target, candidate);
    if (scored.score < threshold) {
      continue;
    }

    const current = bestByKey.get(candidate.key);
    if (!current || scored.score > current.score) {
      bestByKey.set(candidate.key, {
        item: candidateItem,
        score: scored.score,
        reasons: scored.reasons,
      });
    }
  }

  return [...bestByKey.values()]
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.item.profile.slug.localeCompare(right.item.profile.slug, "fr-FR");
    })
    .slice(0, limit);
}
