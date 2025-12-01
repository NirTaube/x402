# @x402/fastify

Fastify adapter for x402 payment protection.

## Installation

\`\`\`bash
pnpm add @x402/fastify
\`\`\`

## Usage

\`\`\`typescript
import Fastify from 'fastify';
import { x402Plugin } from '@x402/fastify';

const fastify = Fastify();

await fastify.register(x402Plugin, {
  signingKey: process.env.X402_SIGNING_KEY!,
  policy: {
    '/api/generate': { price: 1000, currency: 'sat' }
  }
});

fastify.post('/api/generate', async (request, reply) => {
  return { result: 'success' };
});

await fastify.listen({ port: 3000 });
\`\`\`

## Features

- Native Fastify hooks
- Stream-optimized
- TypeScript support

See [examples](../../../examples) for more.
