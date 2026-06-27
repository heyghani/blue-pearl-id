import { describe, expect, it } from "vitest";

import {
  extensionForContentType,
  isAllowedImageContentType,
  resolveImageContentType,
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

  it("infers content type from filename when the browser omits it", () => {
    expect(
      resolveImageContentType({ name: "photo.jpg", type: "" }),
    ).toBe("image/jpeg");
    expect(
      resolveImageContentType({ name: "photo.JPEG", type: "application/octet-stream" }),
    ).toBe("image/jpeg");
  });

  it("rejects heic uploads", () => {
    expect(
      resolveImageContentType({ name: "IMG_0001.HEIC", type: "image/heic" }),
    ).toBeNull();
  });
});
