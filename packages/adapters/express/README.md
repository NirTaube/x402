# @x402/express

Express adapter for x402 payment protection.

## Installation

\`\`\`bash
pnpm add @x402/express
\`\`\`

## Usage

\`\`\`typescript
import express from 'express';
import { x402Middleware } from '@x402/express';

const app = express();

app.use('/api', x402Middleware({
  signingKey: process.env.X402_SIGNING_KEY!,
  policy: {
    '/generate': { price: 1000, currency: 'sat' }
  }
}));

app.post('/api/generate', (req, res) => {
  res.json({ result: 'success' });
});

app.listen(3000);
\`\`\`

## Features

- Stream-safe forwarding
- Built-in receipt verification
- Automatic quote generation

See [examples](../../../examples) for more.
