import type { TagDetailDto, TagListItemDto } from "./types";
import type { TagRecord } from "./repository";

export function mapTagToListItemDto(tag: TagRecord): TagListItemDto {
  return {
    id: Number(tag.id),
    name: tag.name,
    slug: tag.slug,
    articleCount: 0,
    productFamilyCount: 0,
    createdAt: tag.createdAt.toISOString(),
    updatedAt: tag.updatedAt.toISOString(),
  };
}

export function mapTagToDetailDto(tag: TagRecord): TagDetailDto {
  return mapTagToListItemDto(tag);
}

