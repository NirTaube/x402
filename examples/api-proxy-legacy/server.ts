import { startProxyServer } from "@x402/proxy"
import { loadConfig } from "./config.js"

const config = loadConfig()

startProxyServer({
  signingKey: config.signingKey,
  upstreamUrl: config.upstream,
  port: config.port,
  policy: config.policy,
  paymentMethods: config.paymentMethods,
})

console.log(`x402 proxy running on http://localhost:${config.port}`)
console.log(`Protecting upstream: ${config.upstream}`)
