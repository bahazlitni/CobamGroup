import { NextResponse } from "next/server";
import { isValidPhoneNumber } from "libphonenumber-js";
import nodemailer from "nodemailer";
import { treeifyError, z } from "zod";
import {
  EMAIL_REQUIRED,
  FIRSTNAME_REQUIRED,
  isValidContactName,
  LASTNAME_REQUIRED,
  MAX_EMAIL,
  MAX_FIRSTNAME,
  MAX_LASTNAME,
  MAX_MESSAGE,
  MAX_PHONE,
  MAX_SUBJECT,
  MESSAGE_REQUIRED,
  PHONE_REQUIRED,
  SUBJECT_REQUIRED,
} from "@/lib/api/contact/rules";

export const runtime = "nodejs";

const nameSchema = (fieldName: string, max: number, required: boolean) => {
  const schema = z
    .string()
    .trim()
    .max(max)
    .refine((value) => !required || value.length > 0, {
      message: `${fieldName} is required`,
    })
    .refine((value) => value.length === 0 || isValidContactName(value), {
      message: `${fieldName} must contain letters only`,
    });

  return required ? schema : schema.optional().or(z.literal(""));
};

const optionalStringSchema = (
  max: number,
  required: boolean,
  fieldName: string,
) =>
  z
    .string()
    .trim()
    .max(max)
    .refine((value) => !required || value.length > 0, {
      message: `${fieldName} is required`,
    });

const phoneSchema = z
  .string()
  .trim()
  .max(MAX_PHONE)
  .refine((value) => !PHONE_REQUIRED || value.length > 0, {
    message: "Phone is required",
  })
  .refine((value) => value.length === 0 || isValidPhoneNumber(value), {
    message: "Phone must be a valid international phone number",
  });

const contactSchema = z.object({
  firstName: nameSchema("Firstname", MAX_FIRSTNAME, FIRSTNAME_REQUIRED),
  lastName: nameSchema("Lastname", MAX_LASTNAME, LASTNAME_REQUIRED),
  email: z
    .string()
    .trim()
    .max(MAX_EMAIL)
    .refine((value) => !EMAIL_REQUIRED || value.length > 0, {
      message: "Email is required",
    })
    .pipe(z.email()),
  phone: phoneSchema,
  subject: optionalStringSchema(MAX_SUBJECT, SUBJECT_REQUIRED, "Subject"),
  message: optionalStringSchema(MAX_MESSAGE, MESSAGE_REQUIRED, "Message"),
  website: z.string().optional(),
});

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

const transporter = nodemailer.createTransport({
  host: requiredEnv("SMTP_HOST"),
  port: Number(requiredEnv("SMTP_PORT")),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: requiredEnv("SMTP_USER"),
    pass: requiredEnv("SMTP_PASS"),
  },
});

function buildStaffContactHtml(input: {
  safeFirstName: string;
  safeLastName: string;
  safeEmail: string;
  safePhone: string;
  safeSubject: string;
  safeMessage: string;
}) {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #111;">
      <h2>Nouvelle soumission du formulaire contact</h2>
      <p><strong>Nom:</strong> ${input.safeLastName}</p>
      <p><strong>Prénom:</strong> ${input.safeFirstName}</p>
      <p><strong>E-mail:</strong> ${input.safeEmail}</p>
      <p><strong>Téléphone:</strong> ${input.safePhone}</p>
      <p><strong>Sujet:</strong> ${input.safeSubject}</p>
      <hr />
      <p><strong>Message:</strong></p>
      <p>${input.safeMessage}</p>
    </div>
  `;
}

function buildAcknowledgementHtml(input: {
  safeFullName: string;
  safeSubject: string;
  safePhone: string;
  safeMessage: string;
  hasPhone: boolean;
  hasMessage: boolean;
}) {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.65; color: #14202e;">
      <p>Bonjour ${input.safeFullName},</p>
      <p>Nous avons bien re&ccedil;u votre message et vous remercions d'avoir contact&eacute; <strong>COBAM GROUP</strong>.</p>
      <div style="margin: 24px 0; padding: 18px 20px; border: 1px solid #dbe3ea; background: #f8fbfd;">
        <p style="margin: 0 0 10px;"><strong>R&eacute;capitulatif de votre demande</strong></p>
        <p style="margin: 0;"><strong>Sujet:</strong> ${input.safeSubject}</p>
        ${
          input.hasPhone
            ? `<p style="margin: 6px 0 0;"><strong>T&eacute;l&eacute;phone:</strong> ${input.safePhone}</p>`
            : ""
        }
        ${
          input.hasMessage
            ? `<hr style="border: 0; border-top: 1px solid #dbe3ea; margin: 16px 0;" /><p style="margin: 0;"><strong>Message:</strong></p><p style="margin: 8px 0 0;">${input.safeMessage}</p>`
            : ""
        }
      </div>
      <p>Notre &eacute;quipe vous r&eacute;pondra dans les meilleurs d&eacute;lais.</p>
      <p style="margin-top: 24px;">COBAM GROUP</p>
    </div>
  `;
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { ok: false, error: "Unsupported content type" },
        { status: 415 },
      );
    }

    const rawBody = await req.json();
    const parsed = contactSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid form data",
          issues: treeifyError(parsed.error),
        },
        { status: 400 },
      );
    }

    const {
      firstName: rawFirstName,
      lastName: rawLastName,
      email: rawEmail,
      phone: rawPhone,
      subject: rawSubject,
      message: rawMessage,
      website,
    } =
      parsed.data;

    if (website && website.trim() !== "") {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const firstName = rawFirstName ?? "";
    const lastName = rawLastName ?? "";
    const email = rawEmail;
    const phone = rawPhone ?? "";
    const subject = rawSubject ?? "";
    const message = rawMessage ?? "";

    const fullName = `${firstName} ${lastName}`.trim();
    const safeFullName = escapeHtml(fullName);
    const safeFirstName = escapeHtml(firstName);
    const safeLastName = escapeHtml(lastName);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone || "Non renseigné");
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

    const to = requiredEnv("CONTACT_TO_EMAIL");
    const fromEmail = requiredEnv("CONTACT_FROM_EMAIL");
    const fromName = process.env.CONTACT_FROM_NAME || "COBAM GROUP";

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      replyTo: email,
      subject: `[Contact] ${subject}`,
      text: [
        "Nouvelle soumission du formulaire contact",
        "",
        `Nom: ${lastName}`,
        `Prénom: ${firstName}`,
        `E-mail: ${email}`,
        `Telephone: ${phone || "Non renseigné"}`,
        `Sujet: ${subject}`,
        "",
        "Message:",
        message,
      ].join("\n"),
      html: buildStaffContactHtml({
        safeFirstName,
        safeLastName,
        safeEmail,
        safePhone,
        safeSubject,
        safeMessage,
      }),
    });

    await transporter
      .sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: email,
        replyTo: to,
        subject: `Accusé de réception - ${subject}`,
        text: [
          `Bonjour ${fullName},`,
          "",
          "Nous avons bien re&ccedil;u votre message et vous remercions d'avoir contacté COBAM GROUP.",
          "",
          "Recapitulatif de votre demande :",
          `Sujet: ${subject}`,
          phone ? `Téléphone: ${phone}` : null,
          "",
          message ? `Message:\n${message}` : null,
          "",
          "Notre équipe vous répondra dans les meilleurs délais.",
          "",
          "COBAM GROUP",
          `E-mail: ${to}`,
        ]
          .filter((line): line is string => line != null)
          .join("\n"),
        html: buildAcknowledgementHtml({
          safeFullName,
          safeSubject,
          safePhone,
          safeMessage,
          hasPhone: Boolean(phone),
          hasMessage: Boolean(message),
        }),
      })
      .catch((error) => {
        console.error("Contact acknowledgement email error:", error);
      });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Contact form error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to send message",
      },
      { status: 500 },
    );
  }
}
