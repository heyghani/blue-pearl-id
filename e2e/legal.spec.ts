import { expect, test } from "@playwright/test";

test.describe("Legal pages", () => {
  test("privacy policy loads", async ({ page }) => {
    await page.goto("/legal/privacy");
    await expect(page.getByRole("heading", { name: "Privacy Policy" })).toBeVisible();
  });

  test("footer shipping link works", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Shipping", exact: true }).click();
    await expect(page).toHaveURL(/\/legal\/shipping/);
    await expect(page.getByRole("heading", { name: "Shipping Information" })).toBeVisible();
  });
});
