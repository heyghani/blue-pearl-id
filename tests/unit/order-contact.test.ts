import { describe, expect, it } from "vitest";

import {
  formatCityStatePostal,
  formatCustomerName,
  getAddressLine1,
  getAddressLine2,
} from "@/lib/addresses";
import { extractPayPalPayerInfo } from "@/lib/payments/paypal-payer";
import { combinePhone, formatPhoneDisplay, splitPhone } from "@/lib/phone";

describe("addresses", () => {
  it("reads line1 from either line1 or legacy address1", () => {
    expect(getAddressLine1({ line1: "123 Pearl St" })).toBe("123 Pearl St");
    expect(getAddressLine1({ address1: "456 Oak Ave" })).toBe("456 Oak Ave");
  });

  it("formats customer and city lines", () => {
    expect(
      formatCustomerName({ firstName: "Ada", lastName: "Lovelace" }),
    ).toBe("Ada Lovelace");
    expect(
      formatCityStatePostal({
        city: "San Pablo",
        state: "CA",
        postalCode: "94806",
      }),
    ).toBe("San Pablo, CA 94806");
  });

  it("reads line2 from either line2 or legacy address2", () => {
    expect(getAddressLine2({ line2: "Apt 2" })).toBe("Apt 2");
    expect(getAddressLine2({ address2: "Suite 9" })).toBe("Suite 9");
  });
});

describe("phone", () => {
  it("combines dial code and local number", () => {
    expect(combinePhone("+1", "5103675753")).toBe("+1 5103675753");
    expect(combinePhone("+62", "812345678")).toBe("+62 812345678");
  });

  it("splits stored phone numbers", () => {
    expect(splitPhone("+1 5103675753", "US")).toEqual({
      dialCode: "+1",
      local: "5103675753",
    });
    expect(splitPhone("5103675753", "US")).toEqual({
      dialCode: "+1",
      local: "5103675753",
    });
  });

  it("formats US numbers with area code", () => {
    expect(formatPhoneDisplay("5103675753", "US")).toBe("+1 (510) 367-5753");
    expect(formatPhoneDisplay("+1 5103675753", "US")).toBe("+1 (510) 367-5753");
  });
});

describe("extractPayPalPayerInfo", () => {
  it("extracts payer name and email from capture payload", () => {
    expect(
      extractPayPalPayerInfo({
        payer: {
          name: { given_name: "EL", surname: "BOUMHAOUT" },
          email_address: "buyer@example.com",
        },
      }),
    ).toEqual({
      name: "EL BOUMHAOUT",
      email: "buyer@example.com",
    });
  });
});
