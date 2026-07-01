import { expect, test } from "@playwright/test";

test.describe("Storefront", () => {
  test("home page shows hero and featured products", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: /PrimeLuxr/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /eternal design/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Featured" })).toBeVisible();
    await expect(page.getByRole("link", { name: /shop now/i })).toBeVisible();
  });

  test("catalog lists products", async ({ page }) => {
    await page.goto("/products");

    await expect(page.getByRole("heading", { name: /shop all/i })).toBeVisible();
    await expect(page.locator('a[href^="/products/"]').first()).toBeVisible();
  });

  test("product detail page loads", async ({ page }) => {
    await page.goto("/products");

    const productLink = page.locator('a[href^="/products/"]').first();
    const href = await productLink.getAttribute("href");
    expect(href).toBeTruthy();

    await productLink.click();

    await expect(page.getByRole("button", { name: /add to cart/i })).toBeVisible();
  });

  test("login page is reachable", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByText("Sign in", { exact: true }).first()).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });
});
