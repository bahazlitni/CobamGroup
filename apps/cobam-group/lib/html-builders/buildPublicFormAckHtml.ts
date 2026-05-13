import emailShell from "./emailShell";
import fieldLine from "./fieldLine";

export default function buildPublicFormAckHtml(input: {
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