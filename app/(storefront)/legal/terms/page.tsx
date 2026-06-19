import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/legal-page";
import { APP_NAME, CURRENCY, SUPPORT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      description={`Terms governing your use of ${APP_NAME} and purchases on our website.`}
    >
      <h2>Agreement</h2>
      <p>
        By accessing {APP_NAME} or placing an order, you agree to these Terms of Service.
        If you do not agree, please do not use our website.
      </p>

      <h2>Products & pricing</h2>
      <p>
        All prices are listed in {CURRENCY}. We reserve the right to correct pricing errors
        and to limit quantities. Product images are representative; natural variations may
        occur in pearl jewelry.
      </p>

      <h2>Orders & payment</h2>
      <p>
        An order is confirmed when payment is successfully captured. We accept major credit
        cards (via Midtrans) and PayPal. You are responsible for providing accurate shipping
        and contact information.
      </p>

      <h2>International orders</h2>
      <p>
        We ship worldwide. Import duties, VAT, and local taxes are the responsibility of
        the customer and may be charged upon delivery by your country&apos;s customs authority.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, {APP_NAME} shall not be liable for indirect,
        incidental, or consequential damages arising from your use of our services or products.
      </p>

      <h2>Contact</h2>
      <p>
        For questions about these terms, contact {SUPPORT_EMAIL}.
      </p>
    </LegalPage>
  );
}
