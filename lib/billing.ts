import type {SupabaseClient} from "@supabase/supabase-js";
import {addCalendarMonth} from "@/lib/validation";
import {
  checkoutReferenceFromRecurring,
  createXenditRecurringPlan,
  FOUNDING_PRICE_PHP,
} from "@/lib/xendit";

export const XENDIT_EVENTS = new Set([
  "payment_session.completed",
  "payment_session.expired",
  "payment.succeeded",
  "payment.capture",
  "payment_token.activation",
  "payment_token.activated",
  "payment_token.failure",
  "payment_token.expiry",
  "recurring.plan.activated",
  "recurring.plan.inactivated",
  "recurring.cycle.created",
  "recurring.cycle.retrying",
  "recurring.cycle.succeeded",
  "recurring.cycle.failed",
]);

export type XenditWebhook = {
  event: string;
  business_id: string;
  created: string;
  data: Record<string, unknown>;
};

export function isProcessedWebhookStatus(status: unknown) {
  return status === "completed" || status === "ignored" || status === "processing";
}

export function cancellationUpdate(cancelledAt: string) {
  if (!validDate(cancelledAt)) throw new Error("Invalid cancellation timestamp.");
  return {status: "cancelled", cancelled_at: cancelledAt, grace_until: null};
}

export function isReconciliationCandidate(row: {
  payment_succeeded: boolean;
  provider_payment_token_id: string | null;
  provider_recurring_plan_id: string | null;
}) {
  return row.payment_succeeded && Boolean(row.provider_payment_token_id) && !row.provider_recurring_plan_id;
}

type CheckoutRow = {
  user_id: string;
  reference_id: string;
  provider_session_id: string | null;
  provider_customer_id: string | null;
  provider_payment_token_id: string | null;
  provider_recurring_plan_id: string | null;
  payment_succeeded: boolean;
  status: string;
};

type SubscriptionRow = {
  user_id: string;
  status: string;
  provider_subscription_id: string | null;
  provider_last_cycle_number: number | null;
  provider_event_created_at: string | null;
  access_until: string | null;
  grace_until: string | null;
  cancelled_at: string | null;
  current_period_end: string | null;
};

export function cycleSubscriptionUpdate(
  subscription: SubscriptionRow,
  event: XenditWebhook,
  webhookId: string,
): Record<string, unknown> | null {
  const cycleNumber = numberValue(event.data.cycle_number);
  const cycleId = stringValue(event.data.id);
  const planId = stringValue(event.data.plan_id);
  if (!cycleNumber || !cycleId || !planId) throw new Error("Recurring cycle event is incomplete.");
  if (subscription.provider_last_cycle_number && cycleNumber < subscription.provider_last_cycle_number) return null;
  if (
    subscription.provider_last_cycle_number === cycleNumber &&
    subscription.status === "active" &&
    event.event !== "recurring.cycle.succeeded"
  ) {
    return null;
  }
  if (subscription.provider_last_cycle_number === cycleNumber && !isNewerEvent(subscription, event.created)) return null;

  const scheduledAt =
    stringValue(event.data.scheduled_timestamp) ??
    stringValue(event.data.created) ??
    subscription.current_period_end ??
    event.created;
  const common = {
    provider_subscription_id: planId,
    provider_last_cycle_id: cycleId,
    provider_last_cycle_number: cycleNumber,
    provider_event_id: webhookId,
    provider_event_created_at: event.created,
  };

  if (subscription.cancelled_at) {
    if (event.event === "recurring.cycle.succeeded") {
      const window = successfulCycleWindow(subscription.access_until, scheduledAt);
      return {...common, plan: "Founding", status: "cancelled", ...snakeWindow(window), grace_until: null};
    }
    return {...common, status: "cancelled", grace_until: null};
  }

  if (event.event === "recurring.cycle.succeeded") {
    const window = successfulCycleWindow(subscription.access_until, scheduledAt);
    return {...common, plan: "Founding", status: "active", ...snakeWindow(window), grace_until: null};
  }
  if (event.event === "recurring.cycle.retrying") {
    return {...common, status: "past_due", grace_until: retryGraceUntil(scheduledAt)};
  }
  if (event.event === "recurring.cycle.failed") {
    return {...common, status: "expired", grace_until: event.created};
  }
  return common;
}

export function parseXenditWebhook(value: unknown): XenditWebhook | null {
  if (!isRecord(value) || typeof value.event !== "string" || typeof value.business_id !== "string" || !isRecord(value.data)) {
    return null;
  }

  const created = typeof value.created === "string" && validDate(value.created) ? value.created : new Date().toISOString();
  return {event: value.event, business_id: value.business_id, created, data: value.data};
}

export function initialAccessWindow(paidAt: string) {
  const start = new Date(paidAt);
  if (Number.isNaN(start.getTime())) throw new Error("Invalid payment timestamp.");
  const end = addCalendarMonth(start);
  return {currentPeriodStart: start.toISOString(), currentPeriodEnd: end.toISOString(), accessUntil: end.toISOString()};
}

export function successfulCycleWindow(previousAccessUntil: string | null, scheduledAt: string) {
  const scheduled = new Date(scheduledAt);
  if (Number.isNaN(scheduled.getTime())) throw new Error("Invalid cycle timestamp.");
  const previous = previousAccessUntil ? new Date(previousAccessUntil) : null;
  const start = previous && !Number.isNaN(previous.getTime()) && previous > scheduled ? previous : scheduled;
  const end = addCalendarMonth(start);
  return {currentPeriodStart: start.toISOString(), currentPeriodEnd: end.toISOString(), accessUntil: end.toISOString()};
}

export function retryGraceUntil(scheduledAt: string) {
  const start = new Date(scheduledAt);
  if (Number.isNaN(start.getTime())) throw new Error("Invalid retry timestamp.");
  start.setUTCDate(start.getUTCDate() + 3);
  return start.toISOString();
}

export async function ensureRecurringPlan(admin: SupabaseClient, referenceId: string) {
  const {data, error} = await admin
    .from("billing_checkout_sessions")
    .select("*")
    .eq("reference_id", referenceId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Checkout session not found.");

  const checkout = data as CheckoutRow;
  if (checkout.provider_recurring_plan_id) return checkout.provider_recurring_plan_id;
  if (!checkout.payment_succeeded || !checkout.provider_payment_token_id || !checkout.provider_customer_id) return null;

  const {data: subscriptionData, error: subscriptionError} = await admin
    .from("subscriptions")
    .select("access_until")
    .eq("user_id", checkout.user_id)
    .maybeSingle();
  if (subscriptionError) throw subscriptionError;
  const accessUntil = subscriptionData?.access_until as string | null;
  if (!accessUntil) return null;

  const plan = await createXenditRecurringPlan({
    referenceId: checkout.reference_id,
    customerId: checkout.provider_customer_id,
    paymentTokenId: checkout.provider_payment_token_id,
    accessUntil,
    userId: checkout.user_id,
  });
  if (!plan.id) throw new Error("Xendit did not return a recurring plan identifier.");

  const now = new Date().toISOString();
  const [{error: checkoutError}, {error: planError}] = await Promise.all([
    admin
      .from("billing_checkout_sessions")
      .update({provider_recurring_plan_id: plan.id, status: "plan_created", last_error: null, updated_at: now})
      .eq("reference_id", checkout.reference_id),
    admin
      .from("subscriptions")
      .update({provider_subscription_id: plan.id, updated_at: now})
      .eq("user_id", checkout.user_id),
  ]);
  if (checkoutError) throw checkoutError;
  if (planError) throw planError;
  return plan.id;
}

export async function processXenditEvent(admin: SupabaseClient, webhookId: string, event: XenditWebhook) {
  const checkout = await findCheckout(admin, event.data);
  if (!checkout) throw new Error("Webhook does not match a known PromptVault checkout.");

  switch (event.event) {
    case "payment_session.completed":
      await handleSessionCompleted(admin, checkout, event, webhookId);
      break;
    case "payment.succeeded":
    case "payment.capture":
      await handlePaymentSucceeded(admin, checkout, event, webhookId);
      break;
    case "payment_token.activation":
    case "payment_token.activated":
      await handleTokenActivated(admin, checkout, event);
      break;
    case "payment_session.expired":
      await updateCheckout(admin, checkout.reference_id, {status: "cancelled"});
      break;
    case "payment_token.failure":
    case "payment_token.expiry":
      await updateCheckout(admin, checkout.reference_id, {status: "failed", last_error: event.event});
      break;
    case "recurring.plan.activated":
      await handlePlanActivated(admin, checkout, event, webhookId);
      break;
    case "recurring.plan.inactivated":
      await handlePlanInactivated(admin, checkout, event, webhookId);
      break;
    case "recurring.cycle.created":
      await attachPlan(admin, checkout, event);
      break;
    case "recurring.cycle.retrying":
    case "recurring.cycle.succeeded":
    case "recurring.cycle.failed":
      await handleCycle(admin, checkout, event, webhookId);
      break;
    default:
      throw new Error("Unsupported Xendit event.");
  }

  if (
    event.event === "payment_session.completed" ||
    event.event === "payment.succeeded" ||
    event.event === "payment.capture" ||
    event.event === "payment_token.activation" ||
    event.event === "payment_token.activated"
  ) {
    await ensureRecurringPlan(admin, checkout.reference_id);
  }
}

async function handleSessionCompleted(admin: SupabaseClient, checkout: CheckoutRow, event: XenditWebhook, webhookId: string) {
  const status = stringValue(event.data.status);
  if (status && status !== "COMPLETED") throw new Error("Payment session is not completed.");
  assertFoundingPayment(event.data);
  const tokenId = stringValue(event.data.payment_token_id);
  const customerId = stringValue(event.data.customer_id);
  const sessionId = stringValue(event.data.payment_session_id);
  const paymentId = stringValue(event.data.payment_id);
  const window = initialAccessWindow(event.created);

  await updateCheckout(admin, checkout.reference_id, {
    payment_succeeded: true,
    status: "paid",
    provider_session_id: sessionId ?? checkout.provider_session_id,
    provider_customer_id: customerId ?? checkout.provider_customer_id,
    provider_payment_token_id: tokenId ?? checkout.provider_payment_token_id,
    provider_payment_id: paymentId,
  });
  await upsertPaidSubscription(admin, checkout.user_id, checkout.reference_id, customerId, tokenId, webhookId, event, window);
}

async function handlePaymentSucceeded(admin: SupabaseClient, checkout: CheckoutRow, event: XenditWebhook, webhookId: string) {
  const status = stringValue(event.data.status);
  if (status && status !== "SUCCEEDED") throw new Error("Payment has not succeeded.");
  assertFoundingPayment(event.data);
  const customerId = stringValue(event.data.customer_id);
  const tokenId = stringValue(event.data.payment_token_id);
  const paymentId = stringValue(event.data.payment_id);
  const window = initialAccessWindow(event.created);

  await updateCheckout(admin, checkout.reference_id, {
    payment_succeeded: true,
    status: "paid",
    provider_customer_id: customerId ?? checkout.provider_customer_id,
    provider_payment_token_id: tokenId ?? checkout.provider_payment_token_id,
    provider_payment_id: paymentId,
  });
  await upsertPaidSubscription(admin, checkout.user_id, checkout.reference_id, customerId, tokenId, webhookId, event, window);
}

async function handleTokenActivated(admin: SupabaseClient, checkout: CheckoutRow, event: XenditWebhook) {
  const status = stringValue(event.data.status);
  if (status && status !== "ACTIVE") throw new Error("Payment token is not active.");
  const tokenId = stringValue(event.data.payment_token_id);
  const customerId = stringValue(event.data.customer_id);
  if (!tokenId || !customerId) throw new Error("Payment token event is incomplete.");

  await updateCheckout(admin, checkout.reference_id, {
    provider_payment_token_id: tokenId,
    provider_customer_id: customerId,
  });
  await admin
    .from("subscriptions")
    .update({
      provider_payment_token_id: tokenId,
      provider_customer_id: customerId,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", checkout.user_id);
}

async function handlePlanActivated(admin: SupabaseClient, checkout: CheckoutRow, event: XenditWebhook, webhookId: string) {
  const planId = stringValue(event.data.id);
  if (!planId) throw new Error("Recurring plan event is incomplete.");
  await updateCheckout(admin, checkout.reference_id, {provider_recurring_plan_id: planId, status: "plan_created"});
  const subscription = await getSubscription(admin, checkout.user_id);
  if (!isNewerEvent(subscription, event.created)) return;

  await admin
    .from("subscriptions")
    .update({
      provider_subscription_id: planId,
      status: subscription.access_until && new Date(subscription.access_until) > new Date() ? "active" : subscription.status,
      provider_event_id: webhookId,
      provider_event_created_at: event.created,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", checkout.user_id);
}

async function handlePlanInactivated(admin: SupabaseClient, checkout: CheckoutRow, event: XenditWebhook, webhookId: string) {
  const subscription = await getSubscription(admin, checkout.user_id);
  if (!isNewerEvent(subscription, event.created)) return;
  const status = subscription.cancelled_at ? "cancelled" : "expired";
  await admin
    .from("subscriptions")
    .update({
      status,
      provider_event_id: webhookId,
      provider_event_created_at: event.created,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", checkout.user_id);
}

async function attachPlan(admin: SupabaseClient, checkout: CheckoutRow, event: XenditWebhook) {
  const planId = stringValue(event.data.plan_id);
  if (!planId) return;
  await updateCheckout(admin, checkout.reference_id, {provider_recurring_plan_id: planId, status: "plan_created"});
  await admin.from("subscriptions").update({provider_subscription_id: planId, updated_at: new Date().toISOString()}).eq("user_id", checkout.user_id);
}

async function handleCycle(admin: SupabaseClient, checkout: CheckoutRow, event: XenditWebhook, webhookId: string) {
  const subscription = await getSubscription(admin, checkout.user_id);
  const update = cycleSubscriptionUpdate(subscription, event, webhookId);
  if (!update) return;
  await admin
    .from("subscriptions")
    .update({...update, updated_at: new Date().toISOString()})
    .eq("user_id", checkout.user_id);
}

async function upsertPaidSubscription(
  admin: SupabaseClient,
  userId: string,
  checkoutReference: string,
  customerId: string | null,
  tokenId: string | null,
  webhookId: string,
  event: XenditWebhook,
  window: ReturnType<typeof initialAccessWindow>,
) {
  const {data: existing, error: readError} = await admin.from("subscriptions").select("*").eq("user_id", userId).maybeSingle();
  if (readError) throw readError;
  const existingAccess = existing?.access_until ? new Date(existing.access_until as string) : null;
  const incomingAccess = new Date(window.accessUntil);
  const preserveWindow = existingAccess && !Number.isNaN(existingAccess.getTime()) && existingAccess > incomingAccess;
  const establishedCycle = Boolean(existing?.provider_last_cycle_number);
  const cancelled = Boolean(existing?.cancelled_at);
  const newerEvent =
    !existing?.provider_event_created_at || new Date(event.created) >= new Date(existing.provider_event_created_at as string);
  const values = {
      user_id: userId,
      plan: "Founding",
      status: cancelled ? "cancelled" : establishedCycle ? existing.status : "active",
      provider: "xendit",
      provider_checkout_id: checkoutReference,
      provider_customer_id: customerId ?? existing?.provider_customer_id ?? null,
      provider_payment_token_id: tokenId ?? existing?.provider_payment_token_id ?? null,
      provider_event_id: newerEvent ? webhookId : existing?.provider_event_id ?? null,
      provider_event_created_at: newerEvent ? event.created : existing?.provider_event_created_at ?? null,
      ...(preserveWindow
        ? {
            current_period_start: existing?.current_period_start,
            current_period_end: existing?.current_period_end,
            access_until: existing?.access_until,
          }
        : snakeWindow(window)),
      grace_until: establishedCycle ? existing?.grace_until ?? null : null,
      cancelled_at: existing?.cancelled_at ?? null,
      updated_at: new Date().toISOString(),
    };
  const {error} = existing
    ? await admin.from("subscriptions").update(values).eq("user_id", userId)
    : await admin.from("subscriptions").insert(values);
  if (error) throw error;
}

async function findCheckout(admin: SupabaseClient, data: Record<string, unknown>) {
  const planId = stringValue(data.plan_id) ?? (stringValue(data.id)?.startsWith("repl_") ? stringValue(data.id) : null);
  if (planId) {
    const result = await admin
      .from("billing_checkout_sessions")
      .select("*")
      .eq("provider_recurring_plan_id", planId)
      .maybeSingle();
    if (result.error) throw result.error;
    if (result.data) return result.data as CheckoutRow;
  }

  const sessionId = stringValue(data.payment_session_id);
  if (sessionId) {
    const result = await admin.from("billing_checkout_sessions").select("*").eq("provider_session_id", sessionId).maybeSingle();
    if (result.error) throw result.error;
    if (result.data) return result.data as CheckoutRow;
  }

  const reference = stringValue(data.reference_id);
  if (!reference) return null;
  const checkoutReference = checkoutReferenceFromRecurring(reference);
  const result = await admin.from("billing_checkout_sessions").select("*").eq("reference_id", checkoutReference).maybeSingle();
  if (result.error) throw result.error;
  return result.data as CheckoutRow | null;
}

async function getSubscription(admin: SupabaseClient, userId: string) {
  const {data, error} = await admin.from("subscriptions").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Subscription record not found.");
  return data as SubscriptionRow;
}

async function updateCheckout(admin: SupabaseClient, referenceId: string, values: Record<string, unknown>) {
  const {error} = await admin
    .from("billing_checkout_sessions")
    .update({...values, updated_at: new Date().toISOString()})
    .eq("reference_id", referenceId);
  if (error) throw error;
}

function assertFoundingPayment(data: Record<string, unknown>) {
  const amount = numberValue(data.amount) ?? numberValue(data.request_amount);
  const currency = stringValue(data.currency);
  if (amount !== null && amount !== FOUNDING_PRICE_PHP) throw new Error("Payment amount does not match the Founding plan.");
  if (currency && currency !== "PHP") throw new Error("Payment currency does not match the Founding plan.");
}

function isNewerEvent(subscription: SubscriptionRow, created: string) {
  return !subscription.provider_event_created_at || new Date(created) >= new Date(subscription.provider_event_created_at);
}

function snakeWindow(window: ReturnType<typeof initialAccessWindow>) {
  return {
    current_period_start: window.currentPeriodStart,
    current_period_end: window.currentPeriodEnd,
    access_until: window.accessUntil,
  };
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validDate(value: string) {
  return !Number.isNaN(new Date(value).getTime());
}
