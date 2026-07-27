import {NextResponse} from "next/server";
import {cancellationUpdate} from "@/lib/billing";
import {requireApiUser} from "@/lib/auth";
import {assertSameOrigin, HttpError, toApiError} from "@/lib/http";
import {createSupabaseAdmin} from "@/lib/supabase/admin";
import {deactivateXenditRecurringPlan, XenditError} from "@/lib/xendit";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireApiUser();
    const subscription = user.subscription;
    if (!subscription?.providerSubscriptionId) {
      throw new HttpError("BAD_REQUEST", "There is no recurring plan to cancel.", 400);
    }
    if (subscription.status === "cancelled") {
      return NextResponse.json({ok: true, accessUntil: subscription.accessUntil});
    }

    try {
      await deactivateXenditRecurringPlan(subscription.providerSubscriptionId);
    } catch (error) {
      if (!(error instanceof XenditError && error.status === 404)) throw error;
    }
    const admin = createSupabaseAdmin();
    if (!admin) throw new HttpError("NOT_CONFIGURED", "Billing storage is not configured.", 503);
    const now = new Date().toISOString();
    const {error} = await admin
      .from("subscriptions")
      .update({...cancellationUpdate(now), updated_at: now})
      .eq("user_id", user.id)
      .eq("provider_subscription_id", subscription.providerSubscriptionId);
    if (error) throw error;

    return NextResponse.json(
      {ok: true, accessUntil: subscription.accessUntil},
      {headers: {"cache-control": "private, no-store, max-age=0"}},
    );
  } catch (error) {
    return toApiError(error);
  }
}
