/**
 * Next.js middleware adapter
 */

import { type NextRequest, NextResponse } from "next/server"
import type { RequestInput } from "@x402/core"
import { enforcePayment } from "@x402/proxy/middleware"
import type { ProxyConfig } from "@x402/proxy/config"

export interface X402MiddlewareConfig extends Partial<ProxyConfig> {
  matcher?: string[]
  exclude?: string[]
}

/**
 * Create Next.js middleware for x402 protection
 */
export function createX402Middleware(config: X402MiddlewareConfig) {
  return async function middleware(req: NextRequest) {
    const url = new URL(req.url)

    // Check exclusions
    if (config.exclude?.some((pattern) => matchPattern(url.pathname, pattern))) {
      return NextResponse.next()
    }

    // Convert Next.js request to RequestInput
    const requestInput: RequestInput = {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries()),
      body: req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined,
    }

    // Run enforcement
    const result = await enforcePayment({
      request: requestInput,
      config: config as ProxyConfig,
    })

    if (result.action === "deny" && result.response) {
      return new NextResponse(result.response.body, {
        status: result.response.status,
        headers: result.response.headers,
      })
    }

    if (result.action === "forward") {
      const response = NextResponse.next()
      if (result.receiptId) {
        response.headers.set("x-402-receipt-verified", result.receiptId)
      }
      return response
    }

    return NextResponse.next()
  }
}

function matchPattern(path: string, pattern: string): boolean {
  const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$")
  return regex.test(path)
}
