import { isPowerType } from "@/features/rbac/roles";
import { PRESET_BAN_REASON_OPTIONS, type BanReasonId } from "./ban-details";
import type {
  CreateStaffUserInput,
  StaffUsersListQuery,
  UpdateStaffUserAccessInput,
  UpdateStaffUserBanInput,
  UpdateStaffUserCredentialsInput,
  UpdateStaffUserProfileInput,
} from "./types";

export class UserValidationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseOptionalNullableString(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (typeof value !== "string") {
    throw new UserValidationError("Invalid string field");
  }
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function parseOptionalNullableInteger(
  value: unknown,
  fieldName: string,
): number | null {
  if (value == null || value === "") return null;

  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new UserValidationError(`Invalid ${fieldName}`);
  }

  return parsed;
}

function parseBanReasonIds(value: unknown): BanReasonId[] {
  if (!Array.isArray(value)) return [];

  const allowedIds = new Set<BanReasonId>(
    PRESET_BAN_REASON_OPTIONS.map((option) => option.id),
  );

  return value.filter(
    (item): item is BanReasonId =>
      typeof item === "string" && allowedIds.has(item as BanReasonId),
  );
}

function parseRoleIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseUserIdParam(idParam: string): string {
  const id = String(idParam ?? "").trim();
  if (!id) {
    throw new UserValidationError("Invalid user id");
  }
  return id;
}

export function parseUsersListQuery(
  searchParams: URLSearchParams,
): StaffUsersListQuery {
  const pageRaw = Number(searchParams.get("page") ?? "1");
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const pageSizeRaw = Number(searchParams.get("pageSize") ?? "20");
  const pageSize = [10, 20, 50].includes(pageSizeRaw)
    ? (pageSizeRaw as 10 | 20 | 50)
    : 20;

  const qRaw = searchParams.get("q");
  const q = qRaw?.trim() ? qRaw.trim() : undefined;

  const roleKeyRaw = searchParams.get("roleKey") ?? searchParams.get("role");
  const roleKey = roleKeyRaw?.trim() ? roleKeyRaw.trim() : undefined;

  const powerTypeRaw = searchParams.get("powerType");
  if (powerTypeRaw && !isPowerType(powerTypeRaw)) {
    throw new UserValidationError("Invalid power type");
  }

  return {
    page,
    pageSize,
    q,
    roleKey,
    powerType: powerTypeRaw
      ? (powerTypeRaw as StaffUsersListQuery["powerType"])
      : undefined,
  };
}

export function parseUpdateStaffUserProfileInput(
  raw: unknown,
): UpdateStaffUserProfileInput {
  if (!isRecord(raw)) {
    throw new UserValidationError("Invalid request body");
  }

  return {
    firstName: parseOptionalNullableString(raw.firstName),
    lastName: parseOptionalNullableString(raw.lastName),
    jobTitle: parseOptionalNullableString(raw.jobTitle),
    phone: parseOptionalNullableString(raw.phone),
    birthDate: parseOptionalNullableString(raw.birthDate),
    avatarMediaId: parseOptionalNullableInteger(raw.avatarMediaId, "avatarMediaId"),
    bio: parseOptionalNullableString(raw.bio),
  };
}

export function parseUpdateStaffUserAccessInput(
  raw: unknown,
): UpdateStaffUserAccessInput {
  if (!isRecord(raw)) {
    throw new UserValidationError("Invalid request body");
  }

  const powerType = raw.powerType;
  if (!isPowerType(powerType)) {
    throw new UserValidationError("Invalid power type");
  }

  return {
    powerType,
    roleIds: parseRoleIds(raw.roleIds),
  };
}

export function parseUpdateStaffUserCredentialsInput(
  raw: unknown,
): UpdateStaffUserCredentialsInput {
  if (!isRecord(raw)) {
    throw new UserValidationError("Invalid request body");
  }

  const emailRaw = raw.email;
  const passwordRaw = raw.password;

  const email =
    typeof emailRaw === "string" && emailRaw.trim()
      ? emailRaw.trim().toLowerCase()
      : undefined;

  const password =
    typeof passwordRaw === "string" && passwordRaw.trim()
      ? passwordRaw.trim()
      : undefined;

  if (!email && !password) {
    throw new UserValidationError("No credentials to update");
  }

  if (password && password.length < 8) {
    throw new UserValidationError("Password must be at least 8 characters");
  }

  return { email, password };
}

export function parseUpdateStaffUserBanInput(
  raw: unknown,
): UpdateStaffUserBanInput {
  if (!isRecord(raw)) {
    throw new UserValidationError("Invalid request body");
  }

  if (typeof raw.banned !== "boolean") {
    throw new UserValidationError("Invalid banned flag");
  }

  return {
    banned: raw.banned,
    presetReasonIds: parseBanReasonIds(raw.presetReasonIds),
    otherReason: parseOptionalNullableString(raw.otherReason),
    description: parseOptionalNullableString(raw.description),
  };
}

export function parseCreateStaffUserInput(raw: unknown): CreateStaffUserInput {
  if (!isRecord(raw)) {
    throw new UserValidationError("Invalid request body");
  }

  const email =
    typeof raw.email === "string" && raw.email.trim()
      ? raw.email.trim().toLowerCase()
      : null;
  if (!email) {
    throw new UserValidationError("Email is required");
  }

  const password =
    typeof raw.password === "string" && raw.password.trim()
      ? raw.password.trim()
      : null;
  if (!password || password.length < 8) {
    throw new UserValidationError("Password must be at least 8 characters");
  }

  const powerType = raw.powerType;
  if (powerType != null && !isPowerType(powerType)) {
    throw new UserValidationError("Invalid power type");
  }

  const profileRaw = isRecord(raw.profile) ? raw.profile : raw;

  return {
    email,
    password,
    powerType: powerType ?? "STAFF",
    roleIds: parseRoleIds(raw.roleIds),
    profile: {
      firstName: parseOptionalNullableString(profileRaw.firstName),
      lastName: parseOptionalNullableString(profileRaw.lastName),
      jobTitle: parseOptionalNullableString(profileRaw.jobTitle),
      phone: parseOptionalNullableString(profileRaw.phone),
      birthDate: parseOptionalNullableString(profileRaw.birthDate),
      avatarMediaId: parseOptionalNullableInteger(
        profileRaw.avatarMediaId,
        "avatarMediaId",
      ),
      bio: parseOptionalNullableString(profileRaw.bio),
    },
  };
}
