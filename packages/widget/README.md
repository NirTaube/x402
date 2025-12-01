# @x402/widget

Browser widget for seamless x402 payment flows.

## Features

- **Auto-retry**: Transparent 402 → payment → retry
- **Multiple integration modes**: `data-x402`, `x402Fetch()`, form intercept
- **Payment modal**: QR code, address copy, deep links
- **Streaming support**: `x402FetchStream()` for SSE/chunked responses
- **Customizable**: Hooks, theming, custom payment providers

## Installation

\`\`\`bash
pnpm add @x402/widget
\`\`\`

## Usage

### Script tag (CDN)

\`\`\`html
<script src="https://unpkg.com/@x402/widget@latest" defer></script>
<link rel="stylesheet" href="https://unpkg.com/@x402/widget@latest/styles.css">

<button data-x402="/api/generate">Generate</button>
\`\`\`

### NPM

\`\`\`typescript
import { x402Fetch } from '@x402/widget';
import '@x402/widget/styles.css';

const response = await x402Fetch('/api/generate', {
  method: 'POST',
  body: JSON.stringify({ prompt: 'Hello' })
});
\`\`\`

## Configuration

See [examples](../../examples) for full integration guides.
