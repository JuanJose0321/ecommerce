import { expect, test } from "@playwright/test"

const PRODUCT_HANDLE = "reloj-bolsillo-heritage"

test("saving a product to the wishlist makes it appear on /wishlist", async ({ page }) => {
  await page.goto(`/products/${PRODUCT_HANDLE}`)
  const title = await page.getByRole("heading", { level: 1 }).textContent()

  // Scoped to the inline toggle (no aria-label) to avoid matching the
  // overlay wishlist buttons rendered on each card in "related products".
  const inlineWishlistButton = page.locator('button:not([aria-label])', {
    hasText: "Guardar en favoritos",
  })
  await inlineWishlistButton.click()
  await expect(
    page.locator('button:not([aria-label])', { hasText: "Guardado en favoritos" })
  ).toBeVisible()

  await page.goto("/wishlist")
  await expect(page.getByRole("heading", { name: title!.trim(), level: 3 })).toBeVisible()

  await page.getByRole("button", { name: "Quitar de favoritos" }).click()
  await expect(page.getByText("Aun no tienes favoritos")).toBeVisible()
})
