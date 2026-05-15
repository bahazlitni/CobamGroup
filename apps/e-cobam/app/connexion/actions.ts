"use server";

import { redirect } from "next/navigation";
import { createCustomerSession, hashCustomerPassword, verifyCustomerPassword } from "@/lib/customer-auth";
import { linkGuestOrdersToCustomer } from "@/lib/customer-account";

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

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "/compte";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/compte";
}

function authRedirect(mode: "login" | "register", reason: string, next: string): never {
  const params = new URLSearchParams({ mode, error: reason });
  if (next !== "/compte") {
    params.set("next", next);
  }

  redirect(`/connexion?${params.toString()}`);
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
  if (!validPassword) {
    authRedirect("login", "invalid", next);
  }

  if (!user.customerProfile) {
    authRedirect("login", "invalid", next);
  }

  await linkGuestOrdersToCustomer(user.customerProfile.id, user.email, user.customerProfile.phone);
  await createCustomerSession(user.id);
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
      powerType: "STAFF",
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
