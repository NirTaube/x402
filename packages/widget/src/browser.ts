/**
 * Browser entry point - auto-initializes on load
 */

import { initX402 } from "./intercept.js"
import { x402Fetch, x402FetchStream } from "./fetch.js"

// Auto-initialize on DOM ready
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initX402())
  } else {
    initX402()
  }
}

// Export for manual usage
export { x402Fetch, x402FetchStream, initX402 }

// Add to window for CDN usage
if (typeof window !== "undefined") {
  ;(window as any).x402 = {
    fetch: x402Fetch,
    fetchStream: x402FetchStream,
    init: initX402,
  }
}
