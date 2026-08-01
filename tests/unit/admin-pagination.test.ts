import { describe, expect, it } from "vitest";

import { getPageWindow } from "@/components/admin/admin-pagination";

describe("getPageWindow", () => {
  it("returns all pages when total is small", () => {
    expect(getPageWindow(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("windows large totals with ellipsis", () => {
    expect(getPageWindow(1, 25)).toEqual([1, 2, "ellipsis", 25]);
    expect(getPageWindow(12, 25)).toEqual([
      1,
      "ellipsis",
      11,
      12,
      13,
      "ellipsis",
      25,
    ]);
    expect(getPageWindow(25, 25)).toEqual([1, "ellipsis", 24, 25]);
  });
});
