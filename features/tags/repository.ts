import { prisma } from "@/lib/server/db/prisma";
import { slugify } from "@/lib/slugify";
import { normalizeOwnedTagNames } from "./owned";
import type {
  TagCreateInput,
  TagListQuery,
  TagSuggestionQuery,
  TagUpdateInput,
} from "./types";

export type TagRecord = {
  id: number;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
};

async function collectDerivedTags(): Promise<TagRecord[]> {
  const [articleTags, productTags] = await Promise.all([
    prisma.article.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        tags: true,
        updatedAt: true,
      },
    }),
    prisma.product.findMany({
      select: {
        tags: true,
        updatedAt: true,
      },
    }),
  ]);

  const tagMap = new Map<
    string,
    {
      name: string;
      slug: string;
      updatedAt: Date;
    }
  >();

  for (const source of [...articleTags, ...productTags]) {
    for (const tagName of normalizeOwnedTagNames(source.tags.split(/\s+/))) {
      const slug = slugify(tagName);
      const existing = tagMap.get(slug);

      if (!existing || source.updatedAt > existing.updatedAt) {
        tagMap.set(slug, {
          name: tagName,
          slug,
          updatedAt: source.updatedAt,
        });
      }
    }
  }

  return [...tagMap.values()]
    .sort((left, right) => left.name.localeCompare(right.name, "fr-FR"))
    .map((tag, index) => ({
      id: index + 1,
      name: tag.name,
      slug: tag.slug,
      createdAt: tag.updatedAt,
      updatedAt: tag.updatedAt,
    }));
}

function filterTags(records: TagRecord[], query: TagListQuery | TagSuggestionQuery) {
  const search = query.q?.trim().toLocaleLowerCase("fr-FR");

  if (!search) {
    return records;
  }

  return records.filter(
    (tag) =>
      tag.name.toLocaleLowerCase("fr-FR").includes(search) ||
      tag.slug.toLocaleLowerCase("fr-FR").includes(search),
  );
}

export async function listTags(query: TagListQuery) {
  const tags = filterTags(await collectDerivedTags(), query);
  return tags.slice((query.page - 1) * query.pageSize, query.page * query.pageSize);
}

export async function countTags(query: TagListQuery) {
  return filterTags(await collectDerivedTags(), query).length;
}

export async function findTagById(tagId: number) {
  return (await collectDerivedTags()).find((tag) => tag.id === tagId) ?? null;
}

export async function findTagBySlug(slug: string) {
  return (await collectDerivedTags()).find((tag) => tag.slug === slug) ?? null;
}

export async function findTagByName(name: string) {
  return (
    (await collectDerivedTags()).find(
      (tag) => tag.name.toLocaleLowerCase("fr-FR") === name.toLocaleLowerCase("fr-FR"),
    ) ?? null
  );
}

export async function createTag(_input: TagCreateInput) {
  throw new Error("DIRECT_TAG_MANAGEMENT_DISABLED");
}

export async function updateTag(_tagId: number, _input: TagUpdateInput) {
  throw new Error("DIRECT_TAG_MANAGEMENT_DISABLED");
}

export async function deleteTag(_tagId: number) {
  throw new Error("DIRECT_TAG_MANAGEMENT_DISABLED");
}

export async function listTagSuggestions(query: TagSuggestionQuery) {
  const tags = filterTags(await collectDerivedTags(), query);
  return tags.slice(0, query.limit);
}

export async function resolveOrCreateTagsByNames(tagNames: readonly string[]) {
  return normalizeOwnedTagNames(tagNames).map((name, index) => ({
    id: index + 1,
    name,
    slug: slugify(name),
  }));
}

