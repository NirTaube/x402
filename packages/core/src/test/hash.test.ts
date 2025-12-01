/**
 * Tests for request hashing
 */

import { describe, it, expect } from "vitest"
import { computeRequestHash } from "../hash.js"
import { buildCanonicalRequest, normalizeQuery, normalizePath } from "../canonical.js"

describe("Request Hashing", () => {
  it("computes deterministic hash for same request", async () => {
    const input = {
      method: "POST",
      path: "/api/generate",
      query: "model=gpt-4",
      headers: { "content-type": "application/json" },
      body: '{"prompt":"Hello"}',
    }

    const hash1 = await computeRequestHash(input)
    const hash2 = await computeRequestHash(input)

    expect(hash1).toBe(hash2)
    expect(hash1).toMatch(/^sha256:[0-9a-f]{64}$/)
  })

  it("produces different hashes for different requests", async () => {
    const input1 = {
      method: "POST",
      path: "/api/generate",
      body: '{"prompt":"Hello"}',
    }

    const input2 = {
      method: "POST",
      path: "/api/generate",
      body: '{"prompt":"World"}',
    }

    const hash1 = await computeRequestHash(input1)
    const hash2 = await computeRequestHash(input2)

    expect(hash1).not.toBe(hash2)
  })

  it("normalizes query parameter order", () => {
    const query1 = normalizeQuery("b=2&a=1")
    const query2 = normalizeQuery("a=1&b=2")

    expect(query1).toBe(query2)
  })

  it("normalizes path casing and trailing slash", () => {
    expect(normalizePath("/API/Generate/")).toBe("/api/generate")
    expect(normalizePath("/API/Generate")).toBe("/api/generate")
  })

  it("handles empty body", async () => {
    const input = {
      method: "GET",
      path: "/api/data",
    }

    const hash = await computeRequestHash(input)
    expect(hash).toMatch(/^sha256:[0-9a-f]{64}$/)
  })

  it("canonicalizes JSON body with sorted keys", () => {
    const canonical = buildCanonicalRequest({
      method: "POST",
      path: "/api/test",
      headers: { "content-type": "application/json" },
      body: '{"z":3,"a":1,"m":2}',
    })

    expect(canonical).toContain('{"a":1,"m":2,"z":3}')
  })
})
