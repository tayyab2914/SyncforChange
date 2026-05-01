import nodemailer from "nodemailer";

let cached: nodemailer.Transporter | null = null;

function getTransporter() {
  if (cached) return cached;
  const port = Number(process.env.SMTP_PORT ?? 587);
  cached = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  return cached;
}

export async function sendVerificationEmail(to: string, link: string): Promise<void> {
  const transporter = getTransporter();
  const fromName = process.env.SMTP_FROM_NAME ?? "SyncForChange";
  const fromEmail = process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER!;

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: "Confirm your SyncForChange account",
    text: `Welcome to SyncForChange!\n\nClick the link below to confirm your email:\n${link}\n\nThis link expires in 1 hour.\n\nIf you didn't create an account, you can safely ignore this email.`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1b1c1c;">
        <h1 style="font-size: 22px; margin: 0 0 16px;">Welcome to SyncForChange</h1>
        <p style="font-size: 14px; line-height: 1.6; color: #4b4b4b; margin: 0 0 24px;">
          Click the button below to confirm your email and finish setting up your account.
        </p>
        <a href="${link}"
          style="display: inline-block; background: #4a8763; color: #fff; padding: 12px 24px;
                 border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px;">
          Confirm Email
        </a>
        <p style="font-size: 12px; line-height: 1.6; color: #9a9a9a; margin: 32px 0 0;">
          This link expires in 1 hour. If the button doesn't work, copy and paste this URL:<br>
          <span style="word-break: break-all;">${link}</span>
        </p>
        <p style="font-size: 12px; color: #9a9a9a; margin: 16px 0 0;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
