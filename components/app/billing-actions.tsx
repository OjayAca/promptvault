"use client";

import {CreditCard, XCircle} from "lucide-react";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {errorMessage} from "@/lib/http";
import type {SubscriptionPlan} from "@/lib/types";

export function CheckoutButton({plan}: {plan: Exclude<SubscriptionPlan, "Free">}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/billing/checkout", {
      method: "POST",
    });
    const body = await response.json();
    setLoading(false);

    if (!response.ok || !body.checkoutUrl) {
      setError(errorMessage(body, "Checkout is not available."));
      return;
    }

    window.location.href = body.checkoutUrl;
  }

  return (
    <div className="grid gap-2">
      <button
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-bgbase transition hover:bg-gold/90 disabled:cursor-wait disabled:opacity-60"
        disabled={loading}
        onClick={startCheckout}
        type="button"
      >
        <CreditCard className="h-4 w-4" />
        {loading ? "Opening..." : `Subscribe to ${plan}`}
      </button>
      {error ? <p className="text-xs text-red-200">{error}</p> : null}
    </div>
  );
}

export function CancelSubscriptionButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function cancelSubscription() {
    if (!window.confirm("Stop future renewals? Your paid access will continue through the current period.")) return;
    setLoading(true);
    setMessage(null);
    const response = await fetch("/api/billing/cancel", {method: "POST"});
    const body = await response.json();
    setLoading(false);
    if (!response.ok) {
      setMessage(errorMessage(body, "Cancellation failed. Please try again."));
      return;
    }
    setMessage(body.accessUntil ? `Cancelled. Access remains available until ${new Date(body.accessUntil).toLocaleDateString()}.` : "Cancelled.");
    router.refresh();
  }

  return (
    <div className="grid gap-2">
      <button
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-textsecondary transition hover:border-red-300 hover:text-red-200 disabled:opacity-60"
        disabled={loading}
        onClick={cancelSubscription}
        type="button"
      >
        <XCircle className="h-4 w-4" />
        {loading ? "Cancelling..." : "Cancel Renewal"}
      </button>
      {message ? <p className="text-xs text-textsecondary">{message}</p> : null}
    </div>
  );
}
