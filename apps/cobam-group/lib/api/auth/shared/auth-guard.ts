import { STAFF_PORTAL } from "@/features/auth/types";
import {
  AuthError,
  requireStaffSession,
} from "@/features/auth/server/session";
import {
  requireAdminSession,
  requireContentEditorSession,
  requireRootSession,
} from "@/features/auth/server/guards";

export type AuthenticatedUser = {
  userId: string;
  email: string;
  powerType: "ROOT" | "ADMIN" | "STAFF";
  portal: typeof STAFF_PORTAL;
};

function toAuthenticatedUser(session: {
  id: string;
  email: string;
  powerType: "ROOT" | "ADMIN" | "STAFF";
  portal: typeof STAFF_PORTAL;
}): AuthenticatedUser {
  return {
    userId: session.id,
    email: session.email,
    powerType: session.powerType,
    portal: session.portal,
  };
}

export { AuthError };

export async function requireAuth(req: Request): Promise<AuthenticatedUser> {
  const session = await requireStaffSession(req);
  return toAuthenticatedUser(session);
}

export async function requireRoot(req: Request): Promise<AuthenticatedUser> {
  const session = await requireRootSession(req);
  return toAuthenticatedUser(session);
}

export async function requireAdmin(req: Request): Promise<AuthenticatedUser> {
  const session = await requireAdminSession(req);
  return toAuthenticatedUser(session);
}

export async function requireEditor(req: Request): Promise<AuthenticatedUser> {
  const session = await requireContentEditorSession(req);
  return toAuthenticatedUser(session);
}

export function checkPortalStaff(portal: string) {
  return portal === STAFF_PORTAL;
}
