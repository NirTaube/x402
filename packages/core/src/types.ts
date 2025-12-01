/**
 * Core types for x402 protocol
 */

export interface RequestInput {
  method: string
  path: string
  query?: string
  headers?: Record<string, string>
  body?: string | Uint8Array
}

export interface Price {
  amount: number
  currency: string
}

export interface PaymentMethod {
  type: "lightning" | "onchain" | "custom"
  address?: string
  invoice?: string
  metadata?: Record<string, unknown>
}

export interface Quote {
  quoteId: string
  requestHash: string
  price: Price
  expiresAt: number
  paymentMethods: PaymentMethod[]
  signature: string
  publicKey?: string
}

export interface Receipt {
  quoteId: string
  idempotencyKey?: string
  proof: {
    txid?: string
    preimage?: string
    [key: string]: unknown
  }
  signature?: string
  submittedAt?: number
}

export interface Problem {
  type: string
  title: string
  status: 402
  detail?: string
  instance?: string
  quote: Quote
}

export interface VerificationResult {
  valid: boolean
  error?: string
  quote?: Quote
}

export interface SigningOptions {
  privateKey: string | Uint8Array
  publicKey?: string | Uint8Array
}
