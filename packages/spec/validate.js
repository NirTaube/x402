#!/usr/bin/env node
/**
 * Validates OpenAPI spec and JSON schemas
 */

import Ajv from "ajv"
import addFormats from "ajv-formats"
import SwaggerParser from "@apidevtools/swagger-parser"
import { readFileSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const ajv = new Ajv({ allErrors: true, strict: false })
addFormats(ajv)

console.log("🔍 Validating x402 specification...\n")

// Validate JSON Schemas
const schemas = ["problem", "quote", "receipt"]
let schemaErrors = 0

for (const schema of schemas) {
  const path = join(__dirname, "schemas", `${schema}.schema.json`)
  try {
    const content = JSON.parse(readFileSync(path, "utf-8"))
    ajv.compile(content)
    console.log(`✅ ${schema}.schema.json is valid`)
  } catch (error) {
    console.error(`❌ ${schema}.schema.json is invalid:`, error.message)
    schemaErrors++
  }
}

// Validate OpenAPI spec
console.log("\n🔍 Validating OpenAPI specification...")
try {
  await SwaggerParser.validate(join(__dirname, "openapi.yaml"))
  console.log("✅ openapi.yaml is valid")
} catch (error) {
  console.error("❌ openapi.yaml is invalid:", error.message)
  schemaErrors++
}

// Check canonicalization.md exists
const canonPath = join(__dirname, "canonicalization.md")
try {
  readFileSync(canonPath, "utf-8")
  console.log("✅ canonicalization.md exists")
} catch {
  console.error("❌ canonicalization.md is missing")
  schemaErrors++
}

if (schemaErrors > 0) {
  console.error(`\n❌ Validation failed with ${schemaErrors} error(s)`)
  process.exit(1)
}

console.log("\n🎉 All specifications are valid!")
