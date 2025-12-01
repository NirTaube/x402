# Static Site Download Example

Protect file downloads with x402 (no build step required).

## Setup

\`\`\`bash
cd examples/static-site-download
\`\`\`

## Run

\`\`\`bash
# Start proxy (from repo root)
pnpm --filter @x402/proxy start

# Serve static files
python -m http.server 8000
\`\`\`

Visit `http://localhost:8000`

## How it works

1. Click "Download Premium Content"
2. Proxy returns 402 with quote
3. Widget shows payment modal
4. After payment, download starts automatically

No JavaScript frameworks needed - pure HTML + widget script.
