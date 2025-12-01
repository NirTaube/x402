/**
 * Next.js Route Handler wrapper
 */

import { type NextRequest, NextResponse } from "next/server"
import type { RequestInput } from "@x402/core"
import { enforcePayment } from "@x402/proxy/middleware"
import type { ProxyConfig } from "@x402/proxy/config"

export interface RouteConfig extends Partial<ProxyConfig> {
  priceAmount?: number
  priceCurrency?: string
}

/**
 * Wrap a route handler with x402 protection
 */
export function withX402<T extends (...args: any[]) => Promise<Response>>(handler: T, config: RouteConfig): T {
  return (async (req: NextRequest, ...args: any[]) => {
    const requestInput: RequestInput = {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries()),
      body: req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined,
    }

    const result = await enforcePayment({
      request: requestInput,
      config: {
        ...config,
        policy: {
          "*": {
            amount: config.priceAmount || 100,
            currency: config.priceCurrency || "sats",
          },
        },
      } as ProxyConfig,
    })

    if (result.action === "deny" && result.response) {
      return new NextResponse(result.response.body, {
        status: result.response.status,
        headers: result.response.headers,
      })
    }

    return handler(req, ...args)
  }) as T
}
