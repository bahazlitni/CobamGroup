import SMTPTransport from "nodemailer/lib/smtp-transport";
import nodemailer from "nodemailer"
export function sendEmail(transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options>, params: {
    fromName: string;
    fromEmail: string;
    to: string;
    replyTo?: string;
    subject: string;
    html: string;
    text?: string;
}) {
    return transporter.sendMail({
        from: `"${params.fromName}" <${params.fromEmail}>`,
        to: params.to,
        replyTo: params.replyTo,
        subject: params.subject,
        html: params.html,
        text: params.text,
    });
}