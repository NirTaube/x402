#!/usr/bin/env node
/**
 * Clean script - removes all build artifacts
 */

import { execSync } from "child_process"
import { rmSync } from "fs"

console.log("🧹 Cleaning build artifacts...\n")

try {
  // Clean all package dist folders
  execSync("pnpm -r clean", { stdio: "inherit" })

  // Remove root node_modules
  console.log("Removing root node_modules...")
  rmSync("node_modules", { recursive: true, force: true })

  console.log("\n✨ Clean complete!")
} catch (error) {
  console.error("❌ Clean failed:", error)
  process.exit(1)
}
