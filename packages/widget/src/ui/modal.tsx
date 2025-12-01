/**
 * Payment modal UI
 */

import type { PaymentModalData } from "../types.js"
import { submitReceipt } from "../fetch.js"

let currentModal: HTMLElement | null = null

/**
 * Show payment modal
 */
export function showPaymentModal(data: PaymentModalData) {
  // Remove existing modal
  if (currentModal) {
    currentModal.remove()
  }

  const { quote, onClose, onPaid } = data

  // Create modal
  const modal = document.createElement("div")
  modal.className = "x402-modal"
  modal.innerHTML = `
    <div class="x402-modal-overlay"></div>
    <div class="x402-modal-content">
      <div class="x402-modal-header">
        <h2>Payment Required</h2>
        <button class="x402-close" aria-label="Close">&times;</button>
      </div>
      
      <div class="x402-modal-body">
        <div class="x402-price">
          <span class="x402-amount">${quote.price.amount}</span>
          <span class="x402-currency">${quote.price.currency}</span>
        </div>
        
        <div class="x402-payment-methods">
          ${renderPaymentMethods(quote)}
        </div>
        
        <div class="x402-status">
          <div class="x402-spinner"></div>
          <p>Waiting for payment confirmation...</p>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(modal)
  currentModal = modal

  // Event listeners
  const closeBtn = modal.querySelector(".x402-close") as HTMLElement
  const overlay = modal.querySelector(".x402-modal-overlay") as HTMLElement

  closeBtn?.addEventListener("click", () => {
    closeModal()
    onClose()
  })

  overlay?.addEventListener("click", () => {
    closeModal()
    onClose()
  })

  // Handle payment methods
  setupPaymentHandlers(modal, quote, onPaid)
}

function renderPaymentMethods(quote: any): string {
  if (!quote.paymentMethods || quote.paymentMethods.length === 0) {
    return '<p class="x402-error">No payment methods available</p>'
  }

  return quote.paymentMethods
    .map((method: any) => {
      if (method.type === "lightning" && method.invoice) {
        return `
        <div class="x402-method x402-lightning">
          <h3>Lightning Network</h3>
          <div class="x402-qr" data-invoice="${method.invoice}">
            <canvas id="x402-qr-canvas"></canvas>
          </div>
          <div class="x402-invoice">
            <code>${method.invoice}</code>
            <button class="x402-copy" data-copy="${method.invoice}">Copy</button>
          </div>
          <a href="lightning:${method.invoice}" class="x402-btn-primary">
            Open Wallet
          </a>
        </div>
      `
      }

      if (method.type === "onchain" && method.address) {
        return `
        <div class="x402-method x402-onchain">
          <h3>Bitcoin On-chain</h3>
          <div class="x402-address">
            <code>${method.address}</code>
            <button class="x402-copy" data-copy="${method.address}">Copy</button>
          </div>
          <p class="x402-note">Send exactly ${quote.price.amount} sats to this address</p>
        </div>
      `
      }

      return ""
    })
    .join("")
}

function setupPaymentHandlers(modal: HTMLElement, quote: any, onPaid: (receiptId: string) => void) {
  // Copy buttons
  modal.querySelectorAll(".x402-copy").forEach((btn) => {
    btn.addEventListener("click", () => {
      const text = btn.getAttribute("data-copy")
      if (text) {
        navigator.clipboard.writeText(text)
        btn.textContent = "Copied!"
        setTimeout(() => {
          btn.textContent = "Copy"
        }, 2000)
      }
    })
  })

  // Generate QR code
  const qrCanvas = modal.querySelector("#x402-qr-canvas") as HTMLCanvasElement
  if (qrCanvas) {
    const invoice = modal.querySelector("[data-invoice]")?.getAttribute("data-invoice")
    if (invoice) {
      generateQRCode(qrCanvas, invoice)
    }
  }

  // Poll for payment (MVP: manual confirmation)
  // Production: WebSocket or polling backend
  startPaymentPolling(quote, onPaid)
}

function generateQRCode(canvas: HTMLCanvasElement, data: string) {
  // Simple QR code placeholder
  // Production: Use qrcode library
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  canvas.width = 200
  canvas.height = 200

  ctx.fillStyle = "#000"
  ctx.fillRect(0, 0, 200, 200)

  ctx.fillStyle = "#fff"
  ctx.font = "12px monospace"
  ctx.fillText("QR: " + data.slice(0, 20) + "...", 10, 100)
}

async function startPaymentPolling(quote: any, onPaid: (receiptId: string) => void) {
  // MVP: Mock payment after 3 seconds
  // Production: Poll backend or use webhooks
  setTimeout(async () => {
    try {
      const receiptId = await submitReceipt(quote, {
        mock: true,
        timestamp: Date.now(),
      })

      closeModal()
      onPaid(receiptId)
    } catch (error) {
      console.error("Payment error:", error)
    }
  }, 3000)
}

function closeModal() {
  if (currentModal) {
    currentModal.remove()
    currentModal = null
  }
}
