import "server-only";
import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!_resend) _resend = new Resend(key);
  return _resend;
}

export type EmailSendInput = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  reply_to?: string;
  // Outbound message-id to thread inbound replies back to a ticket.
  // We let Resend pick a Message-ID and capture it back via the API id.
  tags?: { name: string; value: string }[];
};

export type EmailSendResult =
  | { ok: true; id: string }
  | { ok: false; reason: "no_api_key" | "send_failed"; error?: string };

export async function sendEmail(input: EmailSendInput): Promise<EmailSendResult> {
  const r = getResend();
  if (!r) {
    console.warn("[email] RESEND_API_KEY missing — skipping send");
    return { ok: false, reason: "no_api_key" };
  }
  const from = process.env.RESEND_FROM || "ifBash <noreply@entyti.com>";
  const overrideTo = process.env.RESEND_TEST_TO_OVERRIDE;

  try {
    const html = input.html ?? `<pre>${(input.text ?? "").replace(/[<>&]/g, "")}</pre>`;
    const result = await r.emails.send({
      from,
      to: overrideTo || input.to,
      subject: input.subject,
      html,
      text: input.text,
      replyTo: input.reply_to,
      tags: input.tags,
    });
    if (result.error) {
      return { ok: false, reason: "send_failed", error: result.error.message };
    }
    return { ok: true, id: result.data?.id ?? "" };
  } catch (err) {
    return {
      ok: false,
      reason: "send_failed",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
