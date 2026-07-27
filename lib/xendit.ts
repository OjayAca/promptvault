import {timingSafeEqual} from "node:crypto";
import {getAppUrl, getXenditConfig} from "@/lib/env";

const XENDIT_API = "https://api.xendit.co";
export const FOUNDING_PRICE_PHP = 99;

type CustomerInput = {
  userId: string;
  email: string;
  fullName: string;
  mobileNumber: string;
};

type RecurringInput = {
  referenceId: string;
  customerId: string;
  paymentTokenId: string;
  accessUntil: string;
  userId: string;
};

export type XenditSession = {
  payment_session_id: string;
  payment_link_url: string;
  customer_id: string | null;
  reference_id: string;
};

export type XenditRecurringPlan = {
  id: string;
  reference_id: string;
  customer_id: string;
  status: string;
};

export function verifyXenditWebhookToken(received: string | null, expected: string) {
  if (!received) return false;
  const left = Buffer.from(received);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function buildPaymentSessionPayload(customer: CustomerInput, referenceId: string, appUrl = getAppUrl()) {
  const name = xenditName(customer.fullName);

  return {
    reference_id: referenceId,
    session_type: "PAY",
    mode: "PAYMENT_LINK",
    amount: FOUNDING_PRICE_PHP,
    currency: "PHP",
    country: "PH",
    locale: "en",
    allow_save_payment_method: "FORCED",
    capture_method: "AUTOMATIC",
    customer: {
      reference_id: `pv${customer.userId.replaceAll("-", "")}`,
      type: "INDIVIDUAL",
      email: customer.email,
      mobile_number: customer.mobileNumber,
      individual_detail: {
        given_names: name.givenNames,
        ...(name.surname ? {surname: name.surname} : {}),
      },
    },
    items: [
      {
        reference_id: "founding_monthly",
        name: "PromptVault PH Founding membership",
        description: "First month of premium prompt access",
        type: "DIGITAL_SERVICE",
        category: "Software subscription",
        net_unit_amount: FOUNDING_PRICE_PHP,
        quantity: 1,
        currency: "PHP",
        url: `${appUrl}/pricing`,
      },
    ],
    description: "PromptVault PH Founding membership - first month",
    success_return_url: `${appUrl}/billing?checkout=success`,
    cancel_return_url: `${appUrl}/billing?checkout=cancelled`,
    metadata: {
      user_id: customer.userId,
      checkout_reference: referenceId,
    },
  };
}

export function buildRecurringPlanPayload(input: RecurringInput) {
  return {
    reference_id: recurringReference(input.referenceId),
    customer_id: input.customerId,
    currency: "PHP",
    amount: FOUNDING_PRICE_PHP,
    schedule: {
      interval: "MONTH",
      interval_count: 1,
      anchor_date: recurringAnchor(new Date(input.accessUntil)).toISOString(),
      retry_interval: "DAY",
      retry_interval_count: 1,
      total_retry: 3,
      failed_attempt_notifications: [1, 3],
    },
    payment_tokens: [{payment_token_id: input.paymentTokenId, rank: 1}],
    immediate_payment: false,
    failed_cycle_action: "STOP",
    notification_channels: ["EMAIL"],
    locale: "en",
    payment_link_for_failed_attempt: true,
    description: "PromptVault PH Founding membership - monthly renewal",
    metadata: {
      user_id: input.userId,
      checkout_reference: input.referenceId,
    },
  };
}

export function recurringReference(checkoutReference: string) {
  return `rec_${checkoutReference}`.slice(0, 64);
}

export function checkoutReferenceFromRecurring(reference: string) {
  return reference.startsWith("rec_") ? reference.slice(4) : reference;
}

export function createCheckoutReference(userId: string, now = Date.now()) {
  return `pv_${userId.replaceAll("-", "")}_${now.toString(36)}`.slice(0, 64);
}

export async function createHostedPaymentSession(input: CustomerInput, referenceId: string) {
  return xenditRequest<XenditSession>("/sessions", {
    method: "POST",
    body: buildPaymentSessionPayload(input, referenceId),
  });
}

export async function createXenditRecurringPlan(input: RecurringInput) {
  return xenditRequest<XenditRecurringPlan>("/recurring/plans", {
    method: "POST",
    apiVersion: true,
    idempotencyKey: `plan-${input.referenceId}`,
    body: buildRecurringPlanPayload(input),
  });
}

export async function deactivateXenditRecurringPlan(planId: string) {
  return xenditRequest<XenditRecurringPlan>(`/recurring/plans/${encodeURIComponent(planId)}/deactivate`, {
    method: "POST",
    apiVersion: true,
  });
}

function recurringAnchor(date: Date) {
  if (Number.isNaN(date.getTime())) {
    throw new Error("A valid access end date is required to create a recurring plan.");
  }

  const anchor = new Date(date);
  anchor.setUTCDate(Math.min(anchor.getUTCDate(), 28));
  return anchor;
}

function xenditName(fullName: string) {
  const parts = fullName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const fallback = "Member";
  const surname = parts.length > 1 ? parts.pop()!.slice(0, 50) : "";
  const givenNames = (parts.join(" ") || surname || fallback).slice(0, 50);
  return {givenNames, surname: parts.length === 0 ? "" : surname};
}

async function xenditRequest<T>(
  path: string,
  options: {method: "POST"; body?: unknown; apiVersion?: boolean; idempotencyKey?: string},
) {
  const config = getXenditConfig();
  if (!config) {
    throw new XenditError("Xendit billing is not configured.", 503, "NOT_CONFIGURED");
  }

  const response = await fetch(`${XENDIT_API}${path}`, {
    method: options.method,
    headers: {
      authorization: `Basic ${Buffer.from(`${config.secretKey}:`).toString("base64")}`,
      "content-type": "application/json",
      ...(options.apiVersion ? {"api-version": config.apiVersion} : {}),
      ...(options.idempotencyKey ? {"idempotency-key": options.idempotencyKey} : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
  });
  const body = (await response.json().catch(() => null)) as {message?: string; error_code?: string} | null;

  if (!response.ok) {
    throw new XenditError(body?.message ?? "Xendit rejected the request.", response.status, body?.error_code);
  }

  return body as T;
}

export class XenditError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
  }
}
