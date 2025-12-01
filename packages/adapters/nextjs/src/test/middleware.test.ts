import { describe, it, expect } from "vitest"
import { createX402Middleware } from "../middleware.js"
import { NextRequest } from "next/server"

describe("Next.js middleware", () => {
  it("should allow requests without payment requirement", async () => {
    const middleware = createX402Middleware({
      signingKey: "test-key",
      upstreamUrl: "http://localhost:3001",
      policy: {},
      exclude: ["/api/public"],
    })

    const req = new NextRequest("http://localhost:3000/api/public")
    const res = await middleware(req)

    expect(res.status).toBe(200)
  })

  it("should return 402 for protected routes without receipt", async () => {
    const middleware = createX402Middleware({
      signingKey: "test-key",
      upstreamUrl: "http://localhost:3001",
      policy: {
        "/api/generate": { amount: 1000, currency: "sats" },
      },
    })

    const req = new NextRequest("http://localhost:3000/api/generate", {
      method: "POST",
    })
    const res = await middleware(req)

    expect(res.status).toBe(402)
    const body = await res.json()
    expect(body).toHaveProperty("quote")
  })
})
