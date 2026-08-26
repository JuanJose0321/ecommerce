import { describe, expect, it } from "vitest"
import { formatPrice } from "./format"

describe("formatPrice", () => {
  it("formats MXN without decimals", () => {
    expect(formatPrice(1500, "mxn")).toBe("$1,500")
  })

  it("is case-insensitive on the currency code", () => {
    expect(formatPrice(1500, "MXN")).toBe(formatPrice(1500, "mxn"))
  })

  it("formats zero", () => {
    expect(formatPrice(0, "mxn")).toBe("$0")
  })
})
