#!/usr/bin/env node
/**
 * Build script for all packages
 * Ensures correct build order (core → proxy → adapters)
 */

import { execSync } from "child_process"

const packages = [
  "packages/core",
  "packages/proxy",
  "packages/widget",
  "packages/cli",
  "packages/adapters/nextjs",
  "packages/adapters/express",
  "packages/adapters/fastify",
  "packages/adapters/workers",
]

console.log("🔨 Building packages in order...\n")

for (const pkg of packages) {
  console.log(`📦 Building ${pkg}...`)
  try {
    execSync(`cd ${pkg} && pnpm build`, { stdio: "inherit" })
    console.log(`✅ ${pkg} built successfully\n`)
  } catch (error) {
    console.error(`❌ Failed to build ${pkg}`)
    process.exit(1)
  }
}

console.log("🎉 All packages built successfully!")
