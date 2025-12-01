# @x402/spec

Protocol specification for HTTP 402 "Payment Required" implementation.

## Contents

- [OpenAPI Specification](./openapi.yaml) - API contract
- [Canonicalization Rules](./canonicalization.md) - Request hashing
- [JSON Schemas](./schemas/) - Quote, Receipt, Problem formats

## Overview

The x402 protocol defines:

1. **402 Response**: Server returns signed quote with pricing
2. **Receipt Submission**: Client submits payment proof
3. **Request Retry**: Original request retried with receipt header

## Contract

All implementations MUST:
- Generate deterministic `requestHash` per canonicalization rules
- Sign quotes and receipts with Ed25519
- Verify receipt binding to original request
- Support streaming responses without buffering

## Validation

Run spec validation:

\`\`\`bash
pnpm validate
\`\`\`

## Versioning

Current version: **v0.1.0** (draft)

Changes require protocol version bump and migration guide.
