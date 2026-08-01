import { describe, expect, it } from "vitest";

import { adminListHref } from "@/lib/admin/list-query";

describe("adminListHref", () => {
  it("builds a path with merged query params", () => {
    expect(
      adminListHref(
        "/admin/products",
        { search: "nike", status: "active" },
        { stock: "low", page: "2" },
      ),
    ).toBe("/admin/products?search=nike&status=active&stock=low&page=2");
  });

  it("omits empty values and page=1", () => {
    expect(
      adminListHref(
        "/admin/orders",
        { search: "a", status: "PAID", page: "3" },
        { status: undefined, page: "1" },
      ),
    ).toBe("/admin/orders?search=a");
  });

  it("returns bare pathname when nothing remains", () => {
    expect(adminListHref("/admin/brands", { search: "x" }, { search: "" })).toBe(
      "/admin/brands",
    );
  });
});
