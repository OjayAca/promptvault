import {describe, expect, it} from "vitest";
import {
  buildPaymentSessionPayload,
  buildRecurringPlanPayload,
  createCheckoutReference,
  verifyXenditWebhookToken,
} from "@/lib/xendit";

const customer = {
  userId: "018f89e8-73a5-7c19-8993-123456789abc",
  email: "juan@example.com",
  fullName: "Juan Dela Cruz",
  mobileNumber: "+639171234567",
};

describe("Xendit payloads", () => {
  it("creates a hosted PAY session that forces payment-method saving", () => {
    const payload = buildPaymentSessionPayload(customer, "pv_checkout_1", "https://promptvault.ph");
    expect(payload).toMatchObject({
      reference_id: "pv_checkout_1",
      session_type: "PAY",
      mode: "PAYMENT_LINK",
      amount: 99,
      currency: "PHP",
      country: "PH",
      allow_save_payment_method: "FORCED",
      success_return_url: "https://promptvault.ph/billing?checkout=success",
    });
    expect(payload.customer.mobile_number).toBe("+639171234567");
  });

  it("creates monthly renewals with three daily retries and no immediate charge", () => {
    const payload = buildRecurringPlanPayload({
      referenceId: "pv_checkout_1",
      customerId: "cust-example",
      paymentTokenId: "pt-example",
      accessUntil: "2026-08-31T10:00:00Z",
      userId: customer.userId,
    });
    expect(payload.schedule).toMatchObject({
      interval: "MONTH",
      interval_count: 1,
      anchor_date: "2026-08-28T10:00:00.000Z",
      retry_interval: "DAY",
      retry_interval_count: 1,
      total_retry: 3,
    });
    expect(payload).toMatchObject({immediate_payment: false, failed_cycle_action: "STOP"});
  });

  it("uses constant-length-safe token verification", () => {
    expect(verifyXenditWebhookToken("secret-token", "secret-token")).toBe(true);
    expect(verifyXenditWebhookToken("wrong-token", "secret-token")).toBe(false);
    expect(verifyXenditWebhookToken(null, "secret-token")).toBe(false);
  });

  it("creates provider-safe unique checkout references", () => {
    expect(createCheckoutReference(customer.userId, 123456)).toMatch(/^pv_[a-f0-9]+_/);
    expect(createCheckoutReference(customer.userId, 123456).length).toBeLessThanOrEqual(64);
  });
});
