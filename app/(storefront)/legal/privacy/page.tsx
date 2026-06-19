import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/legal-page";
import { APP_NAME, SUPPORT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description={`How ${APP_NAME} collects, uses, and protects your personal information.`}
    >
      <h2>Information we collect</h2>
      <p>
        When you shop with us, we collect information you provide directly — such as
        your name, email address, shipping address, phone number, and payment-related
        details processed by our payment partners (Midtrans and PayPal). We do not store
        full credit card numbers on our servers.
      </p>

      <h2>How we use your information</h2>
      <ul>
        <li>Process and fulfill your orders</li>
        <li>Send order confirmations, shipping updates, and account-related emails</li>
        <li>Provide customer support</li>
        <li>Improve our website and checkout experience</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>Payment processors</h2>
      <p>
        Card payments are processed by Midtrans; PayPal payments are processed by PayPal.
        Each provider has its own privacy policy governing how they handle payment data.
      </p>

      <h2>Data retention</h2>
      <p>
        We retain order and account information for as long as needed to fulfill orders,
        resolve disputes, and meet legal requirements.
      </p>

      <h2>Your rights</h2>
      <p>
        You may request access to, correction of, or deletion of your personal data by
        contacting us at {SUPPORT_EMAIL}. We will respond within a reasonable timeframe.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy? Email {SUPPORT_EMAIL}.
      </p>
    </LegalPage>
  );
}
