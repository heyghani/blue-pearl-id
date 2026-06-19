import type { Metadata } from "next";

import { LegalPage } from "@/components/legal/legal-page";
import { APP_NAME, SUPPORT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Returns & Refunds",
};

export default function RefundsPage() {
  return (
    <LegalPage
      title="Returns & Refunds"
      description="Our policy for returns, exchanges, and refunds on pearl jewelry."
    >
      <h2>Return window</h2>
      <p>
        We accept returns of unworn, undamaged items in original packaging within 30 days
        of delivery. Custom or final-sale items may not be eligible for return.
      </p>

      <h2>How to request a return</h2>
      <ul>
        <li>Email {SUPPORT_EMAIL} with your order number and reason for return</li>
        <li>We will provide return instructions and, if approved, a return authorization</li>
        <li>Ship the item back using a trackable method</li>
      </ul>

      <h2>Refunds</h2>
      <p>
        Approved refunds are processed to your original payment method within 5–10 business
        days after we receive and inspect the returned item. Shipping costs are non-refundable
        unless the return is due to our error or a defective product.
      </p>

      <h2>Exchanges</h2>
      <p>
        We are happy to help with exchanges for a different size or item of equal value,
        subject to availability. Contact {SUPPORT_EMAIL} to arrange an exchange.
      </p>

      <h2>Damaged or incorrect items</h2>
      <p>
        If your order arrives damaged or incorrect, contact us within 7 days with photos.
        {APP_NAME} will cover return shipping and offer a replacement or full refund.
      </p>
    </LegalPage>
  );
}
