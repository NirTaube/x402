# Legacy API Proxy Example

Wrap an existing API with x402 protection (no code changes to upstream).

## Setup

\`\`\`bash
cd examples/api-proxy-legacy
\`\`\`

## Configuration

Edit `proxy.config.json`:

\`\`\`json
{
  "upstream": "https://api.example.com",
  "signingKey": "your_key_here",
  "policy": {
    "/v1/completions": { "price": 1000, "currency": "sat" }
  }
}
\`\`\`

## Run

\`\`\`bash
x402 start --config proxy.config.json
\`\`\`

Now all requests to `http://localhost:3000/v1/completions` require payment.

## Use Cases

- Add metering to free APIs
- Monetize internal tools
- Rate limit expensive endpoints
- No upstream changes needed
