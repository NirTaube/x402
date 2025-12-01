/**
 * KV-based receipt storage for Workers
 */

import type { ReceiptStore, StoredReceipt } from "@x402/proxy/config"
import type { KVNamespace } from "workers-types"

export class KVReceiptStore implements ReceiptStore {
  constructor(private kv: KVNamespace) {}

  async get(receiptId: string): Promise<StoredReceipt | null> {
    const value = await this.kv.get(`receipt:${receiptId}`, "json")
    return value as StoredReceipt | null
  }

  async set(receiptId: string, receipt: StoredReceipt): Promise<void> {
    const ttl = receipt.expiresAt ? Math.floor((receipt.expiresAt - Date.now()) / 1000) : undefined
    await this.kv.put(`receipt:${receiptId}`, JSON.stringify(receipt), { expirationTtl: ttl })
  }

  async delete(receiptId: string): Promise<void> {
    await this.kv.delete(`receipt:${receiptId}`)
  }
}
