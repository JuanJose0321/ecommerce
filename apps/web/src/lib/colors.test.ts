import { describe, expect, it } from "vitest"
import { colorToHex } from "./colors"

describe("colorToHex", () => {
  it("resolves known Spanish color names", () => {
    expect(colorToHex("negro")).toBe("#111111")
    expect(colorToHex("oro rosa")).toBe("#e0b0a2")
  })

  it("is case-insensitive", () => {
    expect(colorToHex("NEGRO")).toBe(colorToHex("negro"))
  })

  it("falls back to a neutral gray for unknown colors", () => {
    expect(colorToHex("morado")).toBe("#a3a3a3")
  })
})
