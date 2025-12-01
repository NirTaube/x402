/**
 * Next.js-specific configuration helpers
 */

import type { ProxyConfig } from "@x402/proxy/config"
import { MemoryReceiptStore } from "@x402/proxy/store"

export function createNextConfig(overrides?: Partial<ProxyConfig>): ProxyConfig {
  return {
    signingKey: process.env.X402_SIGNING_KEY || "",
    upstreamUrl: process.env.X402_UPSTREAM_URL || "",
    policy: {},
    store: new MemoryReceiptStore(),
    ...overrides,
  }
}
