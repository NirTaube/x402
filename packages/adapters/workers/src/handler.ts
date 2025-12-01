/**
 * Cloudflare Workers handler
 */

import type { RequestInput } from "@x402/core"
import { enforcePayment } from "@x402/proxy/middleware"
import type { ProxyConfig } from "@x402/proxy/config"
import type { KVNamespace } from "@cloudflare/workers-types"

export interface WorkersEnv {
  X402_SIGNING_KEY: string
  X402_UPSTREAM_URL: string
  RECEIPTS: KVNamespace
}

export interface X402WorkersConfig extends Partial<ProxyConfig> {
  env: WorkersEnv
}

/**
 * Create Workers fetch handler with x402 protection
 */
export function createX402Handler(config: X402WorkersConfig) {
  return async (request: Request, env: WorkersEnv): Promise<Response> => {
    // Convert Workers request to RequestInput
    const requestInput: RequestInput = {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
      body: request.method !== "GET" && request.method !== "HEAD" ? await request.text() : undefined,
    }

    // Run enforcement with KV storage
    const result = await enforcePayment({
      request: requestInput,
      config: {
        ...config,
        signingKey: env.X402_SIGNING_KEY,
        upstreamUrl: env.X402_UPSTREAM_URL,
      } as ProxyConfig,
    })

    if (result.action === "deny" && result.response) {
      return result.response
    }

    // Forward to upstream
    const upstream = new URL(requestInput.url)
    upstream.host = new URL(env.X402_UPSTREAM_URL).host

    return fetch(upstream.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body,
    })
  }
}
