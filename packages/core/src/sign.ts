/**
 * Ed25519 signing for quotes and receipts
 */

import { ed25519 } from "@noble/ed25519"
import { sha256 } from "@noble/hashes/sha256"
import { bytesToHex, hexToBytes } from "@noble/hashes/utils"
import type { Quote, Receipt, SigningOptions, Price } from "./types.js"

// Enable synchronous signing
ed25519.etc.sha512Sync = (...m) => sha256(ed25519.etc.concatBytes(...m))

/**
 * Sign a quote with Ed25519
 */
export async function signQuote(
  data: {
    quoteId: string
    requestHash: string
    price: Price
    expiresAt: number
    paymentMethods: unknown[]
  },
  options: SigningOptions,
): Promise<Quote> {
  // Build canonical JSON (sorted keys)
  const canonical = JSON.stringify(
    {
      expiresAt: data.expiresAt,
      paymentMethods: data.paymentMethods,
      price: data.price,
      quoteId: data.quoteId,
      requestHash: data.requestHash,
    },
    null,
    0,
  )

  const message = new TextEncoder().encode(canonical)
  const privateKey = typeof options.privateKey === "string" ? hexToBytes(options.privateKey) : options.privateKey

  const signature = await ed25519.sign(message, privateKey)
  const signatureHex = bytesToHex(signature)

  let publicKey: string | undefined
  if (options.publicKey) {
    publicKey = typeof options.publicKey === "string" ? options.publicKey : bytesToHex(options.publicKey)
  }

  return {
    ...data,
    signature: signatureHex,
    publicKey,
  }
}

/**
 * Sign a receipt with Ed25519 (optional - client-side)
 */
export async function signReceipt(
  data: {
    quoteId: string
    proof: Record<string, unknown>
    idempotencyKey?: string
  },
  options: SigningOptions,
): Promise<Receipt> {
  const canonical = JSON.stringify(
    {
      idempotencyKey: data.idempotencyKey,
      proof: data.proof,
      quoteId: data.quoteId,
    },
    null,
    0,
  )

  const message = new TextEncoder().encode(canonical)
  const privateKey = typeof options.privateKey === "string" ? hexToBytes(options.privateKey) : options.privateKey

  const signature = await ed25519.sign(message, privateKey)
  const signatureHex = bytesToHex(signature)

  return {
    ...data,
    signature: signatureHex,
    submittedAt: Date.now(),
  }
}

/**
 * Generate Ed25519 key pair
 */
export async function generateKeyPair(): Promise<{
  privateKey: string
  publicKey: string
}> {
  const privateKey = ed25519.utils.randomPrivateKey()
  const publicKey = await ed25519.getPublicKey(privateKey)

  return {
    privateKey: bytesToHex(privateKey),
    publicKey: bytesToHex(publicKey),
  }
}
