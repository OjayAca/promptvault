import {NextResponse} from "next/server";
import {hasPremiumAccess} from "@/lib/access";
import {requireApiUser} from "@/lib/auth";
import {isBillingEnabled} from "@/lib/env";
import {assertSameOrigin, HttpError, toApiError} from "@/lib/http";
import {createSupabaseAdmin} from "@/lib/supabase/admin";
import {createCheckoutReference, createHostedPaymentSession} from "@/lib/xendit";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await requireApiUser();
    if (!user.emailVerified) throw new HttpError("FORBIDDEN", "Verify your email before checkout.", 403);
    if (!user.email || !user.profile?.fullName || !user.profile.mobileNumber) {
      throw new HttpError("BAD_REQUEST", "Complete your full name and Philippine mobile number before checkout.", 400);
    }
    if (user.email.length > 50) {
      throw new HttpError("BAD_REQUEST", "Xendit checkout requires an email address of at most 50 characters.", 400);
    }
    if (hasPremiumAccess(user.profile, user.subscription)) {
      throw new HttpError("CONFLICT", "Your Founding access is already active.", 409);
    }
    if (!isBillingEnabled()) throw new HttpError("NOT_CONFIGURED", "Paid checkout is not available yet.", 503);

    const admin = createSupabaseAdmin();
    if (!admin) throw new HttpError("NOT_CONFIGURED", "Billing storage is not configured.", 503);

    const pendingSince = new Date(Date.now() - 60_000).toISOString();
    const {data: recent} = await admin
      .from("billing_checkout_sessions")
      .select("id")
      .eq("user_id", user.id)
      .in("status", ["creating", "pending"])
      .gte("created_at", pendingSince)
      .limit(1);
    if (recent?.length) throw new HttpError("RATE_LIMITED", "A checkout was just created. Please wait a minute.", 429);

    const referenceId = createCheckoutReference(user.id);
    const {error: insertError} = await admin.from("billing_checkout_sessions").insert({
      user_id: user.id,
      reference_id: referenceId,
      status: "creating",
    });
    if (insertError) throw insertError;

    try {
      const session = await createHostedPaymentSession(
        {
          userId: user.id,
          email: user.email,
          fullName: user.profile.fullName,
          mobileNumber: user.profile.mobileNumber,
        },
        referenceId,
      );
      if (!session.payment_session_id || !session.payment_link_url) {
        throw new Error("Xendit did not return a hosted checkout URL.");
      }

      const now = new Date().toISOString();
      const [{error: checkoutError}, {error: subscriptionError}] = await Promise.all([
        admin
          .from("billing_checkout_sessions")
          .update({
            provider_session_id: session.payment_session_id,
            provider_customer_id: session.customer_id,
            status: "pending",
            updated_at: now,
          })
          .eq("reference_id", referenceId),
        admin.from("subscriptions").upsert(
          {
            user_id: user.id,
            plan: "Founding",
            status: "pending",
            provider: "xendit",
            provider_checkout_id: referenceId,
            provider_customer_id: session.customer_id,
            provider_subscription_id: null,
            provider_payment_token_id: null,
            provider_last_cycle_id: null,
            provider_last_cycle_number: null,
            provider_event_id: null,
            provider_event_created_at: null,
            grace_until: null,
            cancelled_at: null,
            updated_at: now,
          },
          {onConflict: "user_id"},
        ),
      ]);
      if (checkoutError) throw checkoutError;
      if (subscriptionError) throw subscriptionError;

      return NextResponse.json(
        {checkoutUrl: session.payment_link_url},
        {headers: {"cache-control": "private, no-store, max-age=0"}},
      );
    } catch (error) {
      await admin
        .from("billing_checkout_sessions")
        .update({
          status: "failed",
          last_error: error instanceof Error ? error.message.slice(0, 500) : "Checkout creation failed.",
          updated_at: new Date().toISOString(),
        })
        .eq("reference_id", referenceId);
      throw error;
    }
  } catch (error) {
    return toApiError(error);
  }
}
