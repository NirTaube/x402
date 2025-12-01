/**
 * Tests for enforcement middleware
 */

import { describe, it, expect, beforeEach } from "vitest"
import { enforcePayment } from "../middleware.js"
import { MemoryStore } from "../store.js"
import type { ProxyConfig } from "../config.js"

describe("Enforcement Middleware", () => {
  let config: ProxyConfig

  beforeEach(() => {
    config = {
      signingKey: "a".repeat(64),
      upstreamUrl: "http://localhost:3001",
      policy: {
        "/api/generate": {
          price: 1000,
          currency: "sat",
        },
      },
      store: new MemoryStore(),
    }
  })

  it("forwards requests with no policy", async () => {
    const result = await enforcePayment({
      request: {
        method: "GET",
        path: "/api/free",
      },
      config,
    })

    expect(result.action).toBe("forward")
  })

  it("returns 402 for protected routes without receipt", async () => {
    const result = await enforcePayment({
      request: {
        method: "POST",
        path: "/api/generate",
        body: '{"prompt":"test"}',
      },
      config,
    })

    expect(result.action).toBe("deny")
    expect(result.response?.status).toBe(402)

    const body = await result.response?.json()
    expect(body).toHaveProperty("quote")
    expect(body.quote).toHaveProperty("requestHash")
    expect(body.quote).toHaveProperty("signature")
  })

  it("allows requests with valid receipt", async () => {
    // First, get a quote
    const quoteResult = await enforcePayment({
      request: {
        method: "POST",
        path: "/api/generate",
        body: '{"prompt":"test"}',
      },
      config,
    })

    const problem = await quoteResult.response?.json()
    const quote = problem.quote

    // Submit receipt (mock)
    const receiptId = "test-receipt-123"
    await config.store!.set(receiptId, {
      receiptId,
      quoteId: quote.quoteId,
      requestHash: quote.requestHash,
      proof: { mock: true },
      verified: true,
      createdAt: Date.now(),
    })

    // Retry with receipt
    const result = await enforcePayment({
      request: {
        method: "POST",
        path: "/api/generate",
        body: '{"prompt":"test"}',
        headers: {
          "x-402-receipt": receiptId,
        },
      },
      config,
    })

    expect(result.action).toBe("forward")
    expect(result.receiptId).toBe(receiptId)
  })
})
