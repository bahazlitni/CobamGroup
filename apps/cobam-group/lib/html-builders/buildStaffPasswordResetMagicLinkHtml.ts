import emailShell from "./emailShell";
import fieldLine from "./fieldLine";
import { escapeHtml } from "../utils";

export default function buildStaffPasswordResetMagicLinkHtml(resetUrl: string) {
  const safeResetUrl = escapeHtml(resetUrl);

  const body = `
    <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#334155;">
      Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe pour votre espace staff.
    </p>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:22px 0 28px;">
      <tr>
        <td align="center">
          <a href="${safeResetUrl}" style="
            display:inline-block;
            padding:14px 22px;
            border-radius:999px;
            background:#071f34;
            color:#ffffff;
            text-decoration:none;
            font-size:14px;
            font-weight:800;
            letter-spacing:0.02em;
          ">
            Réinitialiser mon mot de passe
          </a>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
      ${fieldLine("Type", "Lien securise")}
      ${fieldLine("Validite", "30 minutes")}
    </table>

    <p style="margin:22px 0 0;font-size:13px;line-height:1.7;color:#64748b;">
      Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
      <br />
      <span style="word-break:break-all;color:#0f5f8d;">${safeResetUrl}</span>
    </p>

    <p style="margin:18px 0 0;font-size:13px;line-height:1.7;color:#64748b;">
      Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
    </p>
  `;

  return emailShell({
    preview: "Lien de réinitialisation de mot de passe COBAM GROUP",
    eyebrow: "Mot de passe",
    title: "Réinitialisation sécurisée",
    body,
  });
}
