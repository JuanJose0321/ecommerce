import { expect, test } from "@playwright/test"

const PRODUCT_HANDLE = "reloj-bolsillo-heritage"

test("browse a product, add it to the cart, and reach the payment step", async ({ page }) => {
  await page.goto(`/products/${PRODUCT_HANDLE}`)
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()

  await page.getByRole("button", { name: "Anadir al carrito" }).click()
  const cartButton = page.getByRole("button", { name: /^Carrito, \d/ })
  await expect(cartButton).toBeVisible()

  await cartButton.click()
  await expect(page.getByRole("heading", { name: /Tu carrito/ })).toBeVisible()
  await expect(page.getByRole("link", { name: "Ir a pagar" })).toBeVisible()

  await page.getByRole("link", { name: "Ir a pagar" }).click()
  await expect(page).toHaveURL(/\/checkout/)

  await page.getByLabel("Correo").fill("e2e-test@example.com")
  await page.getByLabel("Nombre").fill("Ada")
  await page.getByLabel("Apellido").fill("Lovelace")
  await page.getByLabel("Direccion").fill("Av. Reforma 123")
  await page.getByLabel("Ciudad").fill("Ciudad de Mexico")
  await page.getByLabel("Estado").fill("CDMX")
  await page.getByLabel("Codigo postal").fill("06600")
  await page.getByLabel("Telefono").fill("5555555555")

  await page.getByRole("button", { name: "Continuar a pago" }).click()

  await expect(page.getByRole("heading", { name: "Pago" })).toBeVisible({ timeout: 15_000 })
})
