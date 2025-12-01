import { startProxyServer } from "@x402/proxy"
import { MemoryReceiptStore } from "@x402/proxy/store"
import express from "express"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Start upstream server (serves files)
const upstream = express()
upstream.use(express.static(path.join(__dirname, "files")))
upstream.listen(3001, () => {
  console.log("Upstream file server running on http://localhost:3001")
})

// Start x402 proxy
startProxyServer({
  signingKey: process.env.X402_SIGNING_KEY || "test-key-change-in-production",
  upstreamUrl: "http://localhost:3001",
  port: 3000,
  policy: {
    "/api/download/*": {
      amount: 1000,
      currency: "sats",
    },
  },
  store: new MemoryReceiptStore(),
  paymentMethods: [
    {
      type: "lightning",
      node: process.env.LIGHTNING_NODE,
    },
  ],
})

console.log("x402 proxy running on http://localhost:3000")
console.log("Open http://localhost:3000 to test protected downloads")
