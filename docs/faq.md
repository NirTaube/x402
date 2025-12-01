# FAQ

## General

### Why HTTP 402?

402 "Payment Required" was reserved in 1999 for digital payments but never standardized. We're using it for its intended purpose: requesting payment before fulfilling HTTP requests.

### Do I need the widget?

No. The widget is for browser UX convenience. Agents, CLIs, and backends can implement the protocol directly:

1. Make request
2. Get 402 with quote
3. Pay invoice
4. Submit receipt
5. Retry request with receipt header

### Can I use this without Bitcoin?

Yes. The protocol is payment-method agnostic. You can plug in:
- Credit cards (Stripe, etc.)
- Stablecoins (USDC, etc.)
- Account credits
- Any payment system

### Does this work with streaming?

Yes. The proxy never buffers responses. SSE, chunked encoding, and AI token streams work transparently.

## Technical

### How do you prevent replay attacks?

Receipts are bound to:
1. `quoteId` (unique per quote)
2. `requestHash` (unique per request)
3. `idempotencyKey` (optional client nonce)

A receipt for one request can't be used for another.

### What if the quote expires during payment?

The client must request a new quote. Typical expiry: 5 minutes.

### Can I set different prices per user?

Yes. The policy engine supports:
- Route-based pricing
- Header-based user identification
- Custom pricing functions

\`\`\`typescript
policy: {
  '/api/generate': (req) => {
    const user = req.headers['x-user-tier'];
    return user === 'premium' ? 500 : 1000;
  }
}
\`\`\`

### How do I handle refunds?

The proxy doesn't manage payment state. Refunds are handled by your payment provider:

- Lightning: Hold invoices (HTLC timeout)
- Onchain: Escrow or manual refund
- Stripe: Standard refund API

### What's the performance overhead?

Minimal:
- Quote generation: <1ms (signing only)
- Receipt verification: <2ms (crypto + lookup)
- Forwarding: Zero-copy streaming

Benchmark: 10k req/s on a single instance (Node 20, 4 cores).

## Protocol

### Is this a standard?

Not yet. This is an experimental implementation. If it gains traction, we'll pursue standardization through IETF or similar.

### Can I mix free and paid endpoints?

Yes. Apply x402 middleware only to routes that need payment:

\`\`\`typescript
app.use('/api/paid', x402Middleware({ ... }));
app.use('/api/free', freeHandler);
\`\`\`

### How do agents discover pricing?

Two options:
1. Try the request, get 402 with quote
2. `OPTIONS` request returns pricing (planned feature)

### Can I use this for rate limiting?

Yes. Set low prices and treat it as "pay-per-request" metering. Price can be symbolic (1 sat).

## Ecosystem

### Does this work with OpenAI API?

Yes. Wrap the OpenAI endpoint with x402 proxy:

\`\`\`bash
X402_UPSTREAM_URL=https://api.openai.com x402 start
\`\`\`

Now clients must pay before hitting OpenAI.

### Can I resell API access?

Yes. Common pattern:
1. Buy upstream API access (OpenAI, etc.)
2. Wrap with x402
3. Set your own pricing
4. Collect payments

### Is there a hosted version?

Not yet. Self-hosted only for now. Interested in a managed service? Join the waitlist.
