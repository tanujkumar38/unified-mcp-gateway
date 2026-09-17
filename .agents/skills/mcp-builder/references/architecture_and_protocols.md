# MCP Architecture & Protocol Specification Reference

This guide provides deep technical reference details for the Model Context Protocol (MCP) as standardized by Anthropic and the Agentic AI Foundation.

---

## 1. The MCP Protocol Model

Model Context Protocol (MCP) connects LLM clients (such as Claude Desktop, VS Code, Cursor, Antigravity, or custom agent hosts) with local or remote services over a standardized JSON-RPC 2.0 communication layer.

```
┌─────────────────┐       JSON-RPC 2.0        ┌─────────────────┐
│   Host / LLM   │◄─────────────────────────►│   MCP Server    │
│ (Claude, IDEs) │  Tools / Resources / Prompts │   (Your Code)   │
└─────────────────┘                           └────────┬────────┘
                                                       │
                                            ┌──────────▼──────────┐
                                            │ Target Service / DB │
                                            │ APIs / Web / System │
                                            └─────────────────────┘
```

---

## 2. Core Primitives

An MCP server exposes three fundamental primitives:

### A. Tools (Executable Functions)
- **Model Role**: Callable by LLMs to cause actions, query live APIs, or perform computations.
- **Definition**: Requires a unique `name`, a human-readable `description`, an input `schema` (JSON Schema or Zod), and an optional set of untrusted client hints (`annotations`).
- **Response Format**:
  ```json
  {
    "content": [
      { "type": "text", "text": "Result content..." }
    ],
    "isError": false
  }
  ```
- **Error Reporting**: If execution fails, return `{ content: [{ type: "text", text: "Error message" }], isError: true }`. Do not crash the server process.

#### Tool Annotations (Client Hints)
Clients treat annotations as *untrusted hints* to prioritize tools or present warnings to human users:

| Annotation | Type | Purpose | Trust Model |
| :--- | :--- | :--- | :--- |
| `title` | `string` | Display name for UI rendering | Untrusted Hint |
| `readOnlyHint` | `boolean` | Indicates tool does NOT mutate external state | Untrusted Hint |
| `destructiveHint`| `boolean` | Irreversible or significant side-effects (e.g. DELETE, DROP) | Untrusted Hint |
| `idempotentHint` | `boolean` | Safe to execute multiple times with same arguments | Untrusted Hint |
| `openWorldHint` | `boolean` | Interacts with live external systems with changing states | Untrusted Hint |

> [!CAUTION]
> Servers MUST NOT rely on client obedience to annotations for security. Enforce access control and authorization internally on the server side.

### B. Resources (Data Access)
- **Model Role**: Passive contextual data that the client/LLM can read (like database records, files, configs).
- **Types**:
  - **Direct Resources**: Fixed URI (e.g. `system://info`, `config://app`).
  - **Resource Templates**: Dynamic parameterized URI (e.g. `users://{userId}/profile`).
- **Response Format**: Text or binary content with a MIME type:
  ```json
  {
    "contents": [
      {
        "uri": "users://123/profile",
        "mimeType": "application/json",
        "text": "{\"id\":123,\"name\":\"Alice\"}"
      }
    ]
  }
  ```

### C. Prompts (Workflow Blueprints)
- **Model Role**: Pre-packaged conversation templates or guided multi-step workflows.
- **Structure**: Name, arguments list, and generated messages array (`user` or `assistant`).

---

## 3. Transports: Stdio vs. Streamable HTTP

MCP currently supports two official transport mechanisms:

| Architectural Dimension | Stdio (`StdioServerTransport`) | Streamable HTTP (`StreamableHttpTransport` / SSE) |
| :--- | :--- | :--- |
| **Connection Topology** | 1:1 local subprocess | 1:Many local or remote clients |
| **Communication Channel**| `stdin` / `stdout` (Newline-delimited JSON) | HTTP POST with Server-Sent Events (SSE) |
| **Logging Stream** | **`stderr` exclusively** (never `stdout`) | `stderr` or dedicated file/rotating logger |
| **Lifecycle Ownership** | Client spawns and kills process | Independent background service/container |
| **Authentication** | OS process context & environment variables | HTTP Bearer tokens, OAuth 2.0, mTLS |
| **Session Tracking** | Implicit in pipe | Explicit `Mcp-Session-Id` header |
| **Network Security** | No open network ports | HTTPS mandatory, CORS, Origin validation |
| **Recommended Use** | Local development, CLI tools, desktop IDEs | Cloud microservices, shared team infra |

---

## 4. Lifecycle & Handshake Flow

The MCP protocol enforces strict lifecycle ordering:

```
Client                                                  Server
  │                                                       │
  │─── 1. request: 'initialize' ─────────────────────────►│
  │    (protocolVersion, capabilities, clientInfo)        │
  │                                                       │
  │◄── 2. response: 'initialize' ─────────────────────────│
  │    (protocolVersion, capabilities, serverInfo)        │
  │                                                       │
  │─── 3. notification: 'notifications/initialized' ─────►│
  │                                                       │
  │════════════ READY FOR WORKFLOW REQUESTS ══════════════│
  │                                                       │
  │─── 4. request: 'tools/list' ─────────────────────────►│
  │◄── 5. response: 'tools/list' ─────────────────────────│
  │                                                       │
  │─── 6. request: 'tools/call' ─────────────────────────►│
  │◄── 7. response: 'tools/call' ─────────────────────────│
  │                                                       │
  │─── 8. request: 'ping' ───────────────────────────────►│
  │◄── 9. response: 'ping' ───────────────────────────────│
```

### Critical Protocol Rules:
1. **Forbidden Requests Before Initialization**: All client requests EXCEPT `ping` and `logging` notifications are strictly FORBIDDEN before the `notifications/initialized` notification is acknowledged.
2. **Version Negotiation**: The client sends its supported `protocolVersion`. The server responds with the compatible negotiated version (e.g. `2024-11-05`).
3. **Graceful Shutdown**: For stdio, EOF on `stdin` must trigger clean server process termination. For HTTP, sessions expire after inactivity or explicit closure.

---

## 5. Cross-Platform Protocol Deviations & Optimizations

Different AI hosts interact with MCP differently. Servers should account for these behaviors:

1. **ChatGPT Protocol Differences**:
   - **Remote HTTPS Only**: Never attempt to run local `stdio` subprocesses directly with ChatGPT; route through an authenticated HTTPS SSE gateway or tunnel.
   - **Tool Approval Enforcement**: Always provide `readOnlyHint: true` for idempotent and read operations. Without this annotation, ChatGPT prompts the user for manual confirmation before every tool invocation.
   - **Connector Standards**: Provide standardized `search` and `fetch` tools if the server acts as an information retrieval service.
2. **Claude Deferred Loading (`defer_loading: true`)**:
   - For servers with >50 tools, Claude supports deferred tool loading where the client indexes tools instead of injecting all schemas upfront.
3. **Multi-Server Namespacing**:
   - When running behind an aggregator or gateway (e.g. `aiMCPGate`), tool names should use distinct prefixes (e.g., `service__tool_name`) to avoid identifier collisions across servers.

