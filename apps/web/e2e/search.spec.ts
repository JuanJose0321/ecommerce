import { expect, test } from "@playwright/test"

test("searching for a product navigates to its product page", async ({ page }) => {
  await page.goto("/")

  await page.getByRole("button", { name: "Buscar productos" }).click()
  await page.getByPlaceholder("Buscar relojes, joyería, moda...").fill("Heritage")

  const result = page.getByRole("listbox").getByText("Reloj de Bolsillo Heritage")
  await expect(result).toBeVisible()
  await result.click()

  await expect(page).toHaveURL(/\/products\/reloj-bolsillo-heritage/)
  await expect(page.getByRole("heading", { name: "Reloj de Bolsillo Heritage", level: 1 })).toBeVisible()
})
