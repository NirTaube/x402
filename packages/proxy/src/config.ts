/**
 * Proxy configuration
 */

import type { PolicyRule } from "./policy.js"

export interface ProxyConfig {
  signingKey: string
  upstreamUrl: string
  port?: number
  policy: Record<string, PolicyRule>
  store?: ReceiptStore
  paymentMethods?: PaymentMethod[]
  cors?: CorsConfig
  rateLimit?: RateLimitConfig
}

export interface PaymentMethod {
  type: "lightning" | "onchain" | "custom"
  address?: string
  node?: string
  metadata?: Record<string, unknown>
}

export interface CorsConfig {
  origin?: string | string[]
  credentials?: boolean
}

export interface RateLimitConfig {
  windowMs: number
  maxQuotes: number
}

export interface ReceiptStore {
  get(receiptId: string): Promise<StoredReceipt | null>
  set(receiptId: string, receipt: StoredReceipt): Promise<void>
  delete(receiptId: string): Promise<void>
}

export interface StoredReceipt {
  receiptId: string
  quoteId: string
  requestHash: string
  proof: Record<string, unknown>
  verified: boolean
  createdAt: number
  expiresAt?: number
}

export function loadConfig(overrides?: Partial<ProxyConfig>): ProxyConfig {
  const config: ProxyConfig = {
    signingKey: process.env.X402_SIGNING_KEY || "",
    upstreamUrl: process.env.X402_UPSTREAM_URL || "http://localhost:3001",
    port: Number.parseInt(process.env.X402_PORT || "3000", 10),
    policy: {},
    ...overrides,
  }

  if (!config.signingKey) {
    throw new Error("X402_SIGNING_KEY is required")
  }

  if (!config.upstreamUrl) {
    throw new Error("X402_UPSTREAM_URL is required")
  }

  return config
}
