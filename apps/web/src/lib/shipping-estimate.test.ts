import { describe, expect, it } from "vitest"
import { estimateShippingByPostalCode } from "./shipping-estimate"

describe("estimateShippingByPostalCode", () => {
  it("returns null for a non 5-digit input", () => {
    expect(estimateShippingByPostalCode("123")).toBeNull()
    expect(estimateShippingByPostalCode("123456")).toBeNull()
    expect(estimateShippingByPostalCode("abcde")).toBeNull()
    expect(estimateShippingByPostalCode("")).toBeNull()
  })

  it("classifies the CDMX range boundaries as CDMX", () => {
    expect(estimateShippingByPostalCode("01000")?.zone).toBe("CDMX")
    expect(estimateShippingByPostalCode("16999")?.zone).toBe("CDMX")
    expect(estimateShippingByPostalCode("09000")?.zone).toBe("CDMX")
  })

  it("classifies postal codes outside the CDMX range as Nacional", () => {
    expect(estimateShippingByPostalCode("00999")?.zone).toBe("Nacional")
    expect(estimateShippingByPostalCode("17000")?.zone).toBe("Nacional")
    expect(estimateShippingByPostalCode("64000")?.zone).toBe("Nacional")
  })

  it("trims surrounding whitespace before validating", () => {
    expect(estimateShippingByPostalCode(" 01000 ")?.zone).toBe("CDMX")
  })
})
