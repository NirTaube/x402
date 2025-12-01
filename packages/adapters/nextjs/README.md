# @x402/nextjs

Next.js adapter for x402 payment protection.

## Installation

\`\`\`bash
pnpm add @x402/nextjs
\`\`\`

## Usage

### Middleware

\`\`\`typescript
// middleware.ts
import { withX402 } from '@x402/nextjs';

export default withX402({
  signingKey: process.env.X402_SIGNING_KEY!,
  policy: {
    '/api/generate': { price: 1000, currency: 'sat' }
  }
});

export const config = {
  matcher: '/api/:path*'
};
\`\`\`

### Route Handler

\`\`\`typescript
// app/api/generate/route.ts
import { x402Route } from '@x402/nextjs';

export const POST = x402Route(
  async (req) => {
    // Your protected logic
    return Response.json({ result: 'success' });
  },
  { price: 1000, currency: 'sat' }
);
\`\`\`

See [example](../../../examples/nextjs-ai-streaming) for full implementation.
