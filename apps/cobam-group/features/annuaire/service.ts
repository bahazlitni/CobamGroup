import type { StaffSession } from "@/features/auth/types";
import { canAccessAnnuaire, canManageAnnuaire } from "./access";
import {
  createAnnuairePerson,
  deleteAnnuairePerson,
  listAnnuairePeople,
  listPublicAnnuairePeople,
  updateAnnuairePerson,
} from "./repository";
import type {
  AnnuaireListQuery,
  AnnuaireListResult,
  AnnuairePersonDto,
  AnnuairePersonInput,
} from "./types";

export class AnnuaireServiceError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

type AnnuaireRecord = Awaited<ReturnType<typeof listPublicAnnuairePeople>>[number];

export function mapAnnuairePerson(record: AnnuaireRecord): AnnuairePersonDto {
  return {
    id: Number(record.id),
    lastName: record.lastName,
    firstName: record.firstName,
    jobTitle: record.jobTitle,
    email: record.email,
    site: record.site,
    extension: record.extension,
    whatsapp: record.whatsapp,
    sortOrder: record.sortOrder,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export async function listAnnuairePeopleService(
  session: StaffSession,
  query: AnnuaireListQuery,
): Promise<AnnuaireListResult> {
  if (!canAccessAnnuaire(session)) {
    throw new AnnuaireServiceError("Forbidden", 403);
  }

  const result = await listAnnuairePeople(query);

  return {
    items: result.items.map(mapAnnuairePerson),
    total: result.total,
    page: query.page,
    pageSize: query.pageSize,
  };
}

export async function createAnnuairePersonService(
  session: StaffSession,
  input: AnnuairePersonInput,
): Promise<AnnuairePersonDto> {
  if (!canManageAnnuaire(session)) {
    throw new AnnuaireServiceError("Forbidden", 403);
  }

  const person = await createAnnuairePerson(input);
  return mapAnnuairePerson(person);
}

export async function updateAnnuairePersonService(
  session: StaffSession,
  personId: number,
  input: AnnuairePersonInput,
): Promise<AnnuairePersonDto> {
  if (!canManageAnnuaire(session)) {
    throw new AnnuaireServiceError("Forbidden", 403);
  }

  try {
    const person = await updateAnnuairePerson(personId, input);
    return mapAnnuairePerson(person);
  } catch {
    throw new AnnuaireServiceError("Contact annuaire introuvable.", 404);
  }
}

export async function deleteAnnuairePersonService(
  session: StaffSession,
  personId: number,
): Promise<void> {
  if (!canManageAnnuaire(session)) {
    throw new AnnuaireServiceError("Forbidden", 403);
  }

  try {
    await deleteAnnuairePerson(personId);
  } catch {
    throw new AnnuaireServiceError("Contact annuaire introuvable.", 404);
  }
}

export async function listPublicAnnuairePeopleService() {
  const people = await listPublicAnnuairePeople();
  return people.map(mapAnnuairePerson);
}
