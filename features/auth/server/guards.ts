import type { StaffSession } from "@/features/auth/types";
import { hasAnyPermission } from "@/features/rbac/access";
import { PERMISSIONS } from "@/features/rbac/permissions";
import { AuthError, requireStaffSession } from "./session";

function assertNotBanned(session: StaffSession) {
  if (session.status === "BANNED") {
    throw new AuthError("Forbidden", 403);
  }
}

export async function requireRootSession(req: Request) {
  const session = await requireStaffSession(req);
  assertNotBanned(session);

  if (session.powerType !== "ROOT") {
    throw new AuthError("Forbidden", 403);
  }

  return session;
}

export async function requireAdminSession(req: Request) {
  const session = await requireStaffSession(req);
  assertNotBanned(session);

  if (session.powerType !== "ROOT" && session.powerType !== "ADMIN") {
    throw new AuthError("Forbidden", 403);
  }

  return session;
}

export async function requireContentEditorSession(req: Request) {
  const session = await requireStaffSession(req);
  assertNotBanned(session);

  if (
    !hasAnyPermission(session, [
      PERMISSIONS.ARTICLES_VIEW_ALL,
      PERMISSIONS.ARTICLES_VIEW_OWN,
      PERMISSIONS.ARTICLES_CREATE,
      PERMISSIONS.BRANDS_VIEW_ALL,
      PERMISSIONS.BRANDS_VIEW_OWN,
      PERMISSIONS.BRANDS_CREATE,
      PERMISSIONS.PRODUCT_CATEGORIES_VIEW_ALL,
      PERMISSIONS.PRODUCT_CATEGORIES_VIEW_OWN,
      PERMISSIONS.PRODUCT_CATEGORIES_CREATE,
      PERMISSIONS.PRODUCTS_VIEW_ALL,
      PERMISSIONS.PRODUCTS_VIEW_OWN,
      PERMISSIONS.PRODUCTS_CREATE,
      PERMISSIONS.TAGS_VIEW_ALL,
      PERMISSIONS.TAGS_VIEW_OWN,
      PERMISSIONS.TAGS_CREATE,
      PERMISSIONS.MEDIA_VIEW_ALL,
      PERMISSIONS.MEDIA_VIEW_OWN,
      PERMISSIONS.MEDIA_CREATE,
    ])
  ) {
    throw new AuthError("Forbidden", 403);
  }

  return session;
}

export async function requireArticleEditorSession(req: Request) {
  const session = await requireStaffSession(req);
  assertNotBanned(session);

  if (
    !hasAnyPermission(session, [
      PERMISSIONS.ARTICLES_VIEW_ALL,
      PERMISSIONS.ARTICLES_VIEW_OWN,
      PERMISSIONS.ARTICLES_CREATE,
      PERMISSIONS.ARTICLES_UPDATE_ALL,
      PERMISSIONS.ARTICLES_UPDATE_BELOW_ROLE,
      PERMISSIONS.ARTICLES_UPDATE_OWN,
      PERMISSIONS.ARTICLES_PUBLISH_ALL,
      PERMISSIONS.ARTICLES_PUBLISH_BELOW_ROLE,
      PERMISSIONS.ARTICLES_PUBLISH_OWN,
      PERMISSIONS.ARTICLES_UNPUBLISH_ALL,
      PERMISSIONS.ARTICLES_UNPUBLISH_BELOW_ROLE,
      PERMISSIONS.ARTICLES_UNPUBLISH_OWN,
      PERMISSIONS.ARTICLES_AUTHORS_UPDATE_ALL,
      PERMISSIONS.ARTICLES_AUTHORS_UPDATE_BELOW_ROLE,
      PERMISSIONS.ARTICLES_AUTHORS_UPDATE_OWN,
      PERMISSIONS.ARTICLES_DELETE_ALL,
      PERMISSIONS.ARTICLES_DELETE_BELOW_ROLE,
      PERMISSIONS.ARTICLES_DELETE_OWN,
    ])
  ) {
    throw new AuthError("Forbidden", 403);
  }

  return session;
}

export async function requireProductEditorSession(req: Request) {
  const session = await requireStaffSession(req);
  assertNotBanned(session);

  if (
    !hasAnyPermission(session, [
      PERMISSIONS.BRANDS_VIEW_ALL,
      PERMISSIONS.BRANDS_VIEW_OWN,
      PERMISSIONS.PRODUCT_CATEGORIES_VIEW_ALL,
      PERMISSIONS.PRODUCT_CATEGORIES_VIEW_OWN,
      PERMISSIONS.PRODUCTS_VIEW_ALL,
      PERMISSIONS.PRODUCTS_VIEW_OWN,
      PERMISSIONS.PRODUCTS_CREATE,
    ])
  ) {
    throw new AuthError("Forbidden", 403);
  }

  return session;
}

export function hasAdminPower(session: StaffSession): boolean {
  return (
    session.status !== "BANNED" &&
    (session.powerType === "ROOT" || session.powerType === "ADMIN")
  );
}
