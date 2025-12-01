/**
 * Standalone HTTP server
 */

import { createServer, type IncomingMessage, type ServerResponse } from "http"
import type { ProxyConfig } from "./config.js"
import { enforcePayment } from "./middleware.js"
import { forwardRequest } from "./forward.js"
import { handleReceiptSubmission, handleReceiptLookup } from "./receipts.js"
import { MemoryStore } from "./store.js"
import type { RequestInput } from "@x402/core"

export function createProxy(config: ProxyConfig) {
  const store = config.store || new MemoryStore()

  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    try {
      // Handle receipt endpoints
      if (req.url?.startsWith("/x402/receipts")) {
        await handleReceiptEndpoint(req, res, store, config)
        return
      }

      // Parse request
      const request = await parseRequest(req)

      // Enforce payment
      const result = await enforcePayment({ request, config: { ...config, store } })

      if (result.action === "deny" && result.response) {
        await sendResponse(res, result.response)
        return
      }

      if (result.action === "forward") {
        const upstream = await forwardRequest({
          upstreamUrl: config.upstreamUrl,
          request,
          headers: result.receiptId ? { "x-402-receipt-verified": result.receiptId } : undefined,
        })

        await sendResponse(res, upstream)
        return
      }
    } catch (error) {
      console.error("Proxy error:", error)
      res.writeHead(500, { "content-type": "application/json" })
      res.end(JSON.stringify({ error: "Internal server error" }))
    }
  })

  return {
    listen(port?: number) {
      const actualPort = port || config.port || 3000
      server.listen(actualPort)
      console.log(`x402 proxy listening on http://localhost:${actualPort}`)
      console.log(`Upstream: ${config.upstreamUrl}`)
    },
    close() {
      server.close()
    },
  }
}

async function parseRequest(req: IncomingMessage): Promise<RequestInput> {
  const url = new URL(req.url || "/", `http://${req.headers.host}`)

  let body: string | undefined
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await readBody(req)
  }

  return {
    method: req.method || "GET",
    path: url.pathname,
    query: url.search.slice(1),
    headers: req.headers as Record<string, string>,
    body,
  }
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on("data", (chunk) => chunks.push(chunk))
    req.on("end", () => resolve(Buffer.concat(chunks).toString()))
    req.on("error", reject)
  })
}

async function sendResponse(res: ServerResponse, response: Response) {
  res.writeHead(response.status, Object.fromEntries(response.headers))

  if (!response.body) {
    res.end()
    return
  }

  // Stream response body
  const reader = response.body.getReader()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(value)
    }
  } finally {
    reader.releaseLock()
  }

  res.end()
}

async function handleReceiptEndpoint(req: IncomingMessage, res: ServerResponse, store: any, config: ProxyConfig) {
  const url = new URL(req.url || "/", `http://${req.headers.host}`)

  // POST /x402/receipts
  if (req.method === "POST" && url.pathname === "/x402/receipts") {
    const body = await readBody(req)
    const data = JSON.parse(body)

    const result = await handleReceiptSubmission(data, store)

    res.writeHead(result.status === "accepted" ? 200 : 400, { "content-type": "application/json" })
    res.end(JSON.stringify(result))
    return
  }

  // GET /x402/receipts/:id
  const match = url.pathname.match(/^\/x402\/receipts\/([^/]+)$/)
  if (req.method === "GET" && match) {
    const receiptId = match[1]
    const receipt = await handleReceiptLookup(receiptId, store)

    if (!receipt) {
      res.writeHead(404, { "content-type": "application/json" })
      res.end(JSON.stringify({ error: "Receipt not found" }))
      return
    }

    res.writeHead(200, { "content-type": "application/json" })
    res.end(JSON.stringify(receipt))
    return
  }

  res.writeHead(404)
  res.end()
}
