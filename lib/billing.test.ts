import {describe, expect, it} from "vitest";
import {
  cycleSubscriptionUpdate,
  cancellationUpdate,
  initialAccessWindow,
  isProcessedWebhookStatus,
  isReconciliationCandidate,
  parseXenditWebhook,
  retryGraceUntil,
  successfulCycleWindow,
  type XenditWebhook,
} from "@/lib/billing";

const baseSubscription = {
  user_id: "user-1",
  status: "active",
  provider_subscription_id: "repl_1",
  provider_last_cycle_number: 2,
  provider_event_created_at: "2026-08-01T00:00:00Z",
  access_until: "2026-09-01T00:00:00Z",
  grace_until: null,
  cancelled_at: null,
  current_period_end: "2026-09-01T00:00:00Z",
};

function event(name: string, cycleNumber: number, created = "2026-09-01T00:00:00Z"): XenditWebhook {
  return {
    event: name,
    business_id: "business-1",
    created,
    data: {
      id: `recy_${cycleNumber}`,
      plan_id: "repl_1",
      cycle_number: cycleNumber,
      scheduled_timestamp: "2026-09-01T00:00:00Z",
    },
  };
}

describe("billing access calculations", () => {
  it("grants exactly one calendar month after initial payment", () => {
    expect(initialAccessWindow("2026-01-31T12:00:00Z").accessUntil).toBe("2026-02-28T12:00:00.000Z");
  });

  it("extends from the existing paid-through date on successful renewal", () => {
    expect(successfulCycleWindow("2026-09-01T00:00:00Z", "2026-09-01T00:00:00Z").accessUntil).toBe(
      "2026-10-01T00:00:00.000Z",
    );
  });

  it("keeps a three-day grace window during retry", () => {
    expect(retryGraceUntil("2026-09-01T00:00:00Z")).toBe("2026-09-04T00:00:00.000Z");
    expect(cycleSubscriptionUpdate(baseSubscription, event("recurring.cycle.retrying", 3), "wh_retry")).toMatchObject({
      status: "past_due",
      grace_until: "2026-09-04T00:00:00.000Z",
    });
  });

  it("activates success and expires final failure", () => {
    expect(cycleSubscriptionUpdate(baseSubscription, event("recurring.cycle.succeeded", 3), "wh_success")).toMatchObject({
      status: "active",
      access_until: "2026-10-01T00:00:00.000Z",
    });
    expect(cycleSubscriptionUpdate(baseSubscription, event("recurring.cycle.failed", 3), "wh_failed")).toMatchObject({
      status: "expired",
    });
  });

  it("ignores an older cycle and a delayed failure after success", () => {
    expect(cycleSubscriptionUpdate(baseSubscription, event("recurring.cycle.failed", 1), "wh_old")).toBeNull();
    const afterSuccess = {...baseSubscription, provider_last_cycle_number: 3, status: "active"};
    expect(cycleSubscriptionUpdate(afterSuccess, event("recurring.cycle.failed", 3, "2026-09-02T00:00:00Z"), "wh_late")).toBeNull();
  });

  it("cancels renewal without changing paid-through access", () => {
    expect({...baseSubscription, ...cancellationUpdate("2026-08-15T00:00:00Z")}).toMatchObject({
      status: "cancelled",
      access_until: "2026-09-01T00:00:00Z",
      grace_until: null,
    });
  });
});

describe("webhook parsing", () => {
  it("accepts a structured event and rejects malformed input", () => {
    expect(parseXenditWebhook(event("recurring.cycle.succeeded", 3))?.event).toBe("recurring.cycle.succeeded");
    expect(parseXenditWebhook({event: "payment.succeeded"})).toBeNull();
  });

  it("deduplicates completed or in-flight webhook IDs", () => {
    expect(isProcessedWebhookStatus("completed")).toBe(true);
    expect(isProcessedWebhookStatus("processing")).toBe(true);
    expect(isProcessedWebhookStatus("failed")).toBe(false);
  });

  it("reconciles only paid, tokenized checkouts without a plan", () => {
    expect(
      isReconciliationCandidate({
        payment_succeeded: true,
        provider_payment_token_id: "pt_1",
        provider_recurring_plan_id: null,
      }),
    ).toBe(true);
    expect(
      isReconciliationCandidate({
        payment_succeeded: true,
        provider_payment_token_id: "pt_1",
        provider_recurring_plan_id: "repl_1",
      }),
    ).toBe(false);
  });
});
