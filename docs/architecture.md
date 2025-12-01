# Architecture

## Overview

x402 consists of three main components:

1. **Core** - Cryptographic primitives
2. **Proxy** - Request interception and forwarding
3. **Widget** - Browser payment flow

## Request Flow

\`\`\`
Client → Proxy → Upstream
  ↓        ↓
Widget ← 402 Quote
  ↓
Payment
  ↓
Receipt → Proxy → Verify → Forward → Upstream
                              ↓
                          Response (streaming)
\`\`\`

## Components

### Core (@x402/core)

- `canonical.ts` - Request canonicalization
- `hash.ts` - SHA-256 hashing
- `sign.ts` - Ed25519 signing
- `verify.ts` - Signature verification

### Proxy (@x402/proxy)

- `middleware.ts` - Request pipeline
- `policy.ts` - Pricing rules
- `receipts.ts` - Receipt endpoints
- `forward.ts` - Streaming proxy
- `store.ts` - Receipt storage

### Widget (@x402/widget)

- `intercept.ts` - Auto-detection (`data-x402`)
- `fetch.ts` - `x402Fetch()` wrapper
- `ui/modal.ts` - Payment modal

## Streaming

The proxy NEVER buffers response bodies. Headers are captured for logging, but the response stream is piped directly to the client.

This enables:
- AI token streaming (SSE)
- Large file downloads
- Live data feeds
- No memory bloat

## Security

See [threat-model.md](./threat-model.md) for detailed security analysis.
