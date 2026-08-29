import { describe, expect, it } from "vitest";

import {
  getFollowUpContext,
  getPageType,
  interpolate,
  isPopupEligiblePath,
} from "@/lib/whatsapp/follow-up-triggers";

describe("getPageType", () => {
  it("detects homepage, product, cart, browse, and other routes", () => {
    expect(getPageType("/")).toBe("home");
    expect(getPageType("/products/air-jordan-1")).toBe("product");
    expect(getPageType("/cart")).toBe("cart");
    expect(getPageType("/products")).toBe("browse");
    expect(getPageType("/lookbook")).toBe("browse");
    expect(getPageType("/halloween")).toBe("browse");
    expect(getPageType("/legal/terms")).toBe("other");
  });
});

describe("isPopupEligiblePath", () => {
  it("excludes checkout, account, admin, and auth routes", () => {
    expect(isPopupEligiblePath("/")).toBe(true);
    expect(isPopupEligiblePath("/products/foo")).toBe(true);
    expect(isPopupEligiblePath("/checkout/information")).toBe(false);
    expect(isPopupEligiblePath("/account")).toBe(false);
    expect(isPopupEligiblePath("/admin/orders")).toBe(false);
    expect(isPopupEligiblePath("/auth/login")).toBe(false);
  });
});

describe("getFollowUpContext", () => {
  it("prioritizes cart context when items are in the bag", () => {
    expect(getFollowUpContext("/", true)).toEqual({
      pageType: "cart",
      delayMs: 10_000,
      enableExitIntent: true,
    });
  });

  it("returns page-specific delays when the cart is empty", () => {
    expect(getFollowUpContext("/", false)).toEqual({
      pageType: "home",
      delayMs: 15_000,
      enableExitIntent: true,
    });
    expect(getFollowUpContext("/products/air-jordan-1", false)).toEqual({
      pageType: "product",
      delayMs: 30_000,
      enableExitIntent: true,
    });
    expect(getFollowUpContext("/cart", false)).toEqual({
      pageType: "cart",
      delayMs: 10_000,
      enableExitIntent: true,
    });
    expect(getFollowUpContext("/products", false)).toEqual({
      pageType: "browse",
      delayMs: 20_000,
      enableExitIntent: true,
    });
    expect(getFollowUpContext("/lookbook", false)).toEqual({
      pageType: "browse",
      delayMs: 20_000,
      enableExitIntent: true,
    });
  });

  it("returns null for ineligible or unsupported pages", () => {
    expect(getFollowUpContext("/checkout/information", false)).toBeNull();
    expect(getFollowUpContext("/legal/terms", false)).toBeNull();
  });
});

describe("interpolate", () => {
  it("replaces placeholders in template strings", () => {
    expect(
      interpolate("Hi! I'm interested in {productName}.", {
        productName: "Jordan 1",
      }),
    ).toBe("Hi! I'm interested in Jordan 1.");
  });
});
