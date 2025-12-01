/**
 * Signature and quote/receipt verification
 */

import { ed25519 } from "@noble/ed25519"
import { hexToBytes } from "@noble/hashes/utils"
import type { Quote, Receipt, VerificationResult } from "./types.js"

/**
 * Verify quote signature
 */
export async function verifyQuote(quote: Quote, publicKey: string | Uint8Array): Promise<VerificationResult> {
  try {
    // Rebuild canonical JSON
    const canonical = JSON.stringify(
      {
        expiresAt: quote.expiresAt,
        paymentMethods: quote.paymentMethods,
        price: quote.price,
        quoteId: quote.quoteId,
        requestHash: quote.requestHash,
      },
      null,
      0,
    )

    const message = new TextEncoder().encode(canonical)
    const signature = hexToBytes(quote.signature)
    const pubKey = typeof publicKey === "string" ? hexToBytes(publicKey) : publicKey

    const valid = await ed25519.verify(signature, message, pubKey)

    if (!valid) {
      return { valid: false, error: "Invalid signature" }
    }

    // Check expiry (with 5 minute skew tolerance)
    const now = Date.now()
    const skew = 5 * 60 * 1000

    if (quote.expiresAt < now - skew) {
      return { valid: false, error: "Quote expired" }
    }

    return { valid: true, quote }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Verification failed",
    }
  }
}

/**
 * Verify receipt signature (if present)
 */
export async function verifyReceipt(receipt: Receipt, publicKey: string | Uint8Array): Promise<VerificationResult> {
  if (!receipt.signature) {
    return { valid: true } // Signature is optional
  }

  try {
    const canonical = JSON.stringify(
      {
        idempotencyKey: receipt.idempotencyKey,
        proof: receipt.proof,
        quoteId: receipt.quoteId,
      },
      null,
      0,
    )

    const message = new TextEncoder().encode(canonical)
    const signature = hexToBytes(receipt.signature)
    const pubKey = typeof publicKey === "string" ? hexToBytes(publicKey) : publicKey

    const valid = await ed25519.verify(signature, message, pubKey)

    return valid ? { valid: true } : { valid: false, error: "Invalid receipt signature" }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Verification failed",
    }
  }
}

/**
 * Verify receipt is bound to quote
 */
export function verifyReceiptBinding(receipt: Receipt, quote: Quote): boolean {
  return receipt.quoteId === quote.quoteId
}
