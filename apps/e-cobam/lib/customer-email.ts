import "server-only";

import nodemailer from "nodemailer";

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function optionalEnv(name: string) {
  return process.env[name]?.trim() || null;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

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

async function sendCustomerEmail(params: {
  to: string;
  subject: string;
  preview: string;
  title: string;
  body: string;
  text: string;
}) {
  const transporter = createTransporter();
  const fromEmail = optionalEnv("CONTACT_EMAIL") ?? requiredEnv("SMTP_USER");
  const fromName = process.env.CONTACT_NAME?.trim() || "COBAM E-commerce";

  const result = await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: params.to,
    subject: params.subject,
    text: params.text,
    html: `
      <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(params.preview)}</div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f5f0;padding:32px 16px;font-family:Arial,sans-serif;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #ded8ce;">
              <tr>
                <td style="padding:34px 32px;">
                  <h1 style="margin:0 0 18px;color:#121c2a;font-size:28px;line-height:1.15;font-weight:800;">${escapeHtml(params.title)}</h1>
                  ${params.body}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
  });

  console.info("CUSTOMER_EMAIL_SENT:", {
    to: params.to,
    subject: params.subject,
    messageId: result.messageId,
    accepted: result.accepted,
    rejected: result.rejected,
  });
}

export async function sendCustomerPasswordResetEmail(email: string, resetUrl: string) {
  const safeUrl = escapeHtml(resetUrl);
  await sendCustomerEmail({
    to: email,
    subject: "Réinitialisation de votre mot de passe",
    preview: "Choisissez un nouveau mot de passe pour votre compte.",
    title: "Réinitialisation de votre mot de passe",
    text: `Pour réinitialiser votre mot de passe, ouvrez ce lien : ${resetUrl}`,
    body: `
      <p style="margin:0 0 22px;color:#596677;font-size:15px;line-height:1.7;">
        Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien est valable 30 minutes.
      </p>
      <p style="margin:0 0 24px;">
        <a href="${safeUrl}" style="display:inline-block;background:#121c2a;color:#ffffff;text-decoration:none;padding:14px 22px;font-size:14px;font-weight:800;">
          Réinitialiser mon mot de passe
        </a>
      </p>
      <p style="margin:0;color:#7b8491;font-size:13px;line-height:1.7;word-break:break-all;">
        Si le bouton ne fonctionne pas, copiez ce lien :<br />${safeUrl}
      </p>
    `,
  });
}

export async function sendCustomerOtpEmail(email: string, code: string) {
  await sendCustomerEmail({
    to: email,
    subject: "Votre code de connexion",
    preview: "Code de vérification.",
    title: "Code de vérification",
    text: `Votre code de connexion est : ${code}`,
    body: `
      <p style="margin:0 0 20px;color:#596677;font-size:15px;line-height:1.7;">
        Entrez ce code pour terminer votre connexion.
      </p>
      <p style="margin:0;color:#121c2a;font-size:34px;letter-spacing:.28em;font-weight:900;">${escapeHtml(code)}</p>
    `,
  });
}
