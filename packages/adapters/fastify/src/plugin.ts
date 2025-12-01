/**
 * Fastify plugin adapter
 */

import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify"
import fp from "fastify-plugin"
import type { RequestInput } from "@x402/core"
import { enforcePayment } from "@x402/proxy/middleware"
import type { ProxyConfig } from "@x402/proxy/config"

export interface X402PluginOptions extends Partial<ProxyConfig> {}

const x402Plugin: FastifyPluginAsync<X402PluginOptions> = async (fastify, options) => {
  fastify.addHook("onRequest", async (request: FastifyRequest, reply: FastifyReply) => {
    // Convert Fastify request to RequestInput
    const requestInput: RequestInput = {
      method: request.method,
      url: `${request.protocol}://${request.hostname}${request.url}`,
      headers: request.headers as Record<string, string>,
      body: request.method !== "GET" && request.method !== "HEAD" ? JSON.stringify(request.body) : undefined,
    }

    // Run enforcement
    const result = await enforcePayment({
      request: requestInput,
      config: options as ProxyConfig,
    })

    if (result.action === "deny" && result.response) {
      const body = await result.response.text()
      return reply
        .code(result.response.status)
        .headers(Object.fromEntries(result.response.headers.entries()))
        .send(body)
    }

    if (result.action === "forward" && result.receiptId) {
      request.x402ReceiptId = result.receiptId
    }
  })

  fastify.decorateRequest("x402ReceiptId", null)
}

export default fp(x402Plugin, {
  name: "@x402/fastify",
  fastify: "4.x",
})
