import emailShell from "./emailShell";
import fieldLine from "./fieldLine";

export default function buildPublicFormHtml(input: {
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