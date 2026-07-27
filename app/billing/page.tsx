import Link from "next/link";
import {CancelSubscriptionButton, CheckoutButton} from "@/components/app/billing-actions";
import {pricingPlans} from "@/lib/data";
import {requireUser} from "@/lib/auth";
import {isBillingEnabled} from "@/lib/env";
import type {SubscriptionPlan} from "@/lib/types";

export default async function BillingPage({searchParams}: {searchParams: Promise<{checkout?: string}>}) {
  const user = await requireUser();
  const params = await searchParams;
  const currentPlan = user.subscription?.plan ?? "Free";
  const currentStatus = user.subscription?.status ?? "free";
  const billingEnabled = isBillingEnabled();
  const profileComplete = Boolean(user.emailVerified && user.profile?.fullName && user.profile.mobileNumber);

  return (
    <main className="relative min-h-screen overflow-hidden bg-bgbase px-6 py-10 text-textprimary">
      <div className="mesh-gradient" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <Link className="text-sm text-textsecondary transition hover:text-gold" href="/app">
          Back to dashboard
        </Link>
        <header className="mt-8 flex flex-col justify-between gap-5 border-b border-border pb-8 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-gold">Subscription & Billing</p>
            <h1 className="mt-2 font-serif text-4xl text-textprimary md:text-5xl">Manage access</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-textsecondary">
              Subscribe through Xendit&apos;s hosted checkout. Renewals run monthly, with three daily retries after a failed charge.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="text-xs uppercase tracking-[0.08em] text-textmuted">Current</p>
            <p className="mt-1 font-serif text-2xl text-gold">{currentPlan}</p>
            <p className="text-sm text-textsecondary">{currentStatus}</p>
            {user.subscription?.accessUntil ? (
              <p className="mt-1 text-xs text-textmuted">Paid through {new Date(user.subscription.accessUntil).toLocaleDateString("en-PH")}</p>
            ) : null}
          </div>
        </header>

        {params.checkout ? (
          <p className="mt-6 rounded-lg border border-gold/30 bg-gold/10 p-4 text-sm text-gold">
            Checkout {params.checkout}. Payment access updates only after a verified Xendit webhook is received.
          </p>
        ) : null}

        {!profileComplete ? (
          <p className="mt-6 rounded-lg border border-gold/30 bg-gold/10 p-4 text-sm text-gold">
            Verify your email and complete your full name and Philippine mobile number on the{" "}
            <Link className="underline" href="/account">
              account page
            </Link>{" "}
            before checkout.
          </p>
        ) : null}
        {!billingEnabled ? (
          <p className="mt-6 rounded-lg border border-border bg-surface p-4 text-sm text-textsecondary">
            Paid checkout is not open yet. Founding membership will become available after live recurring payment channels are approved.
          </p>
        ) : null}

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          {pricingPlans.map((plan) => {
            const planName = plan.name as SubscriptionPlan;
            return (
              <article className={`flex flex-col justify-between rounded-lg border p-6 ${plan.highlighted ? "border-gold bg-surface" : "border-border bg-surface/70"}`} key={plan.name}>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-gold">{plan.label}</p>
                  <h2 className="mt-3 font-serif text-3xl text-textprimary">{plan.priceLabel}</h2>
                  <p className="mt-2 text-sm text-textsecondary">{plan.description}</p>
                  <ul className="mt-6 grid gap-3 text-sm text-textsecondary">
                    {plan.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8">
                  {planName === "Free" ? (
                    <Link className="inline-flex w-full justify-center rounded-lg border border-border px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-textprimary hover:border-gold hover:text-gold" href="/app">
                      Continue Free
                    </Link>
                  ) : user.subscription?.providerSubscriptionId && currentStatus !== "cancelled" && currentStatus !== "expired" ? (
                    <CancelSubscriptionButton />
                  ) : currentStatus === "cancelled" && user.subscription?.accessUntil && new Date(user.subscription.accessUntil) > new Date() ? (
                    <p className="rounded-lg border border-border px-5 py-3 text-center text-xs text-textsecondary">
                      Renewal cancelled; access remains through {new Date(user.subscription.accessUntil).toLocaleDateString("en-PH")}.
                    </p>
                  ) : (
                    billingEnabled && profileComplete ? <CheckoutButton plan={planName} /> : (
                      <p className="rounded-lg border border-border px-5 py-3 text-center text-xs text-textmuted">Checkout unavailable</p>
                    )
                  )}
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
