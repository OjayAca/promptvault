import {LegalPage, LegalSection} from "@/components/site/legal-page";
import {getSupportEmail} from "@/lib/env";

export default function SupportPage() {
  const supportEmail = getSupportEmail();
  return (
    <LegalPage title="Support" summary="Contact PromptVault PH about account access, billing, privacy, or catalog issues.">
      <LegalSection title="Email support">
        <p>
          Write to{" "}
          <a className="text-gold underline" href={`mailto:${supportEmail}`}>
            {supportEmail}
          </a>
          . Include your account email, what you were trying to do, and any non-sensitive error message you saw.
        </p>
      </LegalSection>
      <LegalSection title="Billing safety">
        <p>For payment concerns, include the payment date and Xendit reference if available. Never send a password, one-time code, complete card number, bank credentials, or wallet PIN.</p>
      </LegalSection>
    </LegalPage>
  );
}
