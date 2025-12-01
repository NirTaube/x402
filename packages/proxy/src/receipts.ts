/**
 * Receipt endpoints - POST and GET
 */

import type { Receipt, Quote } from "@x402/core"
import { verifyQuote, verifyReceipt, verifyReceiptBinding } from "@x402/core"
import type { ReceiptStore, StoredReceipt } from "./config.js"
import { randomBytes } from "crypto"

export interface ReceiptSubmission {
  receipt: Receipt
  quote: Quote
  publicKey: string
}

export interface ReceiptResponse {
  receiptId: string
  status: "accepted" | "rejected"
  error?: string
}

/**
 * Handle POST /x402/receipts
 */
export async function handleReceiptSubmission(
  submission: ReceiptSubmission,
  store: ReceiptStore,
): Promise<ReceiptResponse> {
  const { receipt, quote, publicKey } = submission

  // Verify quote signature
  const quoteVerification = await verifyQuote(quote, publicKey)
  if (!quoteVerification.valid) {
    return {
      receiptId: "",
      status: "rejected",
      error: `Invalid quote: ${quoteVerification.error}`,
    }
  }

  // Verify receipt binding
  if (!verifyReceiptBinding(receipt, quote)) {
    return {
      receiptId: "",
      status: "rejected",
      error: "Receipt does not match quote",
    }
  }

  // Verify receipt signature (if present)
  if (receipt.signature) {
    const receiptVerification = await verifyReceipt(receipt, publicKey)
    if (!receiptVerification.valid) {
      return {
        receiptId: "",
        status: "rejected",
        error: `Invalid receipt signature: ${receiptVerification.error}`,
      }
    }
  }

  // TODO: Verify payment proof (Lightning preimage, onchain txid, etc.)
  // For MVP, we accept any proof
  const proofValid = await verifyPaymentProof(receipt.proof)
  if (!proofValid) {
    return {
      receiptId: "",
      status: "rejected",
      error: "Payment proof verification failed",
    }
  }

  // Generate receipt ID
  const receiptId = generateReceiptId()

  // Store receipt
  const storedReceipt: StoredReceipt = {
    receiptId,
    quoteId: receipt.quoteId,
    requestHash: quote.requestHash,
    proof: receipt.proof,
    verified: true,
    createdAt: Date.now(),
    expiresAt: quote.expiresAt,
  }

  await store.set(receiptId, storedReceipt)

  return {
    receiptId,
    status: "accepted",
  }
}

/**
 * Handle GET /x402/receipts/:receiptId
 */
export async function handleReceiptLookup(receiptId: string, store: ReceiptStore): Promise<StoredReceipt | null> {
  return await store.get(receiptId)
}

/**
 * Verify payment proof (stub for MVP)
 */
async function verifyPaymentProof(proof: Record<string, unknown>): Promise<boolean> {
  // MVP: Accept any proof
  // Production: Verify Lightning preimage, onchain confirmation, etc.
  return Object.keys(proof).length > 0
}

/**
 * Generate unique receipt ID
 */
function generateReceiptId(): string {
  return randomBytes(16).toString("hex")
}
