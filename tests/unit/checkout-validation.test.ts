import { describe, expect, it } from "vitest";

import {
  addressSchema,
  customerInfoSchema,
  paymentStepSchema,
} from "@/lib/validations/checkout";

const validAddress = {
  firstName: "Jane",
  lastName: "Doe",
  line1: "123 Pearl St",
  city: "Singapore",
  postalCode: "018956",
  country: "sg",
};

describe("checkout validations", () => {
  it("accepts valid customer info", () => {
    const result = customerInfoSchema.safeParse({
      email: "jane@example.com",
      phone: "",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = customerInfoSchema.safeParse({
      email: "not-an-email",
    });

    expect(result.success).toBe(false);
  });

  it("uppercases country code on address", () => {
    const result = addressSchema.safeParse(validAddress);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.country).toBe("SG");
    }
  });

  it("requires address fields", () => {
    const result = addressSchema.safeParse({
      ...validAddress,
      line1: "",
    });

    expect(result.success).toBe(false);
  });

  it("accepts supported payment methods", () => {
    const card = paymentStepSchema.safeParse({ paymentMethod: "CREDIT_CARD" });
    const paypal = paymentStepSchema.safeParse({ paymentMethod: "PAYPAL" });

    expect(card.success).toBe(true);
    expect(paypal.success).toBe(true);
  });
});
