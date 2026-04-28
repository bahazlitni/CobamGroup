export default function fieldLine(label: string, value: string) {
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