# MCP Development & Production Checklists

Use these verified checklists during every phase of MCP server authoring to guarantee reliability, security, and protocol conformance.

---

## 1. Pre-Development Checklist

- [ ] **Single Responsibility Defined**: Server handles exactly one external system or clear functional domain.
- [ ] **Capabilities Outlined**: List of Tools, Resources, and Prompts to be exposed is documented.
- [ ] **Platform Target Evaluated**:
  - [ ] Claude / IDEs (Full MCP spec, `stdio` transport)
  - [ ] ChatGPT (Remote HTTPS SSE only, Tools-only, requires `readOnlyHint`, optional `search`/`fetch`)
  - [ ] Universal Compatible (Dual transport `stdio` + HTTPS, resource-to-tool wrappers)
  - [ ] Multi-Server Gateway (`aiMCPGate` or `uni-mcp-gateway` meta-tool pattern for context preservation)
- [ ] **Integration Archetype Decided**:
  - [ ] Official API (Key/OAuth available)
  - [ ] Web Scraping (Public read-only content)
  - [ ] Browser Automation (Complex SPAs, clicks/forms needed)
  - [ ] Private-API (Reverse-engineered enterprise portal)
- [ ] **Transport Chosen**:
  - [ ] `stdio` for local AI agents (Claude Desktop, Cursor, Antigravity)
  - [ ] `Streamable HTTP` for remote cloud services, ChatGPT, or multi-client gateways
- [ ] **Language & SDK Selected**: TypeScript (`@modelcontextprotocol/sdk`) or Python (`mcp`).
- [ ] **Environment Setup**: LTS Node.js (v18/v20) or Python 3.10+ installed.

---

## 2. Development Checklist

### Server Core & Transport
- [ ] **Instance Initialized**: `McpServer` configured with semantic name and version (`1.0.0`).
- [ ] **Logging Strictness**: **ZERO** calls to `console.log()` or `process.stdout.write()`. All diagnostic logs sent to `stderr` (`console.error`).
- [ ] **Lifecycle Complete**: Server properly connects to transport via `await server.connect(transport)`.
- [ ] **Top-Level Error Trapping**: Unhandled rejections caught with `process.exit(1)` and diagnostic stderr logs.

### Capability & Schema Design
- [ ] **Explicit Schemas**: Every tool parameter has an explicit Zod/Pydantic type with `.describe(...)`.
- [ ] **Client Annotations Added**: `readOnlyHint`, `destructiveHint`, `idempotentHint`, and `openWorldHint` set appropriately (`readOnlyHint: true` is critical to prevent ChatGPT prompt-approval dialogs).
- [ ] **ChatGPT Compatibility**: If targeting ChatGPT, resources & prompts are exposed as callable fallback tools (`get_resource_...`, `run_prompt_...`), and `search`/`fetch` are exposed if indexing documents.
- [ ] **Context Window Check**: If tool count > 50, deferred loading (`defer_loading: true`) or meta-tool gateway architecture is adopted.
- [ ] **Error Shielding**: Tool bodies wrapped in `try...catch`, returning `{ content: [...], isError: true }` upon error instead of throwing uncaught exceptions.
- [ ] **Progress Notifications**: Long-running operations (>5 seconds) emit progress tokens.

---

## 3. Security Checklist

- [ ] **No Hardcoded Secrets**: All API keys, passwords, and tokens loaded from environment variables.
- [ ] **Input Validation**: Strict input boundary validation (lengths, regex, UUID formats).
- [ ] **Output Sanitization**: Data scrubbed of sensitive fields (password hashes, private tokens, SSNs) before returning to LLM.
- [ ] **Least Privilege**: Server requests only minimal system and API scopes.
- [ ] **Network Security (HTTP Only)**:
  - [ ] Bound to `127.0.0.1` locally.
  - [ ] Bearer token or OAuth authentication enforced.
  - [ ] CORS and Origin headers validated.

---

## 4. Production Release Checklist

- [ ] **Automated Protocol Test**: Verified via `verify_mcp_server.py` or MCP Inspector (`npx @modelcontextprotocol/inspector`).
- [ ] **Stdio Pipe Verification**: Raw JSON-RPC pipe test returns valid single-line JSON without stdout corruption.
- [ ] **Host Configuration Verified**: Absolute file paths used in client configuration files (`claude_desktop_config.json`, `mcp_config.json`).
- [ ] **Environment Variables Declared**: Client configuration explicitly injects all required environment keys into subprocess `env`.
- [ ] **Containerization (If Cloud)**: Multi-stage Dockerfile running as non-root user with health check endpoint.
- [ ] **Documentation**: `README.md` includes installation instructions, tool documentation, and example client configurations.
