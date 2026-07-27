import {LegalPage, LegalSection} from "@/components/site/legal-page";
import {getSupportEmail} from "@/lib/env";

export default function PrivacyPage() {
  const supportEmail = getSupportEmail();
  return (
    <LegalPage title="Privacy Notice" summary="This notice explains what PromptVault PH collects, why it is used, and the providers involved in operating the service.">
      <LegalSection title="Information we collect">
        <p>We store your email address, profile name, Philippine mobile number, preferred prompt category, account role, subscription state, and prompt requests you submit.</p>
        <p>Xendit processes checkout and payment-method details. PromptVault stores provider identifiers and payment status, but does not store full card, bank-account, or wallet credentials.</p>
      </LegalSection>
      <LegalSection title="How information is used">
        <p>We use account data to authenticate you, protect premium content, administer subscriptions, respond to support requests, review prompt requests, prevent abuse, and meet operational or legal obligations.</p>
      </LegalSection>
      <LegalSection title="Service providers and retention">
        <p>Supabase provides authentication and database services, Vercel hosts the application, and Xendit processes payments and recurring charges. Each provider handles information under its own privacy terms.</p>
        <p>Account and billing records are retained while needed to provide the service, resolve disputes, secure the platform, and satisfy applicable record-keeping requirements.</p>
      </LegalSection>
      <LegalSection title="Your choices">
        <p>You can edit profile fields from your account and cancel renewal from billing. To request access, correction, or deletion of personal information, contact <a className="text-gold underline" href={`mailto:${supportEmail}`}>{supportEmail}</a>. Some billing or security records may need to be retained where required.</p>
      </LegalSection>
    </LegalPage>
  );
}
