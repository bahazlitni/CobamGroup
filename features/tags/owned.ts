import { slugifyTagName } from "./slug";

function splitOwnedTagCandidate(value: string | null | undefined) {
  return (value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeOwnedTagNames(tagNames: readonly string[]) {
  const seenSlugs = new Set<string>();

  return tagNames
    .flatMap((tagName) => splitOwnedTagCandidate(tagName))
    .filter((name) => {
      const slug = slugifyTagName(name);

      if (!slug || seenSlugs.has(slug)) {
        return false;
      }

      seenSlugs.add(slug);
      return true;
    });
}

export function serializeOwnedTagNames(tagNames: readonly string[]) {
  return normalizeOwnedTagNames(tagNames).join(" ");
}

export function parseOwnedTagString(value: string | null | undefined) {
  return normalizeOwnedTagNames(splitOwnedTagCandidate(value));
}

export function countOwnedTags(value: string | null | undefined) {
  return parseOwnedTagString(value).length;
}
