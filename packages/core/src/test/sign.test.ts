/**
 * Tests for signing and verification
 */

import { describe, it, expect } from "vitest"
import { signQuote, generateKeyPair } from "../sign.js"
import { verifyQuote } from "../verify.js"

describe("Signing", () => {
  it("generates valid key pairs", async () => {
    const keys = await generateKeyPair()

    expect(keys.privateKey).toMatch(/^[0-9a-f]{64}$/)
    expect(keys.publicKey).toMatch(/^[0-9a-f]{64}$/)
  })

  it("signs and verifies quotes", async () => {
    const keys = await generateKeyPair()

    const quote = await signQuote(
      {
        quoteId: "test-123",
        requestHash: "sha256:abc123",
        price: { amount: 1000, currency: "sat" },
        expiresAt: Date.now() + 300000,
        paymentMethods: [{ type: "lightning" }],
      },
      { privateKey: keys.privateKey, publicKey: keys.publicKey },
    )

    const result = await verifyQuote(quote, keys.publicKey)

    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it("rejects quotes with invalid signatures", async () => {
    const keys = await generateKeyPair()
    const otherKeys = await generateKeyPair()

    const quote = await signQuote(
      {
        quoteId: "test-123",
        requestHash: "sha256:abc123",
        price: { amount: 1000, currency: "sat" },
        expiresAt: Date.now() + 300000,
        paymentMethods: [],
      },
      { privateKey: keys.privateKey },
    )

    // Verify with wrong public key
    const result = await verifyQuote(quote, otherKeys.publicKey)

    expect(result.valid).toBe(false)
    expect(result.error).toBeDefined()
  })

  it("rejects expired quotes", async () => {
    const keys = await generateKeyPair()

    const quote = await signQuote(
      {
        quoteId: "test-123",
        requestHash: "sha256:abc123",
        price: { amount: 1000, currency: "sat" },
        expiresAt: Date.now() - 600000, // 10 minutes ago
        paymentMethods: [],
      },
      { privateKey: keys.privateKey },
    )

    const result = await verifyQuote(quote, keys.publicKey)

    expect(result.valid).toBe(false)
    expect(result.error).toContain("expired")
  })
})
