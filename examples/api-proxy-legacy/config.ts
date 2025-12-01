import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import type { ProxyConfig } from "@x402/proxy/config"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function loadConfig(): ProxyConfig {
  const configPath = path.join(__dirname, "proxy.config.json")
  const configData = fs.readFileSync(configPath, "utf-8")
  const config = JSON.parse(configData)

  // Replace environment variables
  const signingKey = replaceEnvVars(config.signingKey)
  const upstream = replaceEnvVars(config.upstream)

  return {
    signingKey,
    upstreamUrl: upstream,
    port: config.port || 3000,
    policy: config.policy || {},
    paymentMethods: config.paymentMethods?.map((method: any) => ({
      ...method,
      node: method.node ? replaceEnvVars(method.node) : undefined,
      address: method.address ? replaceEnvVars(method.address) : undefined,
    })),
  }
}

function replaceEnvVars(str: string): string {
  return str.replace(/\$\{([^}]+)\}/g, (_, key) => process.env[key] || "")
}
