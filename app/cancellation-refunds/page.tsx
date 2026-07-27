import {LegalPage, LegalSection} from "@/components/site/legal-page";
import {getSupportEmail} from "@/lib/env";

export default function CancellationRefundsPage() {
  const supportEmail = getSupportEmail();
  return (
    <LegalPage title="Cancellation & Refund Policy" summary="Founding membership renews monthly. Cancellation stops future renewal while preserving the period already paid for.">
      <LegalSection title="Cancellation">
        <p>Cancel from the billing page at any time. PromptVault sends an immediate deactivation request for the Xendit recurring plan, and no new subscription cycles should be created after successful cancellation.</p>
        <p>Your premium access continues until the paid-through date shown on the billing page. Cancellation does not erase your account or free catalog access.</p>
      </LegalSection>
      <LegalSection title="Failed renewals">
        <p>Xendit may retry a failed renewal once per day for up to three retries. Premium access can continue during the three-day grace window and ends if the final retry fails.</p>
      </LegalSection>
      <LegalSection title="Refund requests">
        <p>Completed subscription periods are generally non-refundable once premium content has been made available, except where required by law or where a duplicate, unauthorized, or clear billing error is confirmed.</p>
        <p>Send a request to <a className="text-gold underline" href={`mailto:${supportEmail}`}>{supportEmail}</a> with the account email and payment date. Do not email complete card, bank, or wallet credentials.</p>
      </LegalSection>
    </LegalPage>
  );
}
