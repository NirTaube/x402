/**
 * Streaming-safe upstream forwarding
 */

import type { RequestInput } from "@x402/core"

export interface ForwardOptions {
  upstreamUrl: string
  request: RequestInput
  headers?: Record<string, string>
}

/**
 * Forward request to upstream without buffering
 */
export async function forwardRequest(options: ForwardOptions): Promise<Response> {
  const { upstreamUrl, request, headers } = options

  // Build upstream URL
  const url = new URL(request.path, upstreamUrl)
  if (request.query) {
    url.search = request.query
  }

  // Prepare headers
  const forwardHeaders = new Headers(request.headers)
  if (headers) {
    for (const [key, value] of Object.entries(headers)) {
      forwardHeaders.set(key, value)
    }
  }

  // Remove hop-by-hop headers
  const hopByHop = [
    "connection",
    "keep-alive",
    "transfer-encoding",
    "upgrade",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
  ]
  for (const header of hopByHop) {
    forwardHeaders.delete(header)
  }

  // Forward request
  const upstreamResponse = await fetch(url.toString(), {
    method: request.method,
    headers: forwardHeaders,
    body: request.body ? (typeof request.body === "string" ? request.body : request.body) : undefined,
    // @ts-expect-error - duplex required for streaming
    duplex: "half",
  })

  // Return response directly (streaming)
  return upstreamResponse
}
