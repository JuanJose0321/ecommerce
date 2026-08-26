import { getRequestIp, isRateLimited } from "../rate-limit"

describe("isRateLimited", () => {
  it("allows requests up to the limit, then blocks the next one", () => {
    const key = `test-key-${Math.random()}`
    const options = { limit: 3, windowMs: 60_000 }

    expect(isRateLimited(key, options)).toBe(false)
    expect(isRateLimited(key, options)).toBe(false)
    expect(isRateLimited(key, options)).toBe(false)
    expect(isRateLimited(key, options)).toBe(true)
  })

  it("tracks separate keys independently", () => {
    const options = { limit: 1, windowMs: 60_000 }
    const keyA = `key-a-${Math.random()}`
    const keyB = `key-b-${Math.random()}`

    expect(isRateLimited(keyA, options)).toBe(false)
    expect(isRateLimited(keyB, options)).toBe(false)
    expect(isRateLimited(keyA, options)).toBe(true)
    expect(isRateLimited(keyB, options)).toBe(true)
  })

  it("resets the count once the window has elapsed", () => {
    jest.useFakeTimers()
    try {
      const key = `test-key-${Math.random()}`
      const options = { limit: 1, windowMs: 1_000 }

      expect(isRateLimited(key, options)).toBe(false)
      expect(isRateLimited(key, options)).toBe(true)

      jest.advanceTimersByTime(1_001)

      expect(isRateLimited(key, options)).toBe(false)
    } finally {
      jest.useRealTimers()
    }
  })
})

describe("getRequestIp", () => {
  it("uses the first address in x-forwarded-for when present", () => {
    expect(
      getRequestIp({ headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" } })
    ).toBe("1.2.3.4")
  })

  it("falls back to req.ip when there is no forwarded header", () => {
    expect(getRequestIp({ headers: {}, ip: "9.9.9.9" })).toBe("9.9.9.9")
  })

  it("falls back to 'unknown' when neither is available", () => {
    expect(getRequestIp({ headers: {} })).toBe("unknown")
  })
})
