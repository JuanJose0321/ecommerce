import { expect, test } from "@playwright/test"

test.beforeEach(({}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile-375",
    "hamburger menu only renders below the lg breakpoint"
  )
})

test("the hamburger menu opens and lists categories", async ({ page }) => {
  await page.goto("/")

  await page.getByRole("button", { name: "Abrir menu" }).click()
  await expect(page.getByRole("link", { name: "Todo el catalogo" })).toBeVisible()
})

test("home page has no horizontal overflow at 375px", async ({ page }) => {
  await page.goto("/")
  await page.waitForLoadState("networkidle")

  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  )
  expect(hasOverflow).toBe(false)
})
