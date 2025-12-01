# Request Canonicalization

Defines how requests are hashed to create deterministic `requestHash` values.

## Purpose

The `requestHash` binds payment quotes and receipts to specific requests, preventing:
- Quote reuse across different requests
- Receipt theft and replay attacks

## Algorithm

### 1. Method Normalization
- Uppercase: `POST`, `GET`, `DELETE`

### 2. Path Normalization
- Lowercase
- Remove trailing slash (except root `/`)
- URL decode

### 3. Query Normalization
- Sort parameters alphabetically by key
- URL decode keys and values
- Join with `&`

### 4. Header Selection
- Include: `content-type`, `content-length`
- Lowercase header names
- Trim values

### 5. Body Hashing
- If `content-type: application/json`: canonicalize JSON (sorted keys, no whitespace)
- Otherwise: use raw bytes
- Empty body = empty string

### 6. Canonical Representation

\`\`\`
{method}\n{path}?{query}\n{headers}\n{body}
\`\`\`

### 7. Hash Computation

\`\`\`
requestHash = "sha256:" + base64url(sha256(canonical))
\`\`\`

## Example

Request:
\`\`\`http
POST /api/generate?model=gpt-4 HTTP/1.1
Content-Type: application/json

{"prompt":"Hello"}
\`\`\`

Canonical:
\`\`\`
POST
/api/generate?model=gpt-4
content-type:application/json
{"prompt":"Hello"}
\`\`\`

Hash:
\`\`\`
sha256:Xy9K3L...
\`\`\`

## Streaming Note

For streaming responses, the hash is computed over the **request only**. The response body is NOT included in `requestHash`.
