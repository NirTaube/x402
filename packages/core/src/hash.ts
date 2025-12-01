/**
 * Request hashing - SHA-256 with standard encoding
 */

import { sha256 } from "@noble/hashes/sha256"
import { bytesToHex } from "@noble/hashes/utils"
import type { RequestInput } from "./types.js"
import { buildCanonicalRequest } from "./canonical.js"

/**
 * Compute requestHash from canonical request
 * Format: sha256:{hex}
 */
export async function computeRequestHash(input: RequestInput): Promise<string> {
  const canonical = buildCanonicalRequest(input)
  const bytes = new TextEncoder().encode(canonical)
  const hash = sha256(bytes)
  const hex = bytesToHex(hash)

  return `sha256:${hex}`
}

/**
 * Verify a requestHash matches the input
 */
export async function verifyRequestHash(input: RequestInput, expectedHash: string): Promise<boolean> {
  const computed = await computeRequestHash(input)
  return computed === expectedHash
}
