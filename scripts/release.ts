#!/usr/bin/env node
/**
 * Release script - publishes packages to npm
 * Usage: pnpm release [major|minor|patch]
 */

import { execSync } from "child_process"

const versionType = process.argv[2] || "patch"

if (!["major", "minor", "patch"].includes(versionType)) {
  console.error("Usage: pnpm release [major|minor|patch]")
  process.exit(1)
}

console.log(`📦 Releasing ${versionType} version...\n`)

try {
  // Ensure clean working tree
  execSync("git diff-index --quiet HEAD --", { stdio: "inherit" })

  // Run tests
  console.log("🧪 Running tests...")
  execSync("pnpm test", { stdio: "inherit" })

  // Build
  console.log("🔨 Building packages...")
  execSync("pnpm build", { stdio: "inherit" })

  // Version bump
  console.log(`⬆️  Bumping ${versionType} version...`)
  execSync(`pnpm -r exec -- npm version ${versionType}`, { stdio: "inherit" })

  // Publish
  console.log("🚀 Publishing to npm...")
  execSync("pnpm -r publish --access public", { stdio: "inherit" })

  // Git tag
  const version = execSync("node -p \"require('./packages/core/package.json').version\"").toString().trim()
  execSync(`git tag v${version}`, { stdio: "inherit" })
  execSync("git push --follow-tags", { stdio: "inherit" })

  console.log(`\n🎉 Released v${version} successfully!`)
} catch (error) {
  console.error("❌ Release failed:", error)
  process.exit(1)
}
