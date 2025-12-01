/**
 * Core enforcement middleware
 */

import type { RequestInput, Problem } from "@x402/core"
import { computeRequestHash, signQuote } from "@x402/core"
import type { ProxyConfig } from "./config.js"
import { DefaultPolicyEngine } from "./policy.js"
import { randomBytes } from "crypto"

export interface MiddlewareContext {
  request: RequestInput
  config: ProxyConfig
}

export interface MiddlewareResult {
  action: "allow" | "deny" | "forward"
  response?: Response
  receiptId?: string
}

/**
 * Main enforcement pipeline
 */
export async function enforcePayment(ctx: MiddlewareContext): Promise<MiddlewareResult> {
  const { request, config } = ctx

  // Check if route requires payment
  const policyEngine = new DefaultPolicyEngine(config.policy)
  const price = policyEngine.resolve(request)

  if (!price) {
    return { action: "forward" } // No payment required
  }

  // Check for receipt header
  const receiptId = request.headers?.["x-402-receipt"]
  if (receiptId) {
    // Verify receipt
    const stored = await config.store?.get(receiptId)
    if (!stored || !stored.verified) {
      return {
        action: "deny",
        response: new Response(JSON.stringify({ error: "Invalid receipt" }), {
          status: 403,
          headers: { "content-type": "application/json" },
        }),
      }
    }

    // Verify receipt matches request
    const requestHash = await computeRequestHash(request)
    if (stored.requestHash !== requestHash) {
      return {
        action: "deny",
        response: new Response(JSON.stringify({ error: "Receipt does not match request" }), {
          status: 403,
          headers: { "content-type": "application/json" },
        }),
      }
    }

    // Receipt valid, allow request
    return { action: "forward", receiptId }
  }

  // No receipt, generate quote and return 402
  const requestHash = await computeRequestHash(request)
  const quoteId = generateQuoteId()

  const quote = await signQuote(
    {
      quoteId,
      requestHash,
      price,
      expiresAt: Date.now() + 300000, // 5 minutes
      paymentMethods: config.paymentMethods || [],
    },
    {
      privateKey: config.signingKey,
    },
  )

  const problem: Problem = {
    type: "https://x402.dev/errors/payment-required",
    title: "Payment Required",
    status: 402,
    detail: `This request requires payment of ${price.amount} ${price.currency}`,
    quote,
  }

  return {
    action: "deny",
    response: new Response(JSON.stringify(problem), {
      status: 402,
      headers: {
        "content-type": "application/problem+json",
        "www-authenticate": 'Bearer realm="x402"',
      },
    }),
  }
}

function generateQuoteId(): string {
  return randomBytes(16).toString("hex")
}
