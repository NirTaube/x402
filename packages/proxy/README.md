# @x402/proxy

HTTP 402 enforcement proxy with streaming support.

## Features

- **Quote generation**: Signed 402 responses with pricing
- **Receipt verification**: Cryptographic proof validation
- **Streaming forwarding**: SSE, chunked, AI token streams
- **Flexible storage**: Memory, Redis, custom adapters
- **Policy engine**: Route-based pricing and metering

## Installation

\`\`\`bash
pnpm add @x402/proxy
\`\`\`

## Usage

\`\`\`typescript
import { createProxy } from '@x402/proxy';

const proxy = createProxy({
  signingKey: process.env.X402_SIGNING_KEY,
  upstreamUrl: 'http://localhost:3001',
  policy: {
    '/api/generate': { price: 1000, currency: 'sat' }
  }
});

// Start server
proxy.listen(3000);
\`\`\`

## Configuration

See [deployment guide](../../docs/deployment.md) for full configuration options.
