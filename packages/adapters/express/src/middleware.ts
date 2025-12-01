/**
 * Express middleware adapter
 */

import type { Request, Response, NextFunction } from "express"
import type { RequestInput } from "@x402/core"
import { enforcePayment } from "@x402/proxy/middleware"
import type { ProxyConfig } from "@x402/proxy/config"

export interface X402Options extends Partial<ProxyConfig> {}

/**
 * Create Express middleware for x402 protection
 */
export function x402(options: X402Options) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Convert Express request to RequestInput
      const requestInput: RequestInput = {
        method: req.method,
        url: `${req.protocol}://${req.get("host")}${req.originalUrl}`,
        headers: req.headers as Record<string, string>,
        body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined,
      }

      // Run enforcement
      const result = await enforcePayment({
        request: requestInput,
        config: options as ProxyConfig,
      })

      if (result.action === "deny" && result.response) {
        const body = await result.response.text()
        return res.status(result.response.status).set(Object.fromEntries(result.response.headers.entries())).send(body)
      }

      if (result.action === "forward" && result.receiptId) {
        res.locals.x402ReceiptId = result.receiptId
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}
