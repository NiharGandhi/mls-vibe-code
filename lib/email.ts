import nodemailer from "nodemailer";

const smtpPort = Number(process.env.SMTP_PORT) || 587;
// Port 465 = implicit TLS (secure: true). Port 587 = STARTTLS (secure: false).
// If you get 421/EPROTOCOL with Hostinger, try port 465 and secure: true.
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  connectionTimeout: 10000,
});

/**
 * Verify the SMTP connection. Call at startup or before sending to catch config errors early.
 */
export async function verifyConnection(): Promise<void> {
  await transporter.verify();
  console.log("Server is ready to take our messages");
}

const FROM = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "noreply@nova4you.org";
const APP_NAME = process.env.APP_NAME ?? "Vibe It";

/** Shared email wrapper: single column, max 600px, inline styles for client compatibility. */
function emailLayout(appName: string, bodyHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName}</title>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #334155;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f1f5f9;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1); overflow: hidden;">
          <tr>
            <td style="padding: 32px 24px 24px; border-bottom: 1px solid #e2e8f0;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.025em;">${appName}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 24px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding: 24px; border-top: 1px solid #e2e8f0; background-color: #f8fafc;">
              <p style="margin: 0; font-size: 13px; color: #64748b;">— The ${appName} team</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export type SendEmailOptions = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

/**
 * Send an email via the configured transporter.
 * Use void sendEmail(...) in auth callbacks to avoid blocking (timing attacks).
 */
export async function sendEmail({ to, subject, text, html }: SendEmailOptions): Promise<void> {
  await transporter.sendMail({
    from: FROM,
    to,
    subject,
    text: text ?? undefined,
    html: html ?? (text ? undefined : undefined),
  });
}

/**
 * Send the email verification email (Better Auth emailVerification.sendVerificationEmail).
 */
export async function sendVerificationEmail(to: string, url: string, userName?: string | null): Promise<void> {
  const name = userName ?? "there";
  const body = `
    <p style="margin: 0 0 16px; color: #334155;">Hi ${escapeHtml(name)},</p>
    <p style="margin: 0 0 24px; color: #475569;">Please verify your email by clicking the button below.</p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td style="border-radius: 8px; background-color: #0f172a;">
          <a href="${escapeHtml(url)}" target="_blank" rel="noopener" style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none;">Verify my email</a>
        </td>
      </tr>
    </table>
    <p style="margin: 24px 0 0; font-size: 14px; color: #64748b;">If you didn't create an account, you can safely ignore this email.</p>
  `.trim();
  await sendEmail({
    to,
    subject: `Verify your email - ${APP_NAME}`,
    text: `Hi ${name},\n\nPlease verify your email by clicking the link below:\n\n${url}\n\nIf you didn't create an account, you can ignore this email.\n\n— ${APP_NAME}`,
    html: emailLayout(APP_NAME, body),
  });
}

/**
 * Send a welcome email (e.g. after email verification).
 */
export async function sendWelcomeEmail(to: string, userName?: string | null): Promise<void> {
  const name = userName ?? "there";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_BASE_URL ?? "";
  const body = `
    <p style="margin: 0 0 16px; color: #334155;">Hi ${escapeHtml(name)},</p>
    <p style="margin: 0 0 24px; color: #475569;">Welcome to ${escapeHtml(APP_NAME)}! Your email is verified and you're all set.</p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td style="border-radius: 8px; background-color: #0f172a;">
          <a href="${escapeHtml(appUrl)}" target="_blank" rel="noopener" style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none;">Get started</a>
        </td>
      </tr>
    </table>
    <p style="margin: 24px 0 0; font-size: 14px; color: #64748b;">We're glad to have you.</p>
  `.trim();
  await sendEmail({
    to,
    subject: `Welcome to ${APP_NAME}`,
    text: `Hi ${name},\n\nWelcome to ${APP_NAME}! Your email is verified and you're all set.\n\nGet started: ${appUrl}\n\n— The ${APP_NAME} team`,
    html: emailLayout(APP_NAME, body),
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}