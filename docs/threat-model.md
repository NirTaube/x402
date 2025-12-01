# Threat Model

## Assets

1. **Signing keys** - Compromise allows forging quotes/receipts
2. **Receipt store** - Tampering allows unauthorized access
3. **Request hashes** - Collision allows quote reuse

## Threats

### 1. Quote Forgery
**Attack**: Attacker generates fake quotes with low prices

**Mitigation**: 
- Ed25519 signatures required
- Public key verification
- Key rotation support

### 2. Receipt Replay
**Attack**: Reuse valid receipt for multiple requests

**Mitigation**:
- Receipt bound to `requestHash`
- Idempotency keys
- One-time use enforcement

### 3. Quote Expiry Bypass
**Attack**: Use expired quote to lock in old prices

**Mitigation**:
- `expiresAt` timestamp in quote
- Server-side expiry checking
- Clock skew tolerance (±5 min)

### 4. Request Hash Collision
**Attack**: Craft request with same hash as expensive request

**Mitigation**:
- SHA-256 (collision-resistant)
- Include method, path, query, headers, body
- Canonical JSON for bodies

### 5. Receipt Theft
**Attack**: Intercept receipt and use for own request

**Mitigation**:
- Receipt bound to specific `requestHash`
- HTTPS required (TLS)
- Optional client signatures

### 6. Quote Reuse Across Requests
**Attack**: Pay once, use quote for different requests

**Mitigation**:
- `requestHash` in quote
- Hash includes full request context
- Quote → Receipt → Request binding chain

### 7. Timing Attacks
**Attack**: Determine if receipt exists via timing

**Mitigation**:
- Constant-time comparisons where possible
- Rate limiting on receipt submission

### 8. Storage Poisoning
**Attack**: Flood receipt store with fake receipts

**Mitigation**:
- Validate before storing
- TTL-based expiry
- Storage quotas

## Assumptions

1. **TLS**: All communication over HTTPS
2. **Key Security**: Signing keys stored securely (env vars, secrets manager)
3. **Time Sync**: Servers have reasonably synchronized clocks
4. **Payment Verification**: External payment proof verification is trusted

## Out of Scope

- DDoS protection (use Cloudflare, etc.)
- Payment gateway security (assumes trusted providers)
- Client-side key security (widget runs in browser)

## Incident Response

If signing key is compromised:
1. Rotate key immediately
2. Revoke old key
3. Invalidate all outstanding quotes
4. Notify users of new public key
