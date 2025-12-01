/**
 * Policy engine for pricing and metering
 */

import type { RequestInput, Price } from "@x402/core"

export type PolicyRule =
  | {
      price: number
      currency: string
      methods?: string[]
    }
  | ((req: RequestInput) => Price | null)

export interface PolicyEngine {
  resolve(req: RequestInput): Price | null
}

export class DefaultPolicyEngine implements PolicyEngine {
  constructor(private rules: Record<string, PolicyRule>) {}

  resolve(req: RequestInput): Price | null {
    // Try exact path match first
    const rule = this.rules[req.path]
    if (rule) {
      return this.evaluateRule(rule, req)
    }

    // Try pattern matching
    for (const [pattern, rule] of Object.entries(this.rules)) {
      if (this.matchesPattern(req.path, pattern)) {
        return this.evaluateRule(rule, req)
      }
    }

    return null // No policy = no payment required
  }

  private evaluateRule(rule: PolicyRule, req: RequestInput): Price | null {
    if (typeof rule === "function") {
      return rule(req)
    }

    // Check method filter
    if (rule.methods && !rule.methods.includes(req.method)) {
      return null
    }

    return {
      amount: rule.price,
      currency: rule.currency,
    }
  }

  private matchesPattern(path: string, pattern: string): boolean {
    // Simple wildcard matching
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$")
    return regex.test(path)
  }
}
