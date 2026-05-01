/**
 * Shared SyncforChange branded email template.
 * Renders a structured content object into a responsive HTML email
 * that works in major mail clients (Gmail, Outlook, Apple Mail).
 *
 * Brand:
 *   - Primary green   #4a8763 → #006c48 gradient
 *   - Light tertiary  #a3d9b3
 *   - Surface         #fcf9f8 (warm off-white)
 *   - Surface low     #f6f3f2
 *   - Text            #1b1c1c
 *   - Muted text      #9a9a9a
 *   - Error           #c43d3d
 */

const COLOR = {
  primary: "#4a8763",
  primaryDark: "#006c48",
  primaryLight: "#a3d9b3",
  surface: "#fcf9f8",
  surfaceLow: "#f6f3f2",
  text: "#1b1c1c",
  textMuted: "#5b5b5b",
  textFaint: "#9a9a9a",
  border: "#e7e5e4",
  error: "#c43d3d",
  errorBg: "#fdecec",
};

export interface EmailFact {
  label: string;
  value: string;
}

export interface EmailContent {
  /** Short, non-displayed preview text shown by mail clients */
  preheader?: string;
  /** Optional Material Symbols icon name (rendered as emoji-style large character at top of body) */
  badge?: { icon: string; tone?: "primary" | "tertiary" | "error" | "warning" };
  /** Big heading */
  heading: string;
  /** Lead paragraph */
  intro: string;
  /** Key/value facts displayed as a clean card */
  facts?: EmailFact[];
  /** Numbered or bulleted "what happens next" steps */
  steps?: string[];
  /** Highlighted callout box (info or quote) */
  callout?: { tone?: "info" | "warning" | "error"; text: string };
  /** Primary CTA button */
  cta?: { label: string; url: string };
  /** Secondary muted footnote shown below the CTA */
  ctaNote?: string;
  /** Closing paragraph after CTA */
  closing?: string;
}

export interface BuiltEmail {
  html: string;
  text: string;
}

const ICON_MAP: Record<string, string> = {
  check_circle: "✓",
  cancel: "✕",
  mark_email_read: "✉",
  lock_reset: "🔒",
  key: "🔑",
  edit_calendar: "🗓",
  send: "✈",
  pending_actions: "⏳",
  event_available: "🎉",
  notifications: "🔔",
  warning: "⚠",
};

function iconChar(name: string): string {
  return ICON_MAP[name] ?? "•";
}

function toneBg(tone: NonNullable<NonNullable<EmailContent["badge"]>["tone"]>): string {
  switch (tone) {
    case "tertiary":
      return "#fde7c7";
    case "error":
      return COLOR.errorBg;
    case "warning":
      return "#fff4d6";
    default:
      return "#dcefe2";
  }
}
function toneFg(tone: NonNullable<NonNullable<EmailContent["badge"]>["tone"]>): string {
  switch (tone) {
    case "tertiary":
      return "#c97e2a";
    case "error":
      return COLOR.error;
    case "warning":
      return "#a47600";
    default:
      return COLOR.primaryDark;
  }
}

export function buildEmailHtml(content: EmailContent): string {
  const {
    preheader,
    badge,
    heading,
    intro,
    facts,
    steps,
    callout,
    cta,
    ctaNote,
    closing,
  } = content;

  const factsHtml = facts && facts.length > 0
    ? `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 0;background:${COLOR.surfaceLow};border-radius:16px;">
        ${facts
          .map(
            (f, i) => `
          <tr>
            <td style="padding:14px 20px;${i < facts.length - 1 ? `border-bottom:1px solid ${COLOR.border};` : ""}">
              <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.12em;color:${COLOR.textFaint};margin-bottom:4px;">${escapeHtml(f.label)}</div>
              <div style="font-size:14px;font-weight:700;color:${COLOR.text};line-height:1.4;">${escapeHtml(f.value)}</div>
            </td>
          </tr>`
          )
          .join("")}
      </table>`
    : "";

  const stepsHtml = steps && steps.length > 0
    ? `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 0;">
        ${steps
          .map(
            (s, i) => `
          <tr>
            <td valign="top" style="padding:6px 0;width:32px;">
              <div style="width:24px;height:24px;background:${COLOR.primary};color:#ffffff;border-radius:50%;font-size:12px;font-weight:800;text-align:center;line-height:24px;">${i + 1}</div>
            </td>
            <td valign="top" style="padding:6px 0 6px 12px;">
              <p style="margin:0;font-size:14px;line-height:1.55;color:${COLOR.text};">${s}</p>
            </td>
          </tr>`
          )
          .join("")}
      </table>`
    : "";

  const calloutHtml = callout
    ? (() => {
        const tone = callout.tone ?? "info";
        const bg = tone === "error" ? COLOR.errorBg : tone === "warning" ? "#fff4d6" : "#eaf3ee";
        const fg = tone === "error" ? COLOR.error : tone === "warning" ? "#a47600" : COLOR.primaryDark;
        return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 0;">
          <tr>
            <td style="padding:16px 20px;background:${bg};border-radius:14px;border-left:3px solid ${fg};">
              <p style="margin:0;font-size:13px;line-height:1.6;color:${fg};font-weight:500;">${escapeHtml(callout.text)}</p>
            </td>
          </tr>
        </table>`;
      })()
    : "";

  const ctaHtml = cta
    ? `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:32px 0 0;">
        <tr>
          <td style="background:linear-gradient(135deg,${COLOR.primary},${COLOR.primaryDark});border-radius:14px;">
            <a href="${escapeAttr(cta.url)}"
              style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:0.2px;">
              ${escapeHtml(cta.label)} →
            </a>
          </td>
        </tr>
      </table>`
    : "";

  const ctaNoteHtml = ctaNote
    ? `<p style="margin:14px 0 0;font-size:12px;color:${COLOR.textFaint};line-height:1.6;">${escapeHtml(ctaNote)}</p>`
    : "";

  const closingHtml = closing
    ? `<p style="margin:24px 0 0;font-size:14px;line-height:1.65;color:${COLOR.textMuted};">${escapeHtml(closing)}</p>`
    : "";

  const badgeHtml = badge
    ? `
      <div style="margin:0 0 20px;">
        <span style="display:inline-block;width:48px;height:48px;background:${toneBg(badge.tone ?? "primary")};color:${toneFg(badge.tone ?? "primary")};border-radius:14px;text-align:center;line-height:48px;font-size:22px;">${iconChar(badge.icon)}</span>
      </div>`
    : "";

  const preheaderHtml = preheader
    ? `<div style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader)}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background:${COLOR.surface};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',sans-serif;color:${COLOR.text};-webkit-font-smoothing:antialiased;">
${preheaderHtml}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLOR.surface};">
  <tr>
    <td align="center" style="padding:32px 16px 48px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 12px 40px rgba(27,28,28,0.06);">

        <!-- Brand header -->
        <tr>
          <td style="padding:24px 32px;background:linear-gradient(135deg,${COLOR.primary},${COLOR.primaryDark});">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="vertical-align:middle;padding-right:10px;">
                  <div style="width:32px;height:32px;background:#ffffff;border-radius:10px;text-align:center;line-height:32px;color:${COLOR.primaryDark};font-weight:900;font-size:16px;">S</div>
                </td>
                <td style="vertical-align:middle;">
                  <span style="color:#ffffff;font-size:18px;font-weight:900;letter-spacing:-0.3px;">Sync<span style="color:${COLOR.primaryLight};">for</span>Change</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 32px 28px;">
            ${badgeHtml}
            <h1 style="margin:0;font-size:22px;line-height:1.3;font-weight:800;letter-spacing:-0.4px;color:${COLOR.text};">${escapeHtml(heading)}</h1>
            <p style="margin:14px 0 0;font-size:15px;line-height:1.65;color:${COLOR.textMuted};">${escapeHtml(intro)}</p>
            ${factsHtml}
            ${calloutHtml}
            ${stepsHtml}
            ${ctaHtml}
            ${ctaNoteHtml}
            ${closingHtml}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;background:${COLOR.surfaceLow};border-top:1px solid ${COLOR.border};">
            <p style="margin:0;font-size:12px;line-height:1.6;color:${COLOR.textFaint};">
              You received this email from <strong style="color:${COLOR.textMuted};">SyncforChange</strong>, the community calendar.
              If this wasn&rsquo;t you, you can safely ignore it.
            </p>
          </td>
        </tr>
      </table>

      <p style="margin:20px 0 0;font-size:11px;color:${COLOR.textFaint};">© SyncforChange · Connecting communities through events</p>
    </td>
  </tr>
</table>
</body>
</html>`;
}

export function buildEmailText(content: EmailContent): string {
  const lines: string[] = [];
  lines.push(content.heading.toUpperCase());
  lines.push("=".repeat(Math.min(60, content.heading.length)));
  lines.push("");
  lines.push(stripHtml(content.intro));

  if (content.facts && content.facts.length) {
    lines.push("");
    for (const f of content.facts) {
      lines.push(`${f.label}: ${f.value}`);
    }
  }
  if (content.callout) {
    lines.push("");
    lines.push(`> ${stripHtml(content.callout.text)}`);
  }
  if (content.steps && content.steps.length) {
    lines.push("");
    content.steps.forEach((s, i) => lines.push(`${i + 1}. ${stripHtml(s)}`));
  }
  if (content.cta) {
    lines.push("");
    lines.push(`${content.cta.label.toUpperCase()}:`);
    lines.push(content.cta.url);
  }
  if (content.ctaNote) {
    lines.push("");
    lines.push(stripHtml(content.ctaNote));
  }
  if (content.closing) {
    lines.push("");
    lines.push(stripHtml(content.closing));
  }
  lines.push("");
  lines.push("---");
  lines.push("SyncforChange · Connecting communities through events");
  return lines.join("\n");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function escapeAttr(s: string): string {
  return s.replace(/"/g, "&quot;");
}
function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}
