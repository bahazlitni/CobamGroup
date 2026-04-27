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

function emailShell(input: {
  preview: string;
  eyebrow: string;
  title: string;
  body: string;
}) {
  return `
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(input.title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f8fb;font-family:Arial,Helvetica,sans-serif;color:#14202e;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${escapeHtml(input.preview)}
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f8fb;">
      <tr>
        <td align="center" style="padding:32px 14px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:22px;overflow:hidden;border:1px solid #dbe8ef;box-shadow:0 18px 45px rgba(7,31,52,0.10);">
            <tr>
              <td style="background:#071f34;padding:30px 32px 28px;">
                <p style="margin:0 0 12px;font-size:11px;line-height:1.4;font-weight:700;letter-spacing:0.24em;text-transform:uppercase;color:#1d9bd1;">
                  ${escapeHtml(input.eyebrow)}
                </p>
                <h1 style="margin:0;font-size:25px;line-height:1.25;font-weight:700;color:#ffffff;">
                  ${escapeHtml(input.title)}
                </h1>
                <p style="margin:10px 0 0;font-size:14px;line-height:1.6;color:#c8e6f3;">
                  COBAM GROUP
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:30px 32px 34px;">
                ${input.body}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
}

function fieldLine(label: string, value: string) {
  return `
    <tr>
      <td style="padding:13px 0;border-bottom:1px solid #e4edf3;">
        <p style="margin:0 0 5px;font-size:11px;line-height:1.4;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;">
          ${label}
        </p>
        <p style="margin:0;font-size:15px;line-height:1.55;font-weight:600;color:#071f34;">
          ${value}
        </p>
      </td>
    </tr>
  `;
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
  return emailShell({
    preview: input.title,
    eyebrow: "Nouvelle soumission",
    title: input.title,
    body: `
      <p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:#475569;">
        Une nouvelle demande a été envoyée depuis le site web.
      </p>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
        ${fieldLine("Nom", input.safeLastName)}
        ${fieldLine("Prénom", input.safeFirstName)}
        ${fieldLine("E-mail", input.safeEmail)}
        ${fieldLine("Téléphone", input.safePhone)}
        ${fieldLine("Sujet", input.safeSubject)}
      </table>

      ${
        input.hasMessage
          ? `
            <div style="margin-top:24px;">
              <p style="margin:0 0 8px;font-size:11px;line-height:1.4;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;">
                Message
              </p>
              <div style="padding:18px 20px;background:#f4f8fb;border:1px solid #dbe8ef;border-radius:16px;font-size:15px;line-height:1.75;color:#14202e;">
                ${input.safeMessage}
              </div>
            </div>
          `
          : ""
      }
    `,
  });
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
  return emailShell({
    preview: "Nous avons bien reçu votre message.",
    eyebrow: "Confirmation",
    title: "Votre demande a bien été reçue",
    body: `
      <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#14202e;">
        Bonjour ${input.safeFullName},
      </p>

      <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#475569;">
        ${input.safeIntro}
      </p>

      <div style="margin:0;padding:20px;background:#f4f8fb;border:1px solid #dbe8ef;border-radius:18px;">
        <p style="margin:0 0 16px;font-size:16px;line-height:1.5;font-weight:700;color:#071f34;">
          Récapitulatif de votre demande
        </p>

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
          ${fieldLine("Sujet", input.safeSubject)}
          ${input.hasPhone ? fieldLine("Téléphone", input.safePhone) : ""}
        </table>

        ${
          input.hasMessage
            ? `
              <div style="margin-top:18px;">
                <p style="margin:0 0 8px;font-size:11px;line-height:1.4;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;">
                  Message
                </p>
                <div style="padding:16px 18px;background:#ffffff;border:1px solid #e4edf3;border-radius:14px;font-size:15px;line-height:1.75;color:#14202e;">
                  ${input.safeMessage}
                </div>
              </div>
            `
            : ""
        }
      </div>

      <p style="margin:24px 0 0;font-size:15px;line-height:1.7;color:#475569;">
        Notre équipe vous répondra dans les meilleurs délais.
      </p>
    `,
  });
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