/**
 * x402Fetch - Auto-retry fetch wrapper
 */

import type { Problem, Quote } from "@x402/core"
import type { X402FetchOptions, WidgetConfig, PaymentState } from "./types.js"
import { showPaymentModal } from "./ui/modal.js"

/**
 * Fetch wrapper that handles 402 responses automatically
 */
export async function x402Fetch(url: string, options?: X402FetchOptions): Promise<Response> {
  const config = options?.x402Config || {}
  const state: PaymentState = { status: "idle" }

  // Initial request
  let response = await fetch(url, options)

  // Handle 402
  if (response.status === 402) {
    state.status = "pending"
    config.onStateChange?.(state)

    const problem: Problem = await response.json()
    state.quote = problem.quote

    // Show payment modal
    const receiptId = await handlePayment(problem.quote, config)

    state.status = "paid"
    config.onStateChange?.(state)
    config.onPaid?.(receiptId)

    // Retry with receipt
    const retryOptions = {
      ...options,
      headers: {
        ...options?.headers,
        "X-402-Receipt": receiptId,
      },
    }

    response = await fetch(url, retryOptions)
  }

  return response
}

/**
 * Streaming fetch variant
 */
export async function x402FetchStream(url: string, options?: X402FetchOptions): Promise<ReadableStream<Uint8Array>> {
  const response = await x402Fetch(url, options)

  if (!response.body) {
    throw new Error("Response has no body")
  }

  return response.body
}

/**
 * Handle payment flow
 */
async function handlePayment(quote: Quote, config: WidgetConfig): Promise<string> {
  return new Promise((resolve, reject) => {
    showPaymentModal({
      quote,
      onClose: () => reject(new Error("Payment cancelled")),
      onPaid: (receiptId) => resolve(receiptId),
    })
  })
}

/**
 * Submit receipt to proxy
 */
export async function submitReceipt(quote: Quote, proof: Record<string, unknown>): Promise<string> {
  const response = await fetch("/x402/receipts", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      receipt: {
        quoteId: quote.quoteId,
        proof,
      },
      quote,
      publicKey: quote.publicKey,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to submit receipt: ${response.statusText}`)
  }

  const result = await response.json()
  return result.receiptId
}
