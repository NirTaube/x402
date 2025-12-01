# @x402/workers

Cloudflare Workers adapter for x402 payment protection.

## Installation

\`\`\`bash
pnpm add @x402/workers
\`\`\`

## Usage

\`\`\`typescript
import { x402Handler } from '@x402/workers';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return x402Handler({
      request,
      signingKey: env.X402_SIGNING_KEY,
      upstream: env.UPSTREAM_URL,
      policy: {
        '/api/generate': { price: 1000, currency: 'sat' }
      },
      storage: env.X402_KV // Optional KV namespace
    });
  }
};
\`\`\`

## Features

- Edge-optimized
- KV-backed receipt storage
- Zero cold start overhead

See [deployment guide](../../../docs/deployment.md) for Wrangler setup.
