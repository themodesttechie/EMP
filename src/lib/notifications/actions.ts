import "server-only";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { sendEmail } from "./email";

export type NotificationChannel = "in_app" | "email" | "both";

export type CreateNotificationInput = {
  tenant_id: string;
  recipient_id: string;
  kind: string;
  subject: string;
  body_md: string;
  related_type?: string | null;
  related_id?: string | null;
  channel?: NotificationChannel;
};

export async function createNotification(
  input: CreateNotificationInput,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const admin = createAdminClient();
  const channel: NotificationChannel = input.channel ?? "in_app";

  const { data: row, error } = await admin
    .from("notifications")
    .insert({
      tenant_id: input.tenant_id,
      recipient_id: input.recipient_id,
      kind: input.kind,
      subject: input.subject,
      body_md: input.body_md,
      related_type: input.related_type ?? null,
      related_id: input.related_id ?? null,
      channel,
      delivery_status: channel === "in_app" ? "sent" : "pending",
      sent_at: channel === "in_app" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error || !row) return { ok: false, error: error?.message };
  const id = (row as { id: string }).id;

  if (channel === "email" || channel === "both") {
    // Look up recipient email
    const { data: prof } = await admin
      .from("profiles")
      .select("email, full_name")
      .eq("id", input.recipient_id)
      .maybeSingle();
    const email = (prof as { email?: string } | null)?.email;
    if (email) {
      const html = renderHtmlBody(input.subject, input.body_md);
      const sendResult = await sendEmail({
        to: email,
        subject: input.subject,
        html,
        text: input.body_md,
        tags: [
          { name: "kind", value: input.kind },
          { name: "related_type", value: input.related_type ?? "none" },
        ],
      });
      const updates: Record<string, unknown> =
        sendResult.ok
          ? { delivery_status: "sent", sent_at: new Date().toISOString() }
          : {
              delivery_status: "failed",
              delivery_error: sendResult.error ?? sendResult.reason,
            };
      await admin.from("notifications").update(updates).eq("id", id);
    } else {
      await admin
        .from("notifications")
        .update({ delivery_status: "failed", delivery_error: "no_email" })
        .eq("id", id);
    }
  }

  return { ok: true, id };
}

function renderHtmlBody(subject: string, bodyMd: string): string {
  // Tiny safe markdown-ish render: paragraphs + bold. No external deps.
  const escaped = bodyMd
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .split(/\n\n+/)
    .map((p) => `<p style="margin:0 0 12px 0;line-height:1.5;">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
  return `<!doctype html><html><body style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#0f172a;background:#f8fafc;padding:24px;">
    <div style="max-width:540px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;">
      <h1 style="font-size:18px;margin:0 0 16px 0;">${subject}</h1>
      ${escaped}
      <p style="font-size:12px;color:#64748b;margin-top:24px;">ifBash service desk</p>
    </div>
  </body></html>`;
}

export async function markRead(notificationId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
