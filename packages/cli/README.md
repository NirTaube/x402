# @x402/cli

Command-line interface for x402 proxy management.

## Installation

\`\`\`bash
pnpm add -g @x402/cli
\`\`\`

## Commands

### Initialize a new proxy

\`\`\`bash
x402 init
\`\`\`

### Start the proxy

\`\`\`bash
x402 start --config ./x402.config.json
\`\`\`

### Generate signing keys

\`\`\`bash
x402 keygen
\`\`\`

## Configuration

Creates a `x402.config.json` with:
- Upstream URL
- Signing keys
- Policy rules
- Storage backend

See [deployment guide](../../docs/deployment.md) for details.
