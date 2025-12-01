# Next.js AI Streaming Example

Demonstrates protecting OpenAI-style streaming endpoints with x402.

## Setup

\`\`\`bash
cd examples/nextjs-ai-streaming
pnpm install
\`\`\`

## Configuration

\`\`\`bash
cp .env.example .env.local
# Edit .env.local with your keys
\`\`\`

## Run

\`\`\`bash
pnpm dev
\`\`\`

Visit `http://localhost:3000`

## Architecture

- `/app/api/chat/route.ts` - Protected streaming endpoint
- `/app/page.tsx` - Chat UI with x402 widget
- `middleware.ts` - x402 enforcement

Payment required on first message. Widget handles payment flow transparently.
