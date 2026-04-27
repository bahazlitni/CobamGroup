import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { treeifyError, z } from "zod";
import {
  buildSchema,
  escapeHtml,
  FORM_TYPES,
  type FormState,
  type FormType,
  getPublicFormConfig,
  requiredEnv,
} from "@/lib/api/public-form/utils";

export const runtime = "nodejs";

type ParsedPublicFormPayload = Partial<FormState> & {
  type: FormType;
  website?: string;
};

function createTransporter() {
  return nodemailer.createTransport({
    host: requiredEnv("SMTP_HOST"),
    port: Number(requiredEnv("SMTP_PORT")),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: requiredEnv("SMTP_USER"),
      pass: requiredEnv("SMTP_PASS"),
    },
  });
}

function fieldLine(label: string, value: string) {
  return `<p><strong>${label}:</strong> ${value}</p>`;
}

function buildStaffHtml(input: {
  title: string;
  safeFirstName: string;
  safeLastName: string;
  safeEmail: string;
  safePhone: string;
  safeSubject: string;
  safeMessage: string;
  hasMessage: boolean;
}) {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #111;">
      <h2>${escapeHtml(input.title)}</h2>
      ${fieldLine("Nom", input.safeLastName)}
      ${fieldLine("Prénom", input.safeFirstName)}
      ${fieldLine("E-mail", input.safeEmail)}
      ${fieldLine("Téléphone", input.safePhone)}
      ${fieldLine("Sujet", input.safeSubject)}
      ${
        input.hasMessage
          ? `<hr /><p><strong>Message:</strong></p><p>${input.safeMessage}</p>`
          : ""
      }
    </div>
  `;
}

function buildAcknowledgementHtml(input: {
  safeFullName: string;
  safeIntro: string;
  safeSubject: string;
  safePhone: string;
  safeMessage: string;
  hasPhone: boolean;
  hasMessage: boolean;
}) {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.65; color: #14202e;">
      <p>Bonjour ${input.safeFullName},</p>
      <p>${input.safeIntro}</p>
      <div style="margin: 24px 0; padding: 18px 20px; border: 1px solid #dbe3ea; background: #f8fbfd;">
        <p style="margin: 0 0 10px;"><strong>Récapitulatif de votre demande</strong></p>
        <p style="margin: 0;"><strong>Sujet:</strong> ${input.safeSubject}</p>
        ${
          input.hasPhone
            ? `<p style="margin: 6px 0 0;"><strong>Téléphone:</strong> ${input.safePhone}</p>`
            : ""
        }
        ${
          input.hasMessage
            ? `<hr style="border: 0; border-top: 1px solid #dbe3ea; margin: 16px 0;" /><p style="margin: 0;"><strong>Message:</strong></p><p style="margin: 8px 0 0;">${input.safeMessage}</p>`
            : ""
        }
      </div>
      <p>Notre équipe vous répondra dans les meilleurs délais.</p>
      <p style="margin-top: 24px;">COBAM GROUP</p>
    </div>
  `;
}

function getOptionalField(
  parsed: ParsedPublicFormPayload,
  field: keyof FormState,
) {
  return typeof parsed[field] === "string" ? parsed[field].trim() : "";
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
    const typeResult = z.object({ type: z.enum(FORM_TYPES) }).safeParse(rawBody);

    if (!typeResult.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid form type" },
        { status: 400 },
      );
    }

    const config = getPublicFormConfig(typeResult.data.type);
    const parsed = buildSchema(config.rules).safeParse(rawBody);

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

    const payload = parsed.data as ParsedPublicFormPayload;

    if (payload.website && payload.website.trim() !== "") {
      return NextResponse.json(
        { ok: true, message: config.successMessage },
        { status: 200 },
      );
    }

    const firstName = getOptionalField(payload, "firstName");
    const lastName = getOptionalField(payload, "lastName");
    const email = getOptionalField(payload, "email");
    const phone = getOptionalField(payload, "phone");
    const subject = getOptionalField(payload, "subject");
    const message = getOptionalField(payload, "message");
    const fullName = `${firstName} ${lastName}`.trim() || "Client";
    const to = requiredEnv(config.toEmailEnv);
    const fromEmail = requiredEnv(config.fromEmailEnv);
    const fromName =
      process.env[config.fromNameEnv]?.trim() || config.defaultFromName;
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      replyTo: email || undefined,
      subject: `[${config.staffSubjectPrefix}] ${subject}`,
      text: [
        config.staffTitle,
        "",
        `Nom: ${lastName}`,
        `Prénom: ${firstName}`,
        `E-mail: ${email || "Non renseigné"}`,
        `Téléphone: ${phone || "Non renseigné"}`,
        `Sujet: ${subject}`,
        "",
        message ? `Message:\n${message}` : null,
      ]
        .filter((line): line is string => line != null)
        .join("\n"),
      html: buildStaffHtml({
        title: config.staffTitle,
        safeFirstName: escapeHtml(firstName || "Non renseigné"),
        safeLastName: escapeHtml(lastName || "Non renseigné"),
        safeEmail: escapeHtml(email || "Non renseigné"),
        safePhone: escapeHtml(phone || "Non renseigné"),
        safeSubject: escapeHtml(subject),
        safeMessage,
        hasMessage: Boolean(message),
      }),
    });

    if (email) {
      await transporter
        .sendMail({
          from: `"${fromName}" <${fromEmail}>`,
          to: email,
          replyTo: to,
          subject: `${config.acknowledgementSubjectPrefix} - ${subject}`,
          text: [
            `Bonjour ${fullName},`,
            "",
            config.acknowledgementIntro,
            "",
            "Récapitulatif de votre demande :",
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
            safeFullName: escapeHtml(fullName),
            safeIntro: escapeHtml(config.acknowledgementIntro),
            safeSubject: escapeHtml(subject),
            safePhone: escapeHtml(phone),
            safeMessage,
            hasPhone: Boolean(phone),
            hasMessage: Boolean(message),
          }),
        })
        .catch((error) => {
          console.error(`${config.type} acknowledgement email error:`, error);
        });
    }

    return NextResponse.json(
      { ok: true, message: config.successMessage },
      { status: 200 },
    );
  } catch (error) {
    console.error("Public form error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to send message",
      },
      { status: 500 },
    );
  }
}