// /lib/auth/staff/api-fetch.ts
import { apiFetchBase } from "@/lib/api/auth/shared/api-fetch";

export function staffApiFetch(
  input: string,
  options: RequestInit & { auth?: boolean } = {}
) {
  return apiFetchBase(input, {
    ...options,
    refreshPath: "/api/auth/staff/refresh",
    accessTokenStorageKey: "staff_access_token",
    authUserStorageKey: "staff_auth_user",
  });
}