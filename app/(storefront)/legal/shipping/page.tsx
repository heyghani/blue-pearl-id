import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/legal-page";
import { APP_NAME, CURRENCY, SUPPORT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Shipping Information",
};

export default function ShippingPage() {
  return (
    <LegalPage
      title="Shipping Information"
      description="Worldwide delivery options, timelines, and tracking for your order."
    >
      <h2>Shipping methods</h2>
      <p>
        We offer two worldwide shipping options at checkout, priced in {CURRENCY}:
      </p>
      <ul>
        <li>
          <strong className="text-foreground">Standard Shipping</strong> — economical
          worldwide delivery (typically 10–21 business days after dispatch)
        </li>
        <li>
          <strong className="text-foreground">Express Shipping</strong> — priority
          worldwide delivery (typically 3–7 business days after dispatch)
        </li>
      </ul>
      <p>
        Exact rates and estimated delivery windows are shown at checkout based on your
        selected method.
      </p>

      <h2>Processing time</h2>
      <p>
        Orders are typically processed within 1–2 business days after payment is confirmed.
        You will receive an email when your order ships with tracking information.
      </p>

      <h2>Tracking</h2>
      <p>
        Once shipped, tracking details are sent to the email address on your order. You can
        also view order status in your account if you registered before checkout.
      </p>

      <h2>Customs & duties</h2>
      <p>
        International shipments may be subject to import duties, VAT, or local taxes levied
        by your country. These charges are the responsibility of the recipient and are not
        included in our product or shipping prices.
      </p>

      <h2>Questions</h2>
      <p>
        Need help with a shipment? Contact {SUPPORT_EMAIL} with your order number.
      </p>
    </LegalPage>
  );
}
