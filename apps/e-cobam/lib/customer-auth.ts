import "server-only";

import crypto from "crypto";
import { cookies } from "next/headers";
import type { CustomerType, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

export const CUSTOMER_SESSION_COOKIE = "e-cobam-customer-session";
const CUSTOMER_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

type CustomerSessionRecord = {
  id: string;
  email: string;
  status: UserStatus;
  customerProfile: {
    id: bigint;
    type: CustomerType;
    firstName: string | null;
    lastName: string | null;
    companyName: string | null;
    phone: string | null;
  } | null;
};

export type CustomerSession = {
  userId: string;
  customerId: string;
  email: string;
  status: UserStatus;
  type: CustomerType;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  phone: string | null;
};

async function getPrisma() {
  const { prisma } = await import("@cobam/db");
  return prisma;
}

function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function newSessionSecret() {
  return crypto.randomBytes(32).toString("base64url");
}

function encodeSessionCookie(tokenId: string, secret: string) {
  return `${tokenId}.${secret}`;
}

function parseSessionCookie(value: string | undefined) {
  if (!value) {
    return null;
  }

  const [tokenId, secret, ...rest] = value.split(".");
  if (!tokenId || !secret || rest.length > 0) {
    return null;
  }

  return { tokenId, secret };
}

function toCustomerSession(user: CustomerSessionRecord): CustomerSession | null {
  if (user.status !== "ACTIVE" || !user.customerProfile) {
    return null;
  }

  return {
    userId: user.id,
    customerId: user.customerProfile.id.toString(),
    email: user.email,
    status: user.status,
    type: user.customerProfile.type,
    firstName: user.customerProfile.firstName,
    lastName: user.customerProfile.lastName,
    companyName: user.customerProfile.companyName,
    phone: user.customerProfile.phone,
  };
}

export async function hashCustomerPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyCustomerPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export async function createCustomerSession(userId: string) {
  const db = await getPrisma();
  const tokenId = crypto.randomUUID();
  const secret = newSessionSecret();

  await db.$transaction([
    db.refreshToken.create({
      data: {
        id: tokenId,
        userId,
        tokenHash: sha256(secret),
        expiresAt: new Date(Date.now() + CUSTOMER_SESSION_MAX_AGE_SECONDS * 1000),
      },
    }),
    db.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    }),
  ]);

  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_SESSION_COOKIE, encodeSessionCookie(tokenId, secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CUSTOMER_SESSION_MAX_AGE_SECONDS,
  });
}

export async function getCustomerSession(): Promise<CustomerSession | null> {
  const cookieStore = await cookies();
  const parsed = parseSessionCookie(cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value);

  if (!parsed) {
    return null;
  }

  const db = await getPrisma();
  const token = await db.refreshToken.findUnique({
    where: { id: parsed.tokenId },
    select: {
      tokenHash: true,
      expiresAt: true,
      revokedAt: true,
      user: {
        select: {
          id: true,
          email: true,
          portal: true,
          status: true,
          customerProfile: {
            select: {
              id: true,
              type: true,
              firstName: true,
              lastName: true,
              companyName: true,
              phone: true,
            },
          },
        },
      },
    },
  });

  if (
    !token ||
    token.revokedAt ||
    token.expiresAt < new Date() ||
    token.tokenHash !== sha256(parsed.secret) ||
    token.user.portal !== "CUSTOMER"
  ) {
    return null;
  }

  return toCustomerSession(token.user);
}

export async function destroyCustomerSession() {
  const cookieStore = await cookies();
  const parsed = parseSessionCookie(cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value);

  cookieStore.set(CUSTOMER_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  if (!parsed) {
    return;
  }

  const db = await getPrisma();
  await db.refreshToken.updateMany({
    where: {
      id: parsed.tokenId,
      tokenHash: sha256(parsed.secret),
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  });
}
