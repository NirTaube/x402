# x402-paywall

> Production-ready HTTP 402 Payment Required implementation with streaming support

**Status:** 🚧 In Development

## What is this?

A complete implementation of HTTP 402 "Payment Required" for protecting APIs, AI streaming endpoints, file downloads, and any HTTP resource. Designed for Bitcoin/Lightning but payment-method agnostic.

## Features

- ✅ **Streaming-first**: SSE, chunked responses, AI token streams
- ✅ **Cryptographically signed quotes & receipts**: Ed25519, deterministic
- ✅ **Drop-in adapters**: Next.js, Express, Fastify, Cloudflare Workers
- ✅ **Auto-retry widget**: Handles 402 → payment → retry transparently
- ✅ **Agent-friendly**: Clean contract, no cookies, stateless where possible

## Packages

- **[@x402/core](./packages/core)** - Signing, verification, hashing
- **[@x402/proxy](./packages/proxy)** - Enforcement middleware & forwarding
- **[@x402/widget](./packages/widget)** - Browser UX for payment flow
- **[@x402/cli](./packages/cli)** - Quick start & config generation
- **Adapters**:
  - [@x402/nextjs](./packages/adapters/nextjs)
  - [@x402/express](./packages/adapters/express)
  - [@x402/fastify](./packages/adapters/fastify)
  - [@x402/workers](./packages/adapters/workers)

## Quick Start

\`\`\`bash
# Install
pnpm install

# Build all packages
pnpm build

# Run example
cd examples/nextjs-ai-streaming
pnpm dev
\`\`\`

## Documentation

- [Architecture](./docs/architecture.md)
- [Threat Model](./docs/threat-model.md)
- [Deployment Guide](./docs/deployment.md)
- [FAQ](./docs/faq.md)
- [Spec](./packages/spec/README.md)

## Examples

- [Next.js AI Streaming](./examples/nextjs-ai-streaming) - Protect GPT-style streaming
- [Static Site Download](./examples/static-site-download) - Paywall for files
- [Legacy API Proxy](./examples/api-proxy-legacy) - Wrap existing APIs

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md)

## License

MIT - see [LICENSE](./LICENSE)
\`\`\`

```text file="LICENSE"
MIT License

Copyright (c) 2025 x402-paywall contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
