/**
 * Workers-specific configuration helpers
 */

import type { ProxyConfig } from "@x402/proxy/config"
import { KVReceiptStore } from "./storage.js"
import type { KVNamespace } from "workers-types"

export function createWorkersConfig(env: { RECEIPTS: KVNamespace }, overrides?: Partial<ProxyConfig>): ProxyConfig {
  return {
    signingKey: "",
    upstreamUrl: "",
    policy: {},
    store: new KVReceiptStore(env.RECEIPTS),
    ...overrides,
  }
}
