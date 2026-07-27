import {NextResponse} from "next/server";
import {ensureRecurringPlan, isReconciliationCandidate} from "@/lib/billing";
import {getCronSecret, isBillingEnabled} from "@/lib/env";
import {apiError} from "@/lib/http";
import {createSupabaseAdmin} from "@/lib/supabase/admin";
import {verifyXenditWebhookToken} from "@/lib/xendit";

export async function GET(request: Request) {
  const secret = getCronSecret();
  const authorization = request.headers.get("authorization");
  const received = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  if (!secret || !verifyXenditWebhookToken(received, secret)) {
    return apiError("FORBIDDEN", "Invalid reconciliation credentials.", 401);
  }
  if (!isBillingEnabled()) return apiError("NOT_CONFIGURED", "Billing is disabled.", 503);

  const admin = createSupabaseAdmin();
  if (!admin) return apiError("NOT_CONFIGURED", "Billing storage is not configured.", 503);
  const {data, error} = await admin
    .from("billing_checkout_sessions")
    .select("reference_id, payment_succeeded, provider_payment_token_id, provider_recurring_plan_id")
    .eq("payment_succeeded", true)
    .not("provider_payment_token_id", "is", null)
    .is("provider_recurring_plan_id", null)
    .limit(50);
  if (error) return apiError("INTERNAL_ERROR", "Unable to load reconciliation queue.", 500);

  const candidates = (data ?? []).filter(isReconciliationCandidate);
  const results = await Promise.allSettled(candidates.map((row) => ensureRecurringPlan(admin, row.reference_id)));
  const failed = results.filter((result) => result.status === "rejected").length;
  console.info(JSON.stringify({level: "info", message: "billing.reconciliation", checked: results.length, failed}));
  return NextResponse.json({ok: failed === 0, checked: results.length, failed}, {status: failed ? 500 : 200});
}
