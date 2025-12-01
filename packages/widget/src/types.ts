/**
 * Widget types
 */

import type { Quote } from "@x402/core"

export interface WidgetConfig {
  onStateChange?: (state: PaymentState) => void
  onPaid?: (receiptId: string) => void
  onError?: (error: Error) => void
  theme?: ThemeConfig
  pollInterval?: number
  paymentTimeout?: number
}

export interface ThemeConfig {
  primaryColor?: string
  backgroundColor?: string
  textColor?: string
  borderRadius?: string
}

export interface PaymentState {
  status: "idle" | "pending" | "paying" | "confirming" | "paid" | "error"
  quote?: Quote
  error?: string
}

export interface X402FetchOptions extends RequestInit {
  x402Config?: WidgetConfig
}

export interface PaymentModalData {
  quote: Quote
  onClose: () => void
  onPaid: (receiptId: string) => void
}
