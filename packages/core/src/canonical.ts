/**
 * Request canonicalization per spec/canonicalization.md
 */

import type { RequestInput } from "./types.js"

/**
 * Normalize HTTP method to uppercase
 */
export function normalizeMethod(method: string): string {
  return method.toUpperCase()
}

/**
 * Normalize path:
 * - Lowercase
 * - Remove trailing slash (except root)
 * - URL decode
 */
export function normalizePath(path: string): string {
  let normalized = decodeURIComponent(path).toLowerCase()

  // Remove trailing slash except for root
  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1)
  }

  return normalized
}

/**
 * Normalize query string:
 * - Sort parameters alphabetically
 * - URL decode keys and values
 * - Join with &
 */
export function normalizeQuery(query?: string): string {
  if (!query) return ""

  const params = new URLSearchParams(query)
  const sorted = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&")

  return sorted
}

/**
 * Normalize headers:
 * - Include only: content-type, content-length
 * - Lowercase header names
 * - Trim values
 */
export function normalizeHeaders(headers?: Record<string, string>): string {
  if (!headers) return ""

  const included = ["content-type", "content-length"]
  const normalized: string[] = []

  for (const [key, value] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase()
    if (included.includes(lowerKey)) {
      normalized.push(`${lowerKey}:${value.trim()}`)
    }
  }

  return normalized.sort().join("\n")
}

/**
 * Normalize body:
 * - If JSON: canonicalize (sorted keys, no whitespace)
 * - Otherwise: use raw bytes
 * - Empty body = empty string
 */
export function normalizeBody(body?: string | Uint8Array, contentType?: string): string {
  if (!body) return ""

  const bodyStr = typeof body === "string" ? body : new TextDecoder().decode(body)

  if (contentType?.includes("application/json")) {
    try {
      const parsed = JSON.parse(bodyStr)
      return JSON.stringify(parsed, Object.keys(parsed).sort())
    } catch {
      // If parsing fails, use raw body
      return bodyStr
    }
  }

  return bodyStr
}

/**
 * Build canonical request representation
 * Format: {method}\n{path}?{query}\n{headers}\n{body}
 */
export function buildCanonicalRequest(input: RequestInput): string {
  const method = normalizeMethod(input.method)
  const path = normalizePath(input.path)
  const query = normalizeQuery(input.query)
  const headers = normalizeHeaders(input.headers)
  const body = normalizeBody(input.body, input.headers?.["content-type"])

  const pathWithQuery = query ? `${path}?${query}` : path

  const parts = [method, pathWithQuery]

  if (headers) {
    parts.push(headers)
  }

  if (body) {
    parts.push(body)
  }

  return parts.join("\n")
}
