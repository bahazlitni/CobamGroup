import emailShell from "./emailShell";
import fieldLine from "./fieldLine";
import { escapeHtml } from "../utils";

export default function buildPasswordChangeOtpCodeHtml(code: string) {
  const safeCode = escapeHtml(code);

  const body = `
    <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#334155;">
      Utilisez le code ci-dessous pour confirmer la modification de votre mot de passe staff.
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:18px 0 26px;">
      <tr>
        <td align="center">
          <div style="
            display:inline-block;
            padding:18px 24px;
            border-radius:18px;
            background:#f1f7fb;
            border:1px solid #dbe8ef;
          ">
            <span style="
              font-size:30px;
              letter-spacing:10px;
              font-weight:800;
              color:#071f34;
              font-family:monospace;
            ">
              ${safeCode}
            </span>
          </div>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      ${fieldLine("Type", "Changement de mot de passe")}
      ${fieldLine("Validité", "Quelques minutes")}
    </table>

    <p style="margin:22px 0 0;font-size:13px;line-height:1.7;color:#64748b;">
      Si vous n'êtes pas à l'origine de cette demande, ignorez cet email et contactez un administrateur.
    </p>
  `;

  return emailShell({
    preview: `Votre code de confirmation est ${code}`,
    eyebrow: "Sécurité",
    title: "Confirmation du mot de passe",
    body,
  });
}
