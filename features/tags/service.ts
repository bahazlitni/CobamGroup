import type { StaffSession } from "@/features/auth/types";
import { canAccessTags, canCreateTags, canManageTags } from "./access";
import { mapTagToDetailDto, mapTagToListItemDto } from "./mappers";
import {
  countTags,
  findTagById,
  listTags,
  listTagSuggestions,
} from "./repository";
import type {
  TagCreateInput,
  TagListQuery,
  TagListResult,
  TagSuggestionResult,
  TagUpdateInput,
} from "./types";

export class TagServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function listTagsService(
  session: StaffSession,
  query: TagListQuery,
): Promise<TagListResult> {
  if (!canAccessTags(session)) {
    throw new TagServiceError("Acces refuse.", 403);
  }

  const [items, total] = await Promise.all([listTags(query), countTags(query)]);

  return {
    items: items.map(mapTagToListItemDto),
    total,
    page: query.page,
    pageSize: query.pageSize,
  };
}

export async function getTagByIdService(session: StaffSession, tagId: number) {
  if (!canAccessTags(session)) {
    throw new TagServiceError("Acces refuse.", 403);
  }

  const tag = await findTagById(tagId);
  if (!tag) {
    throw new TagServiceError("Tag introuvable.", 404);
  }

  return mapTagToDetailDto(tag);
}

export async function listTagSuggestionsService(
  session: StaffSession,
  query: { q?: string; limit: number },
): Promise<TagSuggestionResult> {
  if (session.status === "BANNED") {
    throw new TagServiceError("Acces refuse.", 403);
  }

  const items = await listTagSuggestions(query);

  return {
    items: items.map((item) => ({
      id: Number(item.id),
      name: item.name,
      slug: item.slug,
    })),
  };
}

function throwDerivedTagMutationError() {
  throw new TagServiceError(
    "Les tags sont derives du contenu et ne peuvent plus etre geres directement.",
    400,
  );
}

export async function createTagService(
  session: StaffSession,
  input: TagCreateInput,
) {
  if (!canCreateTags(session)) {
    throw new TagServiceError("Acces refuse.", 403);
  }

  void input;
  return throwDerivedTagMutationError();
}

export async function updateTagService(
  session: StaffSession,
  tagId: number,
  input: TagUpdateInput,
) {
  if (!canManageTags(session)) {
    throw new TagServiceError("Acces refuse.", 403);
  }

  void tagId;
  void input;
  return throwDerivedTagMutationError();
}

export async function deleteTagService(session: StaffSession, tagId: number) {
  if (!canManageTags(session)) {
    throw new TagServiceError("Acces refuse.", 403);
  }

  void tagId;
  return throwDerivedTagMutationError();
}
