import { expect, test } from "@playwright/test";

test.describe("Cart", () => {
  test("add product to cart from detail page", async ({ page }) => {
    await page.goto("/products");

    await page.locator('a[href^="/products/"]').first().click();
    await page.getByRole("button", { name: /add to cart/i }).click();
    await expect(page.getByText(/added to cart/i)).toBeVisible();
    await page.getByRole("link", { name: /view cart/i }).click();

    await expect(page.getByRole("heading", { name: /your cart/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /order summary/i })).toBeVisible();
  });

  test("empty cart shows continue shopping", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/cart");

    await expect(
      page.getByRole("link", { name: /shop all products/i }),
    ).toBeVisible();
  });
});
