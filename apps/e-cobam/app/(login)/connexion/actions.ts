"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createCustomerSession, hashCustomerPassword, verifyCustomerPassword } from "@/lib/customer-auth";
import { linkGuestOrdersToCustomer } from "@/lib/customer-account";
import {
  generateChallengeSecret,
  generateOtpCode,
  generatePasswordResetToken,
  sha256,
} from "@/lib/customer-security";
import { sendCustomerOtpEmail, sendCustomerPasswordResetEmail } from "@/lib/customer-email";

const CUSTOMER_LOGIN_OTP_COOKIE = "e-cobam-login-otp";
const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000;
const RESET_REQUEST_COOLDOWN_MS = 60_000;
const LOGIN_OTP_TTL_MS = 10 * 60 * 1000;

async function getPrisma() {
  const { prisma } = await import("@cobam/db");
  return prisma;
}

function cleanText(value: FormDataEntryValue | null, maxLength: number) {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned ? cleaned.slice(0, maxLength) : null;
}

function cleanEmail(value: FormDataEntryValue | null) {
  return cleanText(value, 255)?.toLowerCase() ?? null;
}

function safeNext(value: FormDataEntryValue | string | null) {
  const next = typeof value === "string" ? value : "/compte/profil";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/compte/profil";
}

function authRedirect(
  mode: "login" | "register" | "forgot" | "otp",
  reason: string,
  next: string,
  extra?: Record<string, string>,
): never {
  const params = new URLSearchParams({ mode, error: reason });
  if (next !== "/compte/profil") {
    params.set("next", next);
  }
  for (const [key, value] of Object.entries(extra ?? {})) {
    if (value) {
      params.set(key, value);
    }
  }

  redirect(`/connexion?${params.toString()}`);
}

function otpRedirect(email: string, next: string): never {
  const params = new URLSearchParams({ mode: "otp", email });
  if (next !== "/compte/profil") {
    params.set("next", next);
  }
  redirect(`/connexion?${params.toString()}`);
}

function successRedirect(mode: string, next: string): never {
  const params = new URLSearchParams({ mode });
  if (next !== "/compte/profil") {
    params.set("next", next);
  }
  redirect(`/connexion?${params.toString()}`);
}

function resetRedirect(reason: string): never {
  redirect(`/connexion/reinitialiser-mot-de-passe?error=${encodeURIComponent(reason)}`);
}

async function setOtpCookie(challengeId: string, secret: string) {
  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_LOGIN_OTP_COOKIE, `${challengeId}.${secret}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: LOGIN_OTP_TTL_MS / 1000,
  });
}

async function clearOtpCookie() {
  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_LOGIN_OTP_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

function parseOtpCookie(value: string | undefined) {
  const [challengeId, secret, ...rest] = String(value ?? "").split(".");
  if (!challengeId || !secret || rest.length > 0) {
    return null;
  }
  return { challengeId, secret };
}

export async function loginCustomerAction(formData: FormData) {
  const email = cleanEmail(formData.get("email"));
  const password = typeof formData.get("password") === "string" ? String(formData.get("password")) : "";
  const next = safeNext(formData.get("next"));

  if (!email || !password) {
    authRedirect("login", "missing", next);
  }

  const db = await getPrisma();
  const user = await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      portal: true,
      status: true,
      twoStepVerificationEnabled: true,
      customerProfile: {
        select: {
          id: true,
          phone: true,
        },
      },
    },
  });

  if (!user || user.portal !== "CUSTOMER" || user.status !== "ACTIVE") {
    authRedirect("login", "invalid", next);
  }

  const validPassword = await verifyCustomerPassword(password, user.passwordHash);
  if (!validPassword || !user.customerProfile) {
    authRedirect("login", "invalid", next);
  }

  if (user.twoStepVerificationEnabled) {
    const code = generateOtpCode();
    const secret = generateChallengeSecret();

    const challenge = await db.$transaction(async (tx) => {
      const existing = await tx.oTPChallenge.findFirst({
        where: {
          userId: user.id,
          type: "LOGIN",
        },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });

      const data = {
        userId: user.id,
        codeHash: sha256(code),
        challengeTokenHash: sha256(secret),
        type: "LOGIN" as const,
        attempts: 0,
        consumedAt: null,
        expiresAt: new Date(Date.now() + LOGIN_OTP_TTL_MS),
        createdAt: new Date(),
      };

      if (existing) {
        return tx.oTPChallenge.update({
          where: { id: existing.id },
          data,
          select: { id: true },
        });
      }

      return tx.oTPChallenge.create({
        data,
        select: { id: true },
      });
    });

    try {
      await sendCustomerOtpEmail(user.email, code);
    } catch (error) {
      console.error("CUSTOMER_LOGIN_OTP_EMAIL_ERROR:", error);
      authRedirect("login", "email", next);
    }

    await setOtpCookie(challenge.id, secret);
    otpRedirect(user.email, next);
  }

  await linkGuestOrdersToCustomer(user.customerProfile.id, user.email, user.customerProfile.phone);
  await createCustomerSession(user.id);
  redirect(next);
}

export async function verifyCustomerOtpAction(formData: FormData) {
  const code = cleanText(formData.get("code"), 6);
  const email = cleanEmail(formData.get("email"));
  const next = safeNext(formData.get("next"));
  const cookieStore = await cookies();
  const parsed = parseOtpCookie(cookieStore.get(CUSTOMER_LOGIN_OTP_COOKIE)?.value);

  if (!parsed || !code || code.length !== 6) {
    authRedirect("otp", "otp-invalid", next, email ? { email } : undefined);
  }

  const db = await getPrisma();
  const challenge = await db.oTPChallenge.findUnique({
    where: { id: parsed.challengeId },
    select: {
      id: true,
      userId: true,
      codeHash: true,
      challengeTokenHash: true,
      attempts: true,
      expiresAt: true,
      consumedAt: true,
      user: {
        select: {
          id: true,
          email: true,
          portal: true,
          status: true,
          customerProfile: {
            select: { id: true, phone: true },
          },
        },
      },
    },
  });

  if (
    !challenge ||
    challenge.consumedAt ||
    !challenge.expiresAt ||
    challenge.expiresAt < new Date() ||
    challenge.challengeTokenHash !== sha256(parsed.secret) ||
    challenge.user.portal !== "CUSTOMER" ||
    challenge.user.status !== "ACTIVE" ||
    !challenge.user.customerProfile
  ) {
    await clearOtpCookie();
    authRedirect("login", "otp-expired", next);
  }

  if (challenge.attempts >= 5 || challenge.codeHash !== sha256(code)) {
    await db.oTPChallenge.update({
      where: { id: challenge.id },
    data: { attempts: { increment: 1 } },
    });
    authRedirect("otp", "otp-invalid", next, email ? { email } : undefined);
  }

  await db.oTPChallenge.update({
    where: { id: challenge.id },
    data: { consumedAt: new Date() },
  });
  await clearOtpCookie();
  await linkGuestOrdersToCustomer(
    challenge.user.customerProfile.id,
    challenge.user.email,
    challenge.user.customerProfile.phone,
  );
  await createCustomerSession(challenge.userId);
  redirect(next);
}

export async function registerCustomerAction(formData: FormData) {
  const firstName = cleanText(formData.get("firstName"), 100);
  const lastName = cleanText(formData.get("lastName"), 100);
  const companyName = cleanText(formData.get("companyName"), 255);
  const phone = cleanText(formData.get("phone"), 50);
  const email = cleanEmail(formData.get("email"));
  const password = typeof formData.get("password") === "string" ? String(formData.get("password")) : "";
  const next = safeNext(formData.get("next"));

  if (!firstName || !lastName || !email || !phone || password.length < 8) {
    authRedirect("register", "missing", next);
  }

  const db = await getPrisma();
  const existing = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    authRedirect("register", "exists", next);
  }

  const user = await db.user.create({
    data: {
      email,
      passwordHash: await hashCustomerPassword(password),
      portal: "CUSTOMER",
      powerType: "USER",
      twoStepVerificationEnabled: false,
      customerProfile: {
        create: {
          type: companyName ? "COMPANY" : "INDIVIDUAL",
          firstName,
          lastName,
          companyName,
          phone,
        },
      },
    },
    select: {
      id: true,
      email: true,
      customerProfile: {
        select: { id: true, phone: true },
      },
    },
  });

  if (user.customerProfile) {
    await linkGuestOrdersToCustomer(user.customerProfile.id, user.email, user.customerProfile.phone);
  }

  await createCustomerSession(user.id);
  redirect(next);
}

export async function requestCustomerPasswordResetAction(formData: FormData) {
  const email = cleanEmail(formData.get("email"));
  const next = safeNext(formData.get("next"));

  if (!email) {
    successRedirect("forgot-sent", next);
  }

  const db = await getPrisma();
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, email: true, portal: true },
  });

  if (user?.portal === "CUSTOMER") {
    const now = new Date();
    const recentToken = await db.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        consumedAt: null,
        createdAt: { gt: new Date(now.getTime() - RESET_REQUEST_COOLDOWN_MS) },
      },
      select: { id: true },
    });

    if (!recentToken) {
      const token = generatePasswordResetToken();
      const resetToken = await db.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: sha256(token),
          expiresAt: new Date(now.getTime() + PASSWORD_RESET_TTL_MS),
        },
        select: { id: true },
      });

      const resetUrl = new URL(
        `/connexion/reinitialiser-mot-de-passe?token=${encodeURIComponent(token)}`,
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001",
      ).toString();

      try {
        await sendCustomerPasswordResetEmail(user.email, resetUrl);
      } catch (error) {
        console.error("CUSTOMER_FORGOT_PASSWORD_EMAIL_ERROR:", error);
        await db.passwordResetToken.deleteMany({ where: { id: resetToken.id } });
        authRedirect("forgot", "email", next);
      }
    }
  }

  successRedirect("forgot-sent", next);
}

export async function resetCustomerPasswordAction(formData: FormData) {
  const token = cleanText(formData.get("token"), 512);
  const password = typeof formData.get("password") === "string" ? String(formData.get("password")) : "";
  const confirmation =
    typeof formData.get("confirmation") === "string" ? String(formData.get("confirmation")) : "";

  if (!token || password.length < 8 || password !== confirmation) {
    resetRedirect("invalid");
  }

  const db = await getPrisma();
  const resetToken = await db.passwordResetToken.findUnique({
    where: { tokenHash: sha256(token) },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      consumedAt: true,
      user: {
        select: { portal: true },
      },
    },
  });

  if (
    !resetToken ||
    resetToken.consumedAt ||
    resetToken.expiresAt < new Date() ||
    resetToken.user.portal !== "CUSTOMER"
  ) {
    resetRedirect("expired");
  }

  const now = new Date();
  await db.$transaction([
    db.user.update({
      where: { id: resetToken.userId },
      data: {
        passwordHash: await hashCustomerPassword(password),
        passwordChangedAt: now,
      },
    }),
    db.passwordResetToken.updateMany({
      where: { userId: resetToken.userId, consumedAt: null },
      data: { consumedAt: now },
    }),
    db.refreshToken.updateMany({
      where: { userId: resetToken.userId, revokedAt: null },
      data: { revokedAt: now },
    }),
  ]);

  redirect("/connexion?mode=login&reset=success");
}
