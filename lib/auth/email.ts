import nodemailer from "nodemailer";
import { format } from "date-fns";
import { buildEmailHtml, buildEmailText } from "@/lib/email/template";
import { prisma } from "@/lib/db";

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

function fromAddress(): string {
  const fromName = process.env.SMTP_FROM_NAME ?? "SyncforChange";
  const fromEmail = process.env.SMTP_FROM_EMAIL ?? process.env.SMTP_USER!;
  return `"${fromName}" <${fromEmail}>`;
}

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

interface SendArgs {
  to: string | string[];
  subject: string;
  preheader?: string;
}

async function send(args: SendArgs, contentBuilder: () => Parameters<typeof buildEmailHtml>[0]) {
  const transporter = getTransporter();
  const content = contentBuilder();
  if (args.preheader && !content.preheader) content.preheader = args.preheader;

  await transporter.sendMail({
    from: fromAddress(),
    to: args.to,
    subject: args.subject,
    text: buildEmailText(content),
    html: buildEmailHtml(content),
  });
}

// ────────────────────────────────────────────────────────────────────
// Auth flow emails
// ────────────────────────────────────────────────────────────────────

export async function sendVerificationEmail(to: string, link: string): Promise<void> {
  await send(
    {
      to,
      subject: "Confirm your SyncforChange account",
      preheader: "Click the link inside to finish setting up your organizer account.",
    },
    () => ({
      badge: { icon: "mark_email_read", tone: "primary" },
      heading: "Confirm your email",
      intro:
        "Welcome to SyncforChange. Click the button below to verify your email and finish setting up your organizer account.",
      cta: { label: "Confirm Email", url: link },
      ctaNote: `This link expires in 1 hour. If the button doesn't work, copy and paste this URL: ${link}`,
      closing:
        "If you didn't create a SyncforChange account, you can safely ignore this email — no account will be created.",
    })
  );
}

export async function sendPasswordResetEmail(to: string, link: string): Promise<void> {
  await send(
    {
      to,
      subject: "Reset your SyncforChange password",
      preheader: "We received a request to reset your password.",
    },
    () => ({
      badge: { icon: "lock_reset", tone: "primary" },
      heading: "Reset your password",
      intro:
        "We received a request to reset the password for your SyncforChange account. Click the button below to choose a new one.",
      cta: { label: "Reset Password", url: link },
      ctaNote: `This link expires in 1 hour. If the button doesn't work, copy and paste this URL: ${link}`,
      closing:
        "If you didn't request a password reset, your password is still safe — you can ignore this email.",
    })
  );
}

export async function sendWelcomeEmail(to: string): Promise<void> {
  await send(
    {
      to,
      subject: "Welcome to SyncforChange — you're in!",
      preheader: "Your account is verified. Set up your profile and submit your first event.",
    },
    () => ({
      badge: { icon: "check_circle", tone: "primary" },
      heading: "You're verified — welcome aboard",
      intro:
        "Your SyncforChange account is ready. You can now submit events to the community calendar. The next step is setting up your organizer profile so attendees know who you are.",
      steps: [
        "Complete your organizer profile (name, type, mission, location).",
        "Submit your first event — our team reviews it within 24–48 hours.",
        "Once approved, your event goes live on the public calendar.",
      ],
      cta: { label: "Set up my profile", url: `${appUrl()}/profile/setup` },
      closing:
        "Thanks for sharing your work with the community. We're excited to have you.",
    })
  );
}

// ────────────────────────────────────────────────────────────────────
// Event lifecycle emails
// ────────────────────────────────────────────────────────────────────

export interface EventEmailContext {
  organizerEmail: string;
  organizerName?: string | null;
  eventTitle: string;
  eventSlug: string;
  startsAt: Date | string;
  locationName: string;
  hostName: string;
}

function startsAtDisplay(startsAt: Date | string): string {
  const d = typeof startsAt === "string" ? new Date(startsAt) : startsAt;
  return format(d, "EEEE, MMM d, yyyy 'at' h:mm a");
}

export async function sendEventSubmittedEmail(ctx: EventEmailContext): Promise<void> {
  await send(
    {
      to: ctx.organizerEmail,
      subject: `We received your submission: ${ctx.eventTitle}`,
      preheader: "Your event is in the review queue. We'll let you know when it's approved.",
    },
    () => ({
      badge: { icon: "send", tone: "primary" },
      heading: "Submission received",
      intro: `Thanks${ctx.organizerName ? `, ${ctx.organizerName}` : ""}. Your event has been submitted to SyncforChange and is now in the moderation queue. Here's what we have on file:`,
      facts: [
        { label: "Event", value: ctx.eventTitle },
        { label: "Host", value: ctx.hostName },
        { label: "When", value: startsAtDisplay(ctx.startsAt) },
        { label: "Where", value: ctx.locationName },
      ],
      callout: {
        tone: "info",
        text: "Most submissions are reviewed within 24–48 hours. You'll get another email the moment it's approved (or if we need changes).",
      },
      cta: { label: "View submission status", url: `${appUrl()}/profile/setup` },
      closing:
        "Need to update something? Reply to this email and our team will help.",
    })
  );
}

export async function sendNewSubmissionAlertEmail(
  adminEmails: string[],
  ctx: EventEmailContext
): Promise<void> {
  if (adminEmails.length === 0) return;
  await send(
    {
      to: adminEmails,
      subject: `New event awaiting review: ${ctx.eventTitle}`,
      preheader: `Submitted by ${ctx.hostName}`,
    },
    () => ({
      badge: { icon: "notifications", tone: "tertiary" },
      heading: "New event awaiting review",
      intro: `A new event has just been submitted to SyncforChange. Open the moderation queue to review and approve or reject it.`,
      facts: [
        { label: "Event", value: ctx.eventTitle },
        { label: "Host", value: ctx.hostName },
        { label: "When", value: startsAtDisplay(ctx.startsAt) },
        { label: "Where", value: ctx.locationName },
        { label: "Submitted by", value: ctx.organizerEmail },
      ],
      cta: { label: "Open moderation queue", url: `${appUrl()}/admin/moderation` },
    })
  );
}

export async function sendEventApprovedEmail(ctx: EventEmailContext): Promise<void> {
  await send(
    {
      to: ctx.organizerEmail,
      subject: `Approved: ${ctx.eventTitle} is now live`,
      preheader: "Your event is published on the SyncforChange calendar.",
    },
    () => ({
      badge: { icon: "event_available", tone: "primary" },
      heading: "Your event is live",
      intro: `Great news${ctx.organizerName ? `, ${ctx.organizerName}` : ""} — your event has been approved and is now visible on the SyncforChange community calendar.`,
      facts: [
        { label: "Event", value: ctx.eventTitle },
        { label: "When", value: startsAtDisplay(ctx.startsAt) },
        { label: "Where", value: ctx.locationName },
      ],
      cta: { label: "View live event", url: `${appUrl()}/events/${ctx.eventSlug}` },
      closing:
        "Share the event page with your community to drive RSVPs. Good luck with the event!",
    })
  );
}

export interface RejectionEmailContext extends EventEmailContext {
  reason: string;
}

export async function sendEventRejectedEmail(ctx: RejectionEmailContext): Promise<void> {
  await send(
    {
      to: ctx.organizerEmail,
      subject: `Update needed: ${ctx.eventTitle}`,
      preheader: "Our team needs some changes before this event can go live.",
    },
    () => ({
      badge: { icon: "warning", tone: "warning" },
      heading: "Your submission needs an update",
      intro: `Hi${ctx.organizerName ? ` ${ctx.organizerName}` : ""}, our moderation team reviewed "${ctx.eventTitle}" and would like some changes before publishing it.`,
      callout: {
        tone: "warning",
        text: ctx.reason,
      },
      facts: [
        { label: "Event", value: ctx.eventTitle },
        { label: "When", value: startsAtDisplay(ctx.startsAt) },
        { label: "Where", value: ctx.locationName },
      ],
      cta: { label: "Submit a new version", url: `${appUrl()}/submit` },
      closing:
        "Address the feedback above and submit again — we'll fast-track the next review. Reply to this email if you have questions.",
    })
  );
}

// ────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────

export async function getAdminEmails(): Promise<string[]> {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { email: true },
  });
  return admins.map((a) => a.email);
}

/** Wrap a notification call in a try/catch so failures don't break the action. */
export async function safeSend(
  label: string,
  fn: () => Promise<void>
): Promise<void> {
  try {
    await fn();
  } catch (err) {
    console.error(`Email failed (${label}):`, err);
  }
}
