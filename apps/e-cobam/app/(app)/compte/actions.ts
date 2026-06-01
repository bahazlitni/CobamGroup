"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { CommercePaymentMethod, CustomerAddressType, CustomerType } from "@prisma/client";
import {
  destroyCustomerSession,
  getCustomerSession,
  hashCustomerPassword,
  verifyCustomerPassword,
} from "@/lib/customer-auth";

async function getPrisma() {
  const { prisma } = await import("@cobam/db");
  return prisma;
}

async function requireCustomerId() {
  const session = await getCustomerSession();
  if (!session) {
    redirect("/connexion?next=/compte");
  }

  return BigInt(session.customerId);
}

async function requireCustomerSession() {
  const session = await getCustomerSession();
  if (!session) {
    redirect("/connexion?next=/compte");
  }

  return session;
}

function cleanText(value: FormDataEntryValue | null, maxLength: number) {
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.replace(/\s+/g, " ").trim();
  return cleaned ? cleaned.slice(0, maxLength) : null;
}

function parseCustomerType(value: FormDataEntryValue | null): CustomerType {
  return value === "COMPANY" ? "COMPANY" : "INDIVIDUAL";
}

function parseAddressType(value: FormDataEntryValue | null): CustomerAddressType {
  if (value === "BILLING" || value === "SHIPPING") {
    return value;
  }

  return "BOTH";
}

function parsePaymentMethod(value: FormDataEntryValue | null): CommercePaymentMethod {
  if (value === "CASH_ON_DELIVERY" || value === "PAY_IN_STORE") {
    return value;
  }

  return "BANK_TRANSFER";
}

function parseBigIntId(value: FormDataEntryValue | null) {
  const cleaned = cleanText(value, 40);
  return cleaned && /^\d+$/.test(cleaned) ? BigInt(cleaned) : null;
}

export async function logoutCustomerAction() {
  await destroyCustomerSession();
  redirect("/connexion");
}

export async function updateCustomerProfileAction(formData: FormData) {
  const customerId = await requireCustomerId();
  const type = parseCustomerType(formData.get("type"));
  const firstName = cleanText(formData.get("firstName"), 100);
  const lastName = cleanText(formData.get("lastName"), 100);
  const companyName = cleanText(formData.get("companyName"), 255);
  const phone = cleanText(formData.get("phone"), 50);
  const emailMarketingOptIn = formData.get("emailMarketingOptIn") === "on";
  const smsMarketingOptIn = formData.get("smsMarketingOptIn") === "on";

  const db = await getPrisma();
  await db.customerProfile.update({
    where: { id: customerId },
    data: {
      type,
      firstName,
      lastName,
      companyName: type === "COMPANY" ? companyName : null,
      taxIdentifier: null,
      phone,
      emailMarketingOptIn,
      smsMarketingOptIn,
    },
  });

  revalidatePath("/compte");
  revalidatePath("/compte/profil");
}

export async function changeCustomerPasswordAction(formData: FormData) {
  const session = await requireCustomerSession();
  const currentPassword =
    typeof formData.get("currentPassword") === "string" ? String(formData.get("currentPassword")) : "";
  const password = typeof formData.get("password") === "string" ? String(formData.get("password")) : "";
  const confirmation =
    typeof formData.get("confirmation") === "string" ? String(formData.get("confirmation")) : "";

  if (!currentPassword || password.length < 8 || password !== confirmation) {
    redirect("/compte/securite?error=password");
  }

  const db = await getPrisma();
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { passwordHash: true },
  });

  if (!user || !(await verifyCustomerPassword(currentPassword, user.passwordHash))) {
    redirect("/compte/securite?error=password");
  }

  await db.user.update({
    where: { id: session.userId },
    data: {
      passwordHash: await hashCustomerPassword(password),
      passwordChangedAt: new Date(),
    },
  });

  revalidatePath("/compte/securite");
  redirect("/compte/securite?updated=password");
}

export async function updateCustomerTwoFactorAction(formData: FormData) {
  const session = await requireCustomerSession();
  const enabled = formData.get("twoFactorEnabled") === "on";
  const db = await getPrisma();

  await db.user.update({
    where: { id: session.userId },
    data: { twoStepVerificationEnabled: enabled },
  });

  revalidatePath("/compte/securite");
  redirect(`/compte/securite?updated=${enabled ? "2fa-on" : "2fa-off"}`);
}

export async function addCustomerAddressAction(formData: FormData) {
  const customerId = await requireCustomerId();
  const type = parseAddressType(formData.get("type"));
  const label = cleanText(formData.get("label"), 100);
  const fullName = cleanText(formData.get("fullName"), 255);
  const phone = cleanText(formData.get("phone"), 50);
  const addressLine1 = cleanText(formData.get("addressLine1"), 255);
  const addressLine2 = cleanText(formData.get("addressLine2"), 255);
  const city = cleanText(formData.get("city"), 120);
  const governorate = cleanText(formData.get("governorate"), 120);
  const postalCode = cleanText(formData.get("postalCode"), 30);
  const isDefaultShipping = formData.get("isDefaultShipping") === "on";
  const isDefaultBilling = formData.get("isDefaultBilling") === "on";

  if (!fullName || !addressLine1 || !city) {
    redirect("/compte/adresses?error=missing");
  }

  const db = await getPrisma();
  const address = await db.customerAddress.create({
    data: {
      customerId,
      type,
      label,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      governorate,
      postalCode,
      countryCode: "TN",
      isDefaultShipping,
      isDefaultBilling,
    },
    select: { id: true },
  });

  if (isDefaultShipping) {
    await db.$transaction([
      db.customerAddress.updateMany({
        where: { customerId, id: { not: address.id } },
        data: { isDefaultShipping: false },
      }),
      db.customerProfile.update({
        where: { id: customerId },
        data: { defaultShippingAddressId: address.id },
      }),
    ]);
  }

  if (isDefaultBilling) {
    await db.$transaction([
      db.customerAddress.updateMany({
        where: { customerId, id: { not: address.id } },
        data: { isDefaultBilling: false },
      }),
      db.customerProfile.update({
        where: { id: customerId },
        data: { defaultBillingAddressId: address.id },
      }),
    ]);
  }

  revalidatePath("/compte");
  revalidatePath("/compte/adresses");
}

export async function deleteCustomerAddressAction(formData: FormData) {
  const customerId = await requireCustomerId();
  const addressId = parseBigIntId(formData.get("addressId"));

  if (!addressId) {
    redirect("/compte/adresses?error=missing");
  }

  const db = await getPrisma();
  await db.customerAddress.deleteMany({
    where: { id: addressId, customerId },
  });

  revalidatePath("/compte");
  revalidatePath("/compte/adresses");
}

export async function setDefaultCustomerAddressAction(formData: FormData) {
  const customerId = await requireCustomerId();
  const addressId = parseBigIntId(formData.get("addressId"));
  const kind = cleanText(formData.get("kind"), 20);

  if (!addressId) {
    redirect("/compte/adresses?error=missing");
  }

  const db = await getPrisma();
  const address = await db.customerAddress.findFirst({
    where: { id: addressId, customerId },
    select: { id: true },
  });

  if (!address) {
    redirect("/compte/adresses?error=missing");
  }

  if (kind === "billing") {
    await db.$transaction([
      db.customerAddress.updateMany({ where: { customerId }, data: { isDefaultBilling: false } }),
      db.customerAddress.update({ where: { id: address.id }, data: { isDefaultBilling: true } }),
      db.customerProfile.update({
        where: { id: customerId },
        data: { defaultBillingAddressId: address.id },
      }),
    ]);
  } else {
    await db.$transaction([
      db.customerAddress.updateMany({ where: { customerId }, data: { isDefaultShipping: false } }),
      db.customerAddress.update({ where: { id: address.id }, data: { isDefaultShipping: true } }),
      db.customerProfile.update({
        where: { id: customerId },
        data: { defaultShippingAddressId: address.id },
      }),
    ]);
  }

  revalidatePath("/compte");
  revalidatePath("/compte/adresses");
}

export async function addCustomerPaymentMethodAction(formData: FormData) {
  const customerId = await requireCustomerId();
  const method = parsePaymentMethod(formData.get("method"));
  const label = cleanText(formData.get("label"), 120);
  const holderName = cleanText(formData.get("holderName"), 255);
  const isDefault = formData.get("isDefault") === "on";

  const db = await getPrisma();
  const paymentMethod = await db.customerPaymentMethod.create({
    data: {
      customerId,
      method,
      label,
      holderName,
      provider: "manual",
      isDefault,
    },
    select: { id: true },
  });

  if (isDefault) {
    await db.customerPaymentMethod.updateMany({
      where: { customerId, id: { not: paymentMethod.id } },
      data: { isDefault: false },
    });
  }

  revalidatePath("/compte");
  revalidatePath("/compte/paiements");
}

export async function deleteCustomerPaymentMethodAction(formData: FormData) {
  const customerId = await requireCustomerId();
  const paymentMethodId = parseBigIntId(formData.get("paymentMethodId"));

  if (!paymentMethodId) {
    redirect("/compte/paiements?error=missing");
  }

  const db = await getPrisma();

  await db.customerPaymentMethod.updateMany({
    where: { id: paymentMethodId, customerId },
    data: { isActive: false, isDefault: false },
  });

  revalidatePath("/compte");
  revalidatePath("/compte/paiements");
}

export async function setDefaultCustomerPaymentMethodAction(formData: FormData) {
  const customerId = await requireCustomerId();
  const paymentMethodId = parseBigIntId(formData.get("paymentMethodId"));

  if (!paymentMethodId) {
    redirect("/compte/paiements?error=missing");
  }

  const db = await getPrisma();
  const paymentMethod = await db.customerPaymentMethod.findFirst({
    where: { id: paymentMethodId, customerId, isActive: true },
    select: { id: true },
  });

  if (!paymentMethod) {
    redirect("/compte/paiements?error=missing");
  }

  await db.$transaction([
    db.customerPaymentMethod.updateMany({ where: { customerId }, data: { isDefault: false } }),
    db.customerPaymentMethod.update({ where: { id: paymentMethod.id }, data: { isDefault: true } }),
  ]);

  revalidatePath("/compte");
  revalidatePath("/compte/paiements");
}
