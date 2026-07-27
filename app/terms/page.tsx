import {LegalPage, LegalSection} from "@/components/site/legal-page";
import {getSupportEmail} from "@/lib/env";

export default function TermsPage() {
  const supportEmail = getSupportEmail();
  return (
    <LegalPage title="Terms of Service" summary="These terms govern use of the PromptVault PH catalog, account features, and Founding subscription.">
      <LegalSection title="Accounts and acceptable use">
        <p>You must provide accurate account information, safeguard your login, and use the service lawfully. You may adapt generated prompt outputs for your own work, but may not scrape, resell, publish, or redistribute the prompt catalog or bypass access controls.</p>
      </LegalSection>
      <LegalSection title="Founding subscription">
        <p>The Founding plan costs ₱99 per month. The first charge is collected through Xendit hosted checkout and subsequent monthly charges use the payment method you authorize Xendit to save.</p>
        <p>A failed renewal may be retried daily up to three times. Access may continue during that grace period and ends after the final failure. Price or material service changes will be communicated before taking effect where required.</p>
      </LegalSection>
      <LegalSection title="Prompt and AI output limitations">
        <p>Prompts are general productivity templates. AI output can be inaccurate, incomplete, biased, or unsuitable. Review output before use and obtain qualified professional advice for legal, medical, financial, academic, or other high-stakes decisions.</p>
      </LegalSection>
      <LegalSection title="Availability and enforcement">
        <p>We may maintain, change, suspend, or discontinue features and may restrict accounts used fraudulently or in violation of these terms. We do not promise uninterrupted availability or a particular AI result.</p>
        <p>Questions can be sent to <a className="text-gold underline" href={`mailto:${supportEmail}`}>{supportEmail}</a>.</p>
      </LegalSection>
    </LegalPage>
  );
}
