import { describe, expect, it } from "vitest";

import {
  extensionForContentType,
  isAllowedImageContentType,
  uploadedImageUrlSchema,
} from "@/lib/validations/upload";

describe("upload validation", () => {
  it("accepts local and remote image urls", () => {
    expect(uploadedImageUrlSchema.safeParse("/uploads/products/test.jpg").success).toBe(
      true,
    );
    expect(
      uploadedImageUrlSchema.safeParse("https://assets.example.com/products/test.jpg")
        .success,
    ).toBe(true);
  });

  it("maps content types to extensions", () => {
    expect(extensionForContentType("image/jpeg")).toBe("jpg");
    expect(extensionForContentType("image/png")).toBe("png");
  });

  it("rejects unsupported content types", () => {
    expect(isAllowedImageContentType("image/svg+xml")).toBe(false);
  });
});
