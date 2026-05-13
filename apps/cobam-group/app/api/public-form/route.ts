import { NextResponse } from "next/server";
import { treeifyError, z } from "zod";
import {
  buildSchema,
  FORM_TYPES,
  type FormState,
  type FormType,
  getPublicFormConfig,
} from "@/lib/api/public-form/utils";
import { createTransporter } from "@/lib/nodemailer/create-transporter";
import { escapeHtml, requiredEnv } from "@/lib/utils";
import { sendEmail } from "@/lib/nodemailer/send-email";
import buildPublicFormHtml from "@/lib/html-builders/buildPublicFormHtml";
import buildPublicFormAckHtml from "@/lib/html-builders/buildPublicFormAckHtml";

export const runtime = "nodejs";

type ParsedPublicFormPayload = Partial<FormState> & {
  type: FormType;
  website?: string;
};

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

    await sendEmail(transporter, {
      fromName,
      fromEmail, 
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
      html: buildPublicFormHtml({
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
      await sendEmail(transporter, {
          fromName,
          fromEmail,
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
          html: buildPublicFormAckHtml({
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
