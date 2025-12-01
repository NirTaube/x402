# Contributing to x402-paywall

Thank you for your interest in contributing!

## Prerequisites

- Node 20+
- pnpm 9+

## Setup

\`\`\`bash
git clone https://github.com/yourorg/x402-paywall.git
cd x402-paywall
pnpm install
\`\`\`

## Development Workflow

\`\`\`bash
# Build all packages
pnpm build

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Lint
pnpm lint

# Type check
pnpm typecheck
\`\`\`

## Project Structure

\`\`\`
x402-paywall/
├── packages/
│   ├── core/          # Core library (hashing, signing, verification)
│   ├── proxy/         # HTTP proxy server
│   ├── widget/        # Browser widget
│   ├── cli/           # CLI tool
│   ├── spec/          # Protocol specification
│   └── adapters/      # Framework adapters
├── examples/          # Example implementations
├── docs/              # Documentation
└── scripts/           # Build and release scripts
\`\`\`

## Making Changes

1. Create a feature branch
2. Make your changes
3. Add tests
4. Ensure `pnpm test` and `pnpm lint` pass
5. Submit a PR

## Testing

Each package has its own test suite. Run all tests:

\`\`\`bash
pnpm test
\`\`\`

Or test a specific package:

\`\`\`bash
pnpm --filter @x402/core test
\`\`\`

## Documentation

Update relevant docs in `docs/` when adding features.

## Release Process

Releases are automated via GitHub Actions when a tag is pushed.

## Questions?

Open an issue or join our Discord.
