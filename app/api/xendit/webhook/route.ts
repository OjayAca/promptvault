import {NextResponse} from "next/server";
import {isProcessedWebhookStatus, parseXenditWebhook, processXenditEvent, XENDIT_EVENTS} from "@/lib/billing";
import {getXenditConfig} from "@/lib/env";
import {apiError} from "@/lib/http";
import {createSupabaseAdmin} from "@/lib/supabase/admin";
import {verifyXenditWebhookToken} from "@/lib/xendit";

export async function POST(request: Request) {
  const config = getXenditConfig();
  if (!config) return apiError("NOT_CONFIGURED", "Billing webhook is disabled.", 503);
  if (!verifyXenditWebhookToken(request.headers.get("x-callback-token"), config.webhookToken)) {
    return apiError("FORBIDDEN", "Invalid webhook token.", 401);
  }

  const webhookId = request.headers.get("webhook-id") ?? request.headers.get("x-webhook-id");
  if (!webhookId || !/^[a-zA-Z0-9_-]{1,200}$/.test(webhookId)) {
    return apiError("BAD_REQUEST", "A valid webhook-id header is required.", 400);
  }
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 1_000_000) return apiError("BAD_REQUEST", "Webhook payload is too large.", 413);

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return apiError("BAD_REQUEST", "Webhook body must be valid JSON.", 400);
  }
  const event = parseXenditWebhook(raw);
  if (!event) return apiError("BAD_REQUEST", "Webhook payload is invalid.", 400);
  if (event.business_id !== config.businessId) return apiError("FORBIDDEN", "Webhook business is not recognized.", 403);
  if (!XENDIT_EVENTS.has(event.event)) return apiError("BAD_REQUEST", "Webhook event is not supported.", 400);

  const admin = createSupabaseAdmin();
  if (!admin) return apiError("NOT_CONFIGURED", "Billing storage is not configured.", 503);
  const inserted = await admin.from("billing_events").insert({
    webhook_id: webhookId,
    event_type: event.event,
    business_id: event.business_id,
    payload: raw,
    status: "processing",
  });

  if (inserted.error) {
    if (inserted.error.code !== "23505") {
      log("error", "billing.webhook_store_failed", {webhookId, event: event.event, error: inserted.error.message});
      return apiError("INTERNAL_ERROR", "Unable to record webhook.", 500);
    }
    const {data: existing} = await admin.from("billing_events").select("status").eq("webhook_id", webhookId).maybeSingle();
    if (isProcessedWebhookStatus(existing?.status)) {
      return NextResponse.json({ok: true, duplicate: true});
    }
    await admin
      .from("billing_events")
      .update({status: "processing", processing_error: null, processed_at: null})
      .eq("webhook_id", webhookId);
  }

  try {
    await processXenditEvent(admin, webhookId, event);
    await admin
      .from("billing_events")
      .update({status: "completed", processing_error: null, processed_at: new Date().toISOString()})
      .eq("webhook_id", webhookId);
    log("info", "billing.webhook_completed", {webhookId, event: event.event});
    return NextResponse.json({ok: true});
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown webhook processing error.";
    await admin
      .from("billing_events")
      .update({status: "failed", processing_error: message.slice(0, 1000), processed_at: new Date().toISOString()})
      .eq("webhook_id", webhookId);
    log("error", "billing.webhook_failed", {webhookId, event: event.event, error: message});
    return apiError("INTERNAL_ERROR", "Webhook processing failed.", 500);
  }
}

function log(level: "info" | "error", message: string, details: Record<string, unknown>) {
  const line = JSON.stringify({level, message, ...details});
  if (level === "error") console.error(line);
  else console.info(line);
}
