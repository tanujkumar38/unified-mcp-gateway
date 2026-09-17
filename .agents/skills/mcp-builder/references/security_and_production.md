# MCP Security & Production Hardening Guide

Security in MCP systems requires defensive depth because tools execute real actions and return data into an LLM's active reasoning context.

---

## 1. The 6-Layer Defense in Depth Model

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Network Isolation (Bind 127.0.0.1, VPN, Firewall)  │
├─────────────────────────────────────────────────────────────┤
│ Layer 2: Authentication & Access Control (Bearer, OAuth 2)  │
├─────────────────────────────────────────────────────────────┤
│ Layer 3: Input Schema Validation (Strict Zod / Pydantic)    │
├─────────────────────────────────────────────────────────────┤
│ Layer 4: Output Sanitization (Strip Secrets, Mask Tokens)   │
├─────────────────────────────────────────────────────────────┤
│ Layer 5: Sandboxed Execution (Least Privilege, Timeouts)    │
├─────────────────────────────────────────────────────────────┤
│ Layer 6: Audit & Telemetry (Structured Stderr Logs, Metrics)│
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Layer-by-Layer Implementation

### Layer 1: Network Isolation
- **Stdio Servers**: Inherit OS-level process boundary. No exposed network ports.
- **Streamable HTTP Servers**:
  - Never bind to `0.0.0.0` in local or development environments. Always bind to `127.0.0.1`.
  - Enforce HTTPS (TLS 1.3) whenever exposed remotely.
  - Implement strict CORS checking: validate incoming `Origin` headers.

### Layer 2: Authentication & Authorization
- **MCP Authorization Spec**: Remote HTTP servers should validate Bearer tokens on incoming requests:
  ```typescript
  app.use((req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;
    if (!token || token !== process.env.MCP_SERVER_API_KEY) {
      return res.status(401).json({ jsonrpc: "2.0", error: { code: -32000, message: "Unauthorized" }, id: null });
    }
    next();
  });
  ```

### Layer 3: Input Schema Validation
- All tools must define strict schemas with explicit types, minimum/maximum lengths, and descriptive bounds:
  ```typescript
  const userInputSchema = z.object({
    userId: z.string().uuid().describe("Target user UUID v4"),
    action: z.enum(["suspend", "reinstate", "audit"]).describe("Administrative action to execute"),
    reason: z.string().min(5).max(500).describe("Human-readable justification")
  }).strict(); // Reject unexpected fields
  ```

### Layer 4: Output Sanitization
- **Risk**: Database queries or external API payloads may contain sensitive fields (passwords, password hashes, internal session tokens, personal identification numbers).
- **Mandatory Filter**: Never return raw database records directly to the LLM. Filter through a sanitization function:
  ```typescript
  export function sanitizeOutput<T extends Record<string, any>>(data: T): Partial<T> {
    if (typeof data !== "object" || data === null) return data;
    if (Array.isArray(data)) return data.map(sanitizeOutput) as any;

    const sensitiveKeys = new Set([
      "password", "password_hash", "hash", "secret", "token", "apiKey",
      "api_key", "privateKey", "ssn", "creditCard", "authorization"
    ]);

    const clean: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (sensitiveKeys.has(key.toLowerCase())) {
        clean[key] = "[REDACTED]";
      } else if (typeof value === "object") {
        clean[key] = sanitizeOutput(value);
      } else {
        clean[key] = value;
      }
    }
    return clean as Partial<T>;
  }
  ```

### Layer 5: Sandboxed Execution & Least Privilege
- Run containerized MCP servers under a dedicated non-root user (`node` or `appuser`).
- Enforce strict per-tool execution timeouts (e.g. 15-30 seconds max) using `AbortController`:
  ```typescript
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
  ```

### Layer 6: Audit & Telemetry
- Log tool invocation events, client session IDs, parameters (sanitized), duration, and outcome status to stderr:
  ```typescript
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    event: "tool_invocation",
    tool: "create-invoice",
    durationMs: 240,
    status: "success"
  }));
  ```

---

## 3. Production Dockerfile Blueprint

```dockerfile
# Multi-stage lightweight build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci
COPY src/ ./src
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/build ./build

# Run as non-root user
USER node
EXPOSE 3000
ENTRYPOINT ["node", "build/index.js"]
```
