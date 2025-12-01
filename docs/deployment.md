# Deployment Guide

## Environment Variables

### Required

\`\`\`bash
X402_SIGNING_KEY=<ed25519_private_key_hex>
X402_UPSTREAM_URL=http://localhost:3001
\`\`\`

### Optional

\`\`\`bash
X402_PORT=3000
X402_REDIS_URL=redis://localhost:6379
X402_LOG_LEVEL=info
X402_ENABLE_METRICS=true
X402_BITCOIN_ADDRESS=bc1q...
X402_LIGHTNING_NODE=<pubkey>
\`\`\`

## Generate Keys

\`\`\`bash
x402 keygen
\`\`\`

Outputs:
- Private key (keep secret)
- Public key (share with clients)

## Deployment Targets

### Node.js

\`\`\`bash
# Build
pnpm build

# Start
X402_SIGNING_KEY=... x402 start
\`\`\`

### Docker

\`\`\`dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
CMD ["x402", "start"]
\`\`\`

### Cloudflare Workers

\`\`\`bash
cd packages/adapters/workers
pnpm deploy
\`\`\`

### Vercel Edge

\`\`\`bash
# Uses @x402/nextjs adapter
vercel deploy
\`\`\`

## Storage

### Memory (default)
- Fast, ephemeral
- Good for: dev, single-instance

### Redis
- Distributed, persistent
- Good for: multi-instance production

\`\`\`typescript
import { createProxy } from '@x402/proxy';
import { RedisStore } from '@x402/proxy/stores/redis';

const proxy = createProxy({
  store: new RedisStore(process.env.REDIS_URL)
});
\`\`\`

## Monitoring

### Metrics

- `x402_quotes_generated_total`
- `x402_receipts_verified_total`
- `x402_receipts_rejected_total`
- `x402_request_duration_seconds`

### Logs

JSON structured logs with:
- `requestHash`
- `quoteId`
- `receiptId`
- `status`

## Security Checklist

- [ ] Signing key in secrets manager (not env file)
- [ ] TLS/HTTPS enabled
- [ ] Rate limiting on quote generation
- [ ] Receipt storage with TTL
- [ ] Key rotation plan
- [ ] Monitoring alerts for anomalies
