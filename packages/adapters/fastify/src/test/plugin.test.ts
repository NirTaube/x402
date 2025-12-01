import { describe, it, expect } from "vitest"
import Fastify from "fastify"
import x402Plugin from "../plugin.js"

describe("Fastify plugin", () => {
  it("should register plugin without errors", async () => {
    const fastify = Fastify()

    await expect(
      fastify.register(x402Plugin, {
        signingKey: "test-key",
        upstreamUrl: "http://localhost:3001",
        policy: {},
      }),
    ).resolves.not.toThrow()

    await fastify.close()
  })
})
