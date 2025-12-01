/**
 * Receipt storage implementations
 */

import type { ReceiptStore, StoredReceipt } from "./config.js"

/**
 * In-memory store (development only)
 */
export class MemoryStore implements ReceiptStore {
  private store = new Map<string, StoredReceipt>()

  async get(receiptId: string): Promise<StoredReceipt | null> {
    return this.store.get(receiptId) || null
  }

  async set(receiptId: string, receipt: StoredReceipt): Promise<void> {
    this.store.set(receiptId, receipt)

    // Auto-cleanup after expiry
    if (receipt.expiresAt) {
      const ttl = receipt.expiresAt - Date.now()
      if (ttl > 0) {
        setTimeout(() => this.store.delete(receiptId), ttl)
      }
    }
  }

  async delete(receiptId: string): Promise<void> {
    this.store.delete(receiptId)
  }
}

/**
 * Redis store (production)
 */
export class RedisStore implements ReceiptStore {
  constructor(private client: RedisClient) {}

  async get(receiptId: string): Promise<StoredReceipt | null> {
    const data = await this.client.get(`x402:receipt:${receiptId}`)
    return data ? JSON.parse(data) : null
  }

  async set(receiptId: string, receipt: StoredReceipt): Promise<void> {
    const key = `x402:receipt:${receiptId}`
    const ttl = receipt.expiresAt ? Math.floor((receipt.expiresAt - Date.now()) / 1000) : 3600

    await this.client.set(key, JSON.stringify(receipt), "EX", ttl)
  }

  async delete(receiptId: string): Promise<void> {
    await this.client.del(`x402:receipt:${receiptId}`)
  }
}

// Minimal Redis client interface
interface RedisClient {
  get(key: string): Promise<string | null>
  set(key: string, value: string, mode?: string, duration?: number): Promise<void>
  del(key: string): Promise<void>
}
