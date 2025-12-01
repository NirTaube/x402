# @x402/core

Core cryptographic primitives for the x402 protocol.

## Features

- **Request canonicalization**: Deterministic request representation
- **Hashing**: SHA-256 with standard encoding
- **Signing**: Ed25519 signatures over canonical JSON
- **Verification**: Signature, expiry, and binding checks

## Installation

\`\`\`bash
pnpm add @x402/core
\`\`\`

## Usage

\`\`\`typescript
import { computeRequestHash, signQuote, verifyReceipt } from '@x402/core';

// Compute request hash
const requestHash = await computeRequestHash({
  method: 'POST',
  path: '/api/generate',
  query: 'model=gpt-4',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ prompt: 'Hello' })
});

// Sign a quote
const quote = await signQuote({
  requestHash,
  price: { amount: 1000, currency: 'sat' },
  expiresAt: Date.now() + 300000
}, privateKey);

// Verify a receipt
const isValid = await verifyReceipt(receipt, publicKey);
\`\`\`

## API

See [docs](../../docs/architecture.md) for full API documentation.
