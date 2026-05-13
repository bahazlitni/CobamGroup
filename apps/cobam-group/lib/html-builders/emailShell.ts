import { escapeHtml } from "../utils";

export default function emailShell(input: {
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