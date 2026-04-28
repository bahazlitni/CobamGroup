import emailShell from "./emailShell";

import { escapeHtml } from "../utils";
import fieldLine from "./fieldLine";

export default function buildLoginOtpCodeHtml(code: string) {
    const safeCode = escapeHtml(code);

    const body = `
        <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#334155;">
        Utilisez le code ci-dessous pour finaliser votre connexion à l’espace staff.
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
        ${fieldLine("Type", "Connexion sécurisée")}
        ${fieldLine("Validité", "Quelques minutes")}
        </table>

        <p style="margin:22px 0 0;font-size:13px;line-height:1.7;color:#64748b;">
        Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer cet email en toute sécurité.
        </p>
    `;

    return emailShell({
        preview: `Votre code OTP est ${code}`,
        eyebrow: "Authentification",
        title: "Code de sécurité",
        body,
    });
}