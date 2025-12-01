import { describe, it, expect, vi } from "vitest"
import { x402 } from "../middleware.js"

describe("Express middleware", () => {
  it("should call next() when payment not required", async () => {
    const middleware = x402({
      signingKey: "test-key",
      upstreamUrl: "http://localhost:3001",
      policy: {},
    })

    const req = {
      method: "GET",
      protocol: "http",
      get: () => "localhost:3000",
      originalUrl: "/api/public",
      headers: {},
    } as any

    const res = {} as any
    const next = vi.fn()

    await middleware(req, res, next)
    expect(next).toHaveBeenCalled()
  })
})
