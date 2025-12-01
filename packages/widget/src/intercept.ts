/**
 * Auto-intercept for data-x402 elements
 */

import { x402Fetch } from "./fetch.js"
import type { WidgetConfig } from "./types.js"

let initialized = false

/**
 * Initialize auto-intercept for data-x402 attributes
 */
export function initX402(config?: WidgetConfig) {
  if (initialized) return
  initialized = true

  // Intercept clicks on [data-x402] elements
  document.addEventListener("click", async (event) => {
    const target = event.target as HTMLElement
    const element = target.closest("[data-x402]") as HTMLElement

    if (!element) return

    event.preventDefault()

    const url = element.getAttribute("data-x402") || element.getAttribute("href")
    if (!url) return

    try {
      const response = await x402Fetch(url, { x402Config: config })

      // Handle different response types
      if (response.headers.get("content-type")?.includes("application/json")) {
        const data = await response.json()
        config?.onPaid?.(data)
      } else if (response.headers.get("content-disposition")?.includes("attachment")) {
        // Download file
        const blob = await response.blob()
        downloadBlob(blob, getFilename(response))
      } else {
        // Navigate or replace content
        const html = await response.text()
        document.body.innerHTML = html
      }
    } catch (error) {
      config?.onError?.(error as Error)
    }
  })

  // Intercept form submissions with data-x402
  document.addEventListener("submit", async (event) => {
    const form = event.target as HTMLFormElement
    if (!form.hasAttribute("data-x402")) return

    event.preventDefault()

    const formData = new FormData(form)
    const url = form.action || window.location.href

    try {
      const response = await x402Fetch(url, {
        method: form.method || "POST",
        body: formData,
        x402Config: config,
      })

      const data = await response.json()
      config?.onPaid?.(data)
    } catch (error) {
      config?.onError?.(error as Error)
    }
  })
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function getFilename(response: Response): string {
  const disposition = response.headers.get("content-disposition")
  if (disposition) {
    const match = disposition.match(/filename="?([^"]+)"?/)
    if (match) return match[1]
  }
  return "download"
}
