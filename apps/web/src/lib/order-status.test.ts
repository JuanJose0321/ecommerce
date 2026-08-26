import { describe, expect, it } from "vitest"
import { getFulfillmentLabel, getFulfillmentTone } from "./order-status"

describe("getFulfillmentLabel", () => {
  it("maps known statuses to Spanish labels", () => {
    expect(getFulfillmentLabel("not_fulfilled")).toBe("Procesando")
    expect(getFulfillmentLabel("shipped")).toBe("Enviado")
    expect(getFulfillmentLabel("delivered")).toBe("Entregado")
    expect(getFulfillmentLabel("canceled")).toBe("Cancelado")
  })

  it("falls back to the raw status for unknown values", () => {
    expect(getFulfillmentLabel("some_future_status")).toBe("some_future_status")
  })
})

describe("getFulfillmentTone", () => {
  it("returns green for delivered states", () => {
    expect(getFulfillmentTone("delivered")).toBe("green")
    expect(getFulfillmentTone("partially_delivered")).toBe("green")
  })

  it("returns amber for shipped states", () => {
    expect(getFulfillmentTone("shipped")).toBe("amber")
    expect(getFulfillmentTone("partially_shipped")).toBe("amber")
  })

  it("returns destructive for canceled", () => {
    expect(getFulfillmentTone("canceled")).toBe("destructive")
  })

  it("returns muted as the fallback", () => {
    expect(getFulfillmentTone("not_fulfilled")).toBe("muted")
    expect(getFulfillmentTone("unknown")).toBe("muted")
  })
})
